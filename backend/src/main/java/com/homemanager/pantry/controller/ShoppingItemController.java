package com.homemanager.pantry.controller;

import com.homemanager.pantry.model.ShoppingItem;
import com.homemanager.pantry.repository.ShoppingItemRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Shared shopping list API.
 */
@RestController
@RequestMapping("/api/shopping-items")
public class ShoppingItemController {

    private final ShoppingItemRepository repository;

    public ShoppingItemController(ShoppingItemRepository repository) {
        this.repository = repository;
    }

    /** List the items (still-to-buy first). */
    @GetMapping
    public List<ShoppingItem> list() {
        return repository.findAllByOrderByPurchasedAscCreatedAtAsc();
    }

    /** Adds an item to the list. */
    @PostMapping
    public ShoppingItem add(@Valid @RequestBody ShoppingItem item) {
        item.setId(null);
        return repository.save(item);
    }

    /** Updates an item (e.g. mark as "purchased"). */
    @PutMapping("/{id}")
    public ResponseEntity<ShoppingItem> update(@PathVariable Long id,
                                               @Valid @RequestBody ShoppingItem data) {
        return repository.findById(id)
                .map(i -> {
                    i.setName(data.getName());
                    i.setQuantity(data.getQuantity());
                    i.setPurchased(data.isPurchased());
                    i.setAddedBy(data.getAddedBy());
                    return ResponseEntity.ok(repository.save(i));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /** Removes an item from the list. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
