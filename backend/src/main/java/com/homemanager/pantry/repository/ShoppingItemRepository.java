package com.homemanager.pantry.repository;

import com.homemanager.pantry.model.ShoppingItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Access to shopping list items. Spring generates the implementation.
 */
public interface ShoppingItemRepository extends JpaRepository<ShoppingItem, Long> {

    /** Items ordered: still-to-buy first, then by creation time. */
    List<ShoppingItem> findAllByOrderByPurchasedAscCreatedAtAsc();
}
