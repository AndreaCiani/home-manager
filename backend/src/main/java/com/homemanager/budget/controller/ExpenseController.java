package com.homemanager.budget.controller;

import com.homemanager.budget.dto.ExpenseSummary;
import com.homemanager.budget.dto.ExpenseSummary.CategoryTotal;
import com.homemanager.budget.model.Expense;
import com.homemanager.budget.model.ExpenseCategory;
import com.homemanager.budget.repository.ExpenseRepository;
import com.homemanager.family.model.User;
import com.homemanager.family.repository.UserRepository;
import com.homemanager.family.security.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Household Budget API, scoped to the authenticated user's family: expenses
 * CRUD plus a monthly summary (total and per-category breakdown).
 */
@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseRepository repository;
    private final UserRepository users;
    private final CurrentUserService currentUser;

    public ExpenseController(ExpenseRepository repository, UserRepository users, CurrentUserService currentUser) {
        this.repository = repository;
        this.users = users;
        this.currentUser = currentUser;
    }

    /** All expenses for the current family, most recent first. */
    @GetMapping
    public List<Expense> list() {
        return repository.findByFamilyIdOrderByDateDescCreatedAtDesc(currentUser.requireFamilyId());
    }

    /** Monthly summary (default current month); month format: yyyy-MM. */
    @GetMapping("/summary")
    public ExpenseSummary summary(@RequestParam(required = false) String month) {
        YearMonth ym;
        try {
            ym = (month == null || month.isBlank()) ? YearMonth.now() : YearMonth.parse(month);
        } catch (DateTimeParseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid month (expected yyyy-MM)");
        }
        List<Expense> list = repository.findByFamilyIdAndDateBetweenOrderByDateDescCreatedAtDesc(
                currentUser.requireFamilyId(), ym.atDay(1), ym.atEndOfMonth());

        BigDecimal total = list.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<ExpenseCategory, BigDecimal> byCat = new EnumMap<>(ExpenseCategory.class);
        for (Expense e : list) {
            byCat.merge(e.getCategory(), e.getAmount(), BigDecimal::add);
        }
        List<CategoryTotal> byCategory = byCat.entrySet().stream()
                .map(en -> new CategoryTotal(en.getKey().name(), en.getValue()))
                .sorted(Comparator.comparing(CategoryTotal::total).reversed())
                .toList();
        return new ExpenseSummary(ym.toString(), total, byCategory);
    }

    @PostMapping
    public Expense add(@Valid @RequestBody Expense expense) {
        Long familyId = currentUser.require().getFamily().getId();
        expense.setId(null);
        expense.setFamily(currentUser.require().getFamily());
        applyPaidBy(expense, expense.getPaidByUserId(), familyId);
        return repository.save(expense);
    }

    @PutMapping("/{id}")
    public Expense update(@PathVariable Long id, @Valid @RequestBody Expense data) {
        Expense e = requireOwned(id);
        e.setDescription(data.getDescription());
        e.setAmount(data.getAmount());
        e.setCategory(data.getCategory());
        e.setDate(data.getDate());
        applyPaidBy(e, data.getPaidByUserId(), e.getFamily().getId());
        return repository.save(e);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(@PathVariable Long id) {
        repository.delete(requireOwned(id));
        return ResponseEntity.noContent().build();
    }

    private void applyPaidBy(Expense expense, Long paidByUserId, Long familyId) {
        if (paidByUserId == null) {
            expense.setPaidByUserId(null);
            expense.setPaidByName(null);
            return;
        }
        User payer = users.findById(paidByUserId)
                .filter(u -> u.getFamily().getId().equals(familyId))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Payer is not a member of your family"));
        expense.setPaidByUserId(payer.getId());
        expense.setPaidByName(payer.getDisplayName());
    }

    private Expense requireOwned(Long id) {
        Long familyId = currentUser.requireFamilyId();
        return repository.findById(id)
                .filter(e -> e.getFamily().getId().equals(familyId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}
