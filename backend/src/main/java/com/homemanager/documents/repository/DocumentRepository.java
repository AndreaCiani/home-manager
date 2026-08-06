package com.homemanager.documents.repository;

import com.homemanager.documents.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Access to documents, scoped to a family. Spring generates the implementation.
 */
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByFamilyIdOrderByCreatedAtDesc(Long familyId);
}
