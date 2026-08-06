package com.homemanager.budget.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.homemanager.family.model.Family;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * A household expense. Module 5 — Household Budget.
 */
@Entity
@Table(name = "expense")
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String description;

    @NotNull
    @Positive
    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseCategory category = ExpenseCategory.OTHER;

    @NotNull
    @Column(nullable = false)
    private LocalDate date;

    /** Who paid (denormalized member id + name; no FK so member removal stays simple). */
    private Long paidByUserId;
    private String paidByName;

    /** The family this expense belongs to (scoped per household). */
    @ManyToOne(optional = false)
    @JoinColumn(name = "family_id", nullable = false)
    private Family family;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // --- Getters / Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public ExpenseCategory getCategory() { return category; }
    public void setCategory(ExpenseCategory category) { this.category = category; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Long getPaidByUserId() { return paidByUserId; }
    public void setPaidByUserId(Long paidByUserId) { this.paidByUserId = paidByUserId; }

    public String getPaidByName() { return paidByName; }
    public void setPaidByName(String paidByName) { this.paidByName = paidByName; }

    @JsonIgnore
    public Family getFamily() { return family; }
    public void setFamily(Family family) { this.family = family; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
