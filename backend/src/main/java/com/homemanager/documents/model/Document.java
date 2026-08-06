package com.homemanager.documents.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.homemanager.family.model.Family;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.time.LocalDate;

/**
 * A stored household document (with an uploaded file) plus optional
 * renewal/maintenance date. Module 6 — Documents & Maintenance.
 */
@Entity
@Table(name = "document")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentCategory category = DocumentCategory.OTHER;

    /** Optional renewal / maintenance date. */
    private LocalDate expiryDate;

    private String notes;

    // --- File metadata ---
    private String originalFilename;
    private String contentType;
    private long sizeBytes;

    /** Internal storage name on disk (never exposed). */
    @JsonIgnore
    @Column(nullable = false)
    private String storedFilename;

    /** The family this document belongs to (scoped per household). */
    @ManyToOne(optional = false)
    @JoinColumn(name = "family_id", nullable = false)
    private Family family;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // --- Getters / Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public DocumentCategory getCategory() { return category; }
    public void setCategory(DocumentCategory category) { this.category = category; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getOriginalFilename() { return originalFilename; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public long getSizeBytes() { return sizeBytes; }
    public void setSizeBytes(long sizeBytes) { this.sizeBytes = sizeBytes; }

    @JsonIgnore
    public String getStoredFilename() { return storedFilename; }
    public void setStoredFilename(String storedFilename) { this.storedFilename = storedFilename; }

    @JsonIgnore
    public Family getFamily() { return family; }
    public void setFamily(Family family) { this.family = family; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
