package com.homemanager.chores.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.homemanager.family.model.Family;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.time.LocalDate;

/**
 * A household chore, optionally assigned to a family member and optionally
 * recurring. Module 4 — Household Chores.
 */
@Entity
@Table(name = "chore")
public class Chore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String title;

    /** Assigned family member (denormalized; no FK so member removal stays simple). */
    private Long assigneeUserId;
    private String assigneeName;

    /** Optional due date. */
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChoreRecurrence recurrence = ChoreRecurrence.NONE;

    @Column(nullable = false)
    private boolean done = false;

    /** The family this chore belongs to (scoped per household). */
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

    public Long getAssigneeUserId() { return assigneeUserId; }
    public void setAssigneeUserId(Long assigneeUserId) { this.assigneeUserId = assigneeUserId; }

    public String getAssigneeName() { return assigneeName; }
    public void setAssigneeName(String assigneeName) { this.assigneeName = assigneeName; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public ChoreRecurrence getRecurrence() { return recurrence; }
    public void setRecurrence(ChoreRecurrence recurrence) { this.recurrence = recurrence; }

    public boolean isDone() { return done; }
    public void setDone(boolean done) { this.done = done; }

    @JsonIgnore
    public Family getFamily() { return family; }
    public void setFamily(Family family) { this.family = family; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
