package com.homemanager.pantry.repository;

import com.homemanager.pantry.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

/**
 * Access to pantry products. Spring generates the implementation.
 */
public interface ProductRepository extends JpaRepository<Product, Long> {

    /** Products expiring on or before a given date, ordered by expiry. */
    List<Product> findByExpiryDateLessThanEqualOrderByExpiryDateAsc(LocalDate limit);
}
