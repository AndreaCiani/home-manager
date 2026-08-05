package com.homemanager.pantry.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * An item on the shared shopping list.
 * Module 1 — Shopping & Pantry.
 */
@Entity
@Table(name = "shopping_item")
public class ShoppingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    private BigDecimal quantity;

    /** true = already bought/picked up. */
    @Column(nullable = false)
    private boolean purchased = false;

    /** Who added it (temporary, pending the Users & Family module). */
    private String addedBy;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // --- Getters / Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

    public boolean isPurchased() { return purchased; }
    public void setPurchased(boolean purchased) { this.purchased = purchased; }

    public String getAddedBy() { return addedBy; }
    public void setAddedBy(String addedBy) { this.addedBy = addedBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
