package com.homemanager.pantry.controller;

import com.homemanager.pantry.model.Product;
import com.homemanager.pantry.repository.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Pantry API: list products, add, edit, remove,
 * and the "expiring" view.
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository repository;

    public ProductController(ProductRepository repository) {
        this.repository = repository;
    }

    /** Full pantry list. */
    @GetMapping
    public List<Product> list() {
        return repository.findAll();
    }

    /** Products expiring within N days (default 7). */
    @GetMapping("/expiring")
    public List<Product> expiring(@RequestParam(defaultValue = "7") int days) {
        return repository.findByExpiryDateLessThanEqualOrderByExpiryDateAsc(
                LocalDate.now().plusDays(days));
    }

    /** Adds a product. */
    @PostMapping
    public Product add(@Valid @RequestBody Product product) {
        product.setId(null);
        return repository.save(product);
    }

    /** Updates an existing product. */
    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id,
                                          @Valid @RequestBody Product data) {
        return repository.findById(id)
                .map(p -> {
                    p.setName(data.getName());
                    p.setQuantity(data.getQuantity());
                    p.setUnit(data.getUnit());
                    p.setCategory(data.getCategory());
                    p.setExpiryDate(data.getExpiryDate());
                    return ResponseEntity.ok(repository.save(p));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /** Removes a product. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
