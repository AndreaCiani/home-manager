package com.homemanager.family.repository;

import com.homemanager.family.model.Family;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Access to families. Spring generates the implementation.
 */
public interface FamilyRepository extends JpaRepository<Family, Long> {

    Optional<Family> findByInviteCode(String inviteCode);

    boolean existsByInviteCode(String inviteCode);
}
