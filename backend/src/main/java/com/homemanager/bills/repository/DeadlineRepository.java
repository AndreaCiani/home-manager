package com.homemanager.bills.repository;

import com.homemanager.bills.model.Deadline;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

/**
 * Access to deadlines, scoped to a family. Spring generates the implementation.
 */
public interface DeadlineRepository extends JpaRepository<Deadline, Long> {

    /** All deadlines of a family, soonest first. */
    List<Deadline> findByFamilyIdOrderByDueDateAsc(Long familyId);

    /** Unpaid deadlines of a family due on or before a date (includes overdue), soonest first. */
    List<Deadline> findByFamilyIdAndPaidFalseAndDueDateLessThanEqualOrderByDueDateAsc(
            Long familyId, LocalDate limit);
}
