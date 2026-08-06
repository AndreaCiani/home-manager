package com.homemanager.bills.controller;

import com.homemanager.bills.model.Deadline;
import com.homemanager.bills.model.Recurrence;
import com.homemanager.bills.repository.DeadlineRepository;
import com.homemanager.family.security.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

/**
 * Deadlines & Bills API, scoped to the authenticated user's family:
 * list, upcoming view, CRUD, and "mark as paid" (which rolls recurring
 * deadlines forward to their next occurrence).
 */
@RestController
@RequestMapping("/api/deadlines")
public class DeadlineController {

    private final DeadlineRepository repository;
    private final CurrentUserService currentUser;

    public DeadlineController(DeadlineRepository repository, CurrentUserService currentUser) {
        this.repository = repository;
        this.currentUser = currentUser;
    }

    /** All deadlines for the current family, soonest first. */
    @GetMapping
    public List<Deadline> list() {
        return repository.findByFamilyIdOrderByDueDateAsc(currentUser.requireFamilyId());
    }

    /** Unpaid deadlines due within N days (default 30), including overdue ones. */
    @GetMapping("/upcoming")
    public List<Deadline> upcoming(@RequestParam(defaultValue = "30") int days) {
        return repository.findByFamilyIdAndPaidFalseAndDueDateLessThanEqualOrderByDueDateAsc(
                currentUser.requireFamilyId(), LocalDate.now().plusDays(days));
    }

    /** Adds a deadline to the current family. */
    @PostMapping
    public Deadline add(@Valid @RequestBody Deadline deadline) {
        deadline.setId(null);
        deadline.setFamily(currentUser.require().getFamily());
        return repository.save(deadline);
    }

    /** Updates a deadline owned by the current family. */
    @PutMapping("/{id}")
    public Deadline update(@PathVariable Long id, @Valid @RequestBody Deadline data) {
        Deadline d = requireOwned(id);
        d.setTitle(data.getTitle());
        d.setAmount(data.getAmount());
        d.setDueDate(data.getDueDate());
        d.setCategory(data.getCategory());
        d.setRecurrence(data.getRecurrence());
        d.setPaid(data.isPaid());
        d.setNotes(data.getNotes());
        return repository.save(d);
    }

    /**
     * Marks a deadline as handled. A recurring deadline instead rolls forward to
     * its next occurrence (and stays unpaid); a one-off is simply marked paid.
     */
    @PostMapping("/{id}/pay")
    public Deadline pay(@PathVariable Long id) {
        Deadline d = requireOwned(id);
        if (d.getRecurrence() == Recurrence.NONE) {
            d.setPaid(true);
        } else {
            d.setDueDate(nextOccurrence(d.getDueDate(), d.getRecurrence()));
            d.setPaid(false);
        }
        return repository.save(d);
    }

    /** Removes a deadline owned by the current family. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(@PathVariable Long id) {
        repository.delete(requireOwned(id));
        return ResponseEntity.noContent().build();
    }

    private LocalDate nextOccurrence(LocalDate from, Recurrence recurrence) {
        return switch (recurrence) {
            case MONTHLY -> from.plusMonths(1);
            case YEARLY -> from.plusYears(1);
            case NONE -> from;
        };
    }

    private Deadline requireOwned(Long id) {
        Long familyId = currentUser.requireFamilyId();
        return repository.findById(id)
                .filter(d -> d.getFamily().getId().equals(familyId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}
