package com.homemanager.chores.repository;

import com.homemanager.chores.model.Chore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Access to chores, scoped to a family. Spring generates the implementation.
 */
public interface ChoreRepository extends JpaRepository<Chore, Long> {

    /** All chores of a family (open first, then by creation time). */
    List<Chore> findByFamilyIdOrderByDoneAscCreatedAtAsc(Long familyId);
}
