package com.homemanager.documents.controller;

import com.homemanager.documents.model.Document;
import com.homemanager.documents.model.DocumentCategory;
import com.homemanager.documents.repository.DocumentRepository;
import com.homemanager.documents.service.DocumentStorageService;
import com.homemanager.family.model.User;
import com.homemanager.family.security.CurrentUserService;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Set;

/**
 * Documents & Maintenance API, scoped to the authenticated user's family:
 * list metadata, upload a file, download it, edit metadata, and remove.
 */
@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    /** Accepted upload content types. */
    private static final Set<String> ALLOWED_TYPES =
            Set.of("application/pdf", "image/png", "image/jpeg", "image/webp");

    private final DocumentRepository repository;
    private final DocumentStorageService storage;
    private final CurrentUserService currentUser;

    public DocumentController(DocumentRepository repository, DocumentStorageService storage,
                             CurrentUserService currentUser) {
        this.repository = repository;
        this.storage = storage;
        this.currentUser = currentUser;
    }

    /** Document metadata for the current family, most recent first. */
    @GetMapping
    public List<Document> list() {
        return repository.findByFamilyIdOrderByCreatedAtDesc(currentUser.requireFamilyId());
    }

    /** Uploads a file with its metadata. */
    @PostMapping
    public Document upload(@RequestParam String name,
                           @RequestParam(required = false) String category,
                           @RequestParam(required = false) String expiryDate,
                           @RequestParam(required = false) String notes,
                           @RequestPart("file") MultipartFile file) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A name is required");
        }
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A file is required");
        }
        if (file.getContentType() == null || !ALLOWED_TYPES.contains(file.getContentType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Unsupported file type (allowed: PDF, PNG, JPEG, WEBP)");
        }

        User me = currentUser.require();
        String stored = storage.store(me.getFamily().getId(), file);

        Document doc = new Document();
        doc.setName(name.trim());
        doc.setCategory(parseCategory(category));
        doc.setExpiryDate(parseDate(expiryDate));
        doc.setNotes(notes != null && !notes.isBlank() ? notes.trim() : null);
        doc.setOriginalFilename(file.getOriginalFilename());
        doc.setContentType(file.getContentType());
        doc.setSizeBytes(file.getSize());
        doc.setStoredFilename(stored);
        doc.setFamily(me.getFamily());
        return repository.save(doc);
    }

    /** Streams the stored file back with its original name. */
    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        Document doc = requireOwned(id);
        Resource resource = storage.load(doc.getFamily().getId(), doc.getStoredFilename());
        if (!resource.exists()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(doc.getOriginalFilename() != null ? doc.getOriginalFilename() : "document")
                .build();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                        doc.getContentType() != null ? doc.getContentType() : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(resource);
    }

    /** Updates metadata only (not the file). */
    @PutMapping("/{id}")
    public Document updateMetadata(@PathVariable Long id, @RequestBody Document data) {
        Document doc = requireOwned(id);
        if (data.getName() != null && !data.getName().isBlank()) {
            doc.setName(data.getName().trim());
        }
        if (data.getCategory() != null) {
            doc.setCategory(data.getCategory());
        }
        doc.setExpiryDate(data.getExpiryDate());
        doc.setNotes(data.getNotes());
        return repository.save(doc);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(@PathVariable Long id) {
        Document doc = requireOwned(id);
        storage.delete(doc.getFamily().getId(), doc.getStoredFilename());
        repository.delete(doc);
        return ResponseEntity.noContent().build();
    }

    private DocumentCategory parseCategory(String category) {
        if (category == null || category.isBlank()) {
            return DocumentCategory.OTHER;
        }
        try {
            return DocumentCategory.valueOf(category.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid category");
        }
    }

    private LocalDate parseDate(String date) {
        if (date == null || date.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(date.trim());
        } catch (DateTimeParseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid date (expected yyyy-MM-dd)");
        }
    }

    private Document requireOwned(Long id) {
        Long familyId = currentUser.requireFamilyId();
        return repository.findById(id)
                .filter(d -> d.getFamily().getId().equals(familyId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}
