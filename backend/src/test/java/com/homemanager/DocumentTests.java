package com.homemanager;

import com.homemanager.documents.repository.DocumentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockMultipartFile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class DocumentTests extends AbstractApiTest {

    @Autowired
    private DocumentRepository documents;

    private MockMultipartFile pdf() {
        return new MockMultipartFile("file", "passport.pdf", "application/pdf", "PDF-CONTENT".getBytes());
    }

    @Test
    void uploadAndListScopedPerFamily() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");
        registerHousehold("carol@b.com", "Carol", "Casa B");

        mvc.perform(multipart("/api/documents").file(pdf())
                        .param("name", "Passport").param("category", "IDENTITY")
                        .with(user("anna@a.com")).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Passport"))
                .andExpect(jsonPath("$.contentType").value("application/pdf"))
                .andExpect(jsonPath("$.originalFilename").value("passport.pdf"))
                .andExpect(jsonPath("$.storedFilename").doesNotExist())
                .andExpect(jsonPath("$.family").doesNotExist());

        mvc.perform(get("/api/documents").with(user("anna@a.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mvc.perform(get("/api/documents").with(user("carol@b.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void downloadReturnsTheStoredFile() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");
        mvc.perform(multipart("/api/documents").file(pdf()).param("name", "Passport")
                        .with(user("anna@a.com")).with(csrf()))
                .andExpect(status().isOk());
        long id = documents.findAll().get(0).getId();

        mvc.perform(get("/api/documents/" + id + "/file").with(user("anna@a.com")))
                .andExpect(status().isOk())
                .andExpect(content().bytes("PDF-CONTENT".getBytes()))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, containsString("passport.pdf")));
    }

    @Test
    void rejectsUnsupportedFileType() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");
        MockMultipartFile txt = new MockMultipartFile("file", "note.txt", "text/plain", "hi".getBytes());
        mvc.perform(multipart("/api/documents").file(txt).param("name", "Note")
                        .with(user("anna@a.com")).with(csrf()))
                .andExpect(status().isBadRequest());
        assertThat(documents.findAll()).isEmpty();
    }

    @Test
    void cannotDownloadOrDeleteAnotherFamilysDocument() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");
        registerHousehold("carol@b.com", "Carol", "Casa B");
        mvc.perform(multipart("/api/documents").file(pdf()).param("name", "Passport")
                        .with(user("anna@a.com")).with(csrf()))
                .andExpect(status().isOk());
        long id = documents.findAll().get(0).getId();

        mvc.perform(get("/api/documents/" + id + "/file").with(user("carol@b.com")))
                .andExpect(status().isNotFound());
        mvc.perform(delete("/api/documents/" + id).with(user("carol@b.com")).with(csrf()))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteRemovesDocument() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");
        mvc.perform(multipart("/api/documents").file(pdf()).param("name", "Passport")
                        .with(user("anna@a.com")).with(csrf()))
                .andExpect(status().isOk());
        long id = documents.findAll().get(0).getId();

        mvc.perform(delete("/api/documents/" + id).with(user("anna@a.com")).with(csrf()))
                .andExpect(status().isNoContent());
        assertThat(documents.findById(id)).isEmpty();
    }

    @Test
    void listRequiresAuthentication() throws Exception {
        mvc.perform(get("/api/documents")).andExpect(status().isUnauthorized());
    }
}
