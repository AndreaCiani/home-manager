package com.homemanager.bills.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.homemanager.family.model.Family;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * A household deadline or bill (car tax, insurance, utility bill, inspection…),
 * optionally recurring. Module 3 — Deadlines & Bills.
 */
@Entity
@Table(name = "deadline")
public class Deadline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String title;

    /** Amount due (optional — some deadlines aren't a payment). */
    private BigDecimal amount;

    @NotNull
    @Column(nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeadlineCategory category = DeadlineCategory.OTHER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Recurrence recurrence = Recurrence.NONE;

    /** true = handled/paid (only meaningful for one-off deadlines). */
    @Column(nullable = false)
    private boolean paid = false;

    private String notes;

    /** The family this deadline belongs to (scoped per household). */
    @ManyToOne(optional = false)
    @JoinColumn(name = "family_id", nullable = false)
    private Family family;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // --- Getters / Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public DeadlineCategory getCategory() { return category; }
    public void setCategory(DeadlineCategory category) { this.category = category; }

    public Recurrence getRecurrence() { return recurrence; }
    public void setRecurrence(Recurrence recurrence) { this.recurrence = recurrence; }

    public boolean isPaid() { return paid; }
    public void setPaid(boolean paid) { this.paid = paid; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    @JsonIgnore
    public Family getFamily() { return family; }
    public void setFamily(Family family) { this.family = family; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
