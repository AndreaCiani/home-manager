package com.homemanager.family.repository;

import com.homemanager.family.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Access to users. Spring generates the implementation.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByFamilyIdOrderByCreatedAtAsc(Long familyId);
}
