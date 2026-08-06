package com.homemanager.pantry.controller;

import com.homemanager.family.model.User;
import com.homemanager.family.security.CurrentUserService;
import com.homemanager.pantry.model.ShoppingItem;
import com.homemanager.pantry.repository.ShoppingItemRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Shared shopping list API, scoped to the authenticated user's family.
 */
@RestController
@RequestMapping("/api/shopping-items")
public class ShoppingItemController {

    private final ShoppingItemRepository repository;
    private final CurrentUserService currentUser;

    public ShoppingItemController(ShoppingItemRepository repository, CurrentUserService currentUser) {
        this.repository = repository;
        this.currentUser = currentUser;
    }

    /** List the current family's items (still-to-buy first). */
    @GetMapping
    public List<ShoppingItem> list() {
        return repository.findByFamilyIdOrderByPurchasedAscCreatedAtAsc(currentUser.requireFamilyId());
    }

    /** Adds an item to the current family's list, tagged with who added it. */
    @PostMapping
    public ShoppingItem add(@Valid @RequestBody ShoppingItem item) {
        User me = currentUser.require();
        item.setId(null);
        item.setFamily(me.getFamily());
        item.setAddedBy(me.getDisplayName());
        return repository.save(item);
    }

    /** Updates an item owned by the current family (e.g. mark as "purchased"). */
    @PutMapping("/{id}")
    public ShoppingItem update(@PathVariable Long id, @Valid @RequestBody ShoppingItem data) {
        ShoppingItem item = requireOwned(id);
        item.setName(data.getName());
        item.setQuantity(data.getQuantity());
        item.setPurchased(data.isPurchased());
        return repository.save(item);
    }

    /** Removes an item owned by the current family. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(@PathVariable Long id) {
        repository.delete(requireOwned(id));
        return ResponseEntity.noContent().build();
    }

    /** Loads an item and ensures it belongs to the current family, else 404. */
    private ShoppingItem requireOwned(Long id) {
        Long familyId = currentUser.requireFamilyId();
        return repository.findById(id)
                .filter(i -> i.getFamily().getId().equals(familyId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}
