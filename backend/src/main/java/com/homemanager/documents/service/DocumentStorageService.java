package com.homemanager.documents.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * Stores uploaded document files on the filesystem, one subfolder per family.
 * Files are named with a generated UUID (never the client's filename), so the
 * client can't influence the storage path.
 */
@Service
public class DocumentStorageService {

    private final Path baseDir;

    public DocumentStorageService(@Value("${app.storage.dir:/data/documents}") String dir) {
        this.baseDir = Paths.get(dir);
    }

    /** Saves the content under the family's folder and returns its stored name. */
    public String store(Long familyId, byte[] content) {
        try {
            Path dir = baseDir.resolve(String.valueOf(familyId));
            Files.createDirectories(dir);
            String stored = UUID.randomUUID().toString();
            Files.write(dir.resolve(stored), content);
            return stored;
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    public Resource load(Long familyId, String storedFilename) {
        return new FileSystemResource(baseDir.resolve(String.valueOf(familyId)).resolve(storedFilename));
    }

    public void delete(Long familyId, String storedFilename) {
        try {
            Files.deleteIfExists(baseDir.resolve(String.valueOf(familyId)).resolve(storedFilename));
        } catch (IOException ignored) {
            // best-effort cleanup
        }
    }
}
