package com.homemanager.pantry.repository;

import com.homemanager.pantry.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

/**
 * Access to pantry products, scoped to a family. Spring generates the implementation.
 */
public interface ProductRepository extends JpaRepository<Product, Long> {

    /** All products of a family. */
    List<Product> findByFamilyId(Long familyId);

    /** Products of a family expiring on or before a given date, ordered by expiry. */
    List<Product> findByFamilyIdAndExpiryDateLessThanEqualOrderByExpiryDateAsc(Long familyId, LocalDate limit);
}
