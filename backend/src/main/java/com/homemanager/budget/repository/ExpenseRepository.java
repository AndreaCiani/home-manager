package com.homemanager.budget.repository;

import com.homemanager.budget.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

/**
 * Access to expenses, scoped to a family. Spring generates the implementation.
 */
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    /** All expenses of a family, most recent first. */
    List<Expense> findByFamilyIdOrderByDateDescCreatedAtDesc(Long familyId);

    /** Expenses of a family within a date range, most recent first (for monthly summaries). */
    List<Expense> findByFamilyIdAndDateBetweenOrderByDateDescCreatedAtDesc(
            Long familyId, LocalDate from, LocalDate to);
}
