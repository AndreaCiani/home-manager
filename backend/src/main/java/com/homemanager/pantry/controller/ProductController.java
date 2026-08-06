package com.homemanager.pantry.controller;

import com.homemanager.family.model.User;
import com.homemanager.family.security.CurrentUserService;
import com.homemanager.pantry.model.Product;
import com.homemanager.pantry.repository.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

/**
 * Pantry API, scoped to the authenticated user's family: list products, add,
 * edit, remove, and the "expiring" view.
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository repository;
    private final CurrentUserService currentUser;

    public ProductController(ProductRepository repository, CurrentUserService currentUser) {
        this.repository = repository;
        this.currentUser = currentUser;
    }

    /** Full pantry list for the current family. */
    @GetMapping
    public List<Product> list() {
        return repository.findByFamilyId(currentUser.requireFamilyId());
    }

    /** Products of the current family expiring within N days (default 7). */
    @GetMapping("/expiring")
    public List<Product> expiring(@RequestParam(defaultValue = "7") int days) {
        return repository.findByFamilyIdAndExpiryDateLessThanEqualOrderByExpiryDateAsc(
                currentUser.requireFamilyId(), LocalDate.now().plusDays(days));
    }

    /** Adds a product to the current family's pantry. */
    @PostMapping
    public Product add(@Valid @RequestBody Product product) {
        User me = currentUser.require();
        product.setId(null);
        product.setFamily(me.getFamily());
        return repository.save(product);
    }

    /** Updates a product owned by the current family. */
    @PutMapping("/{id}")
    public Product update(@PathVariable Long id, @Valid @RequestBody Product data) {
        Product p = requireOwned(id);
        p.setName(data.getName());
        p.setQuantity(data.getQuantity());
        p.setUnit(data.getUnit());
        p.setCategory(data.getCategory());
        p.setExpiryDate(data.getExpiryDate());
        return repository.save(p);
    }

    /** Removes a product owned by the current family. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(@PathVariable Long id) {
        repository.delete(requireOwned(id));
        return ResponseEntity.noContent().build();
    }

    /** Loads a product and ensures it belongs to the current family, else 404. */
    private Product requireOwned(Long id) {
        Long familyId = currentUser.requireFamilyId();
        return repository.findById(id)
                .filter(p -> p.getFamily().getId().equals(familyId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}
