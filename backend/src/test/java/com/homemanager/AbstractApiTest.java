package com.homemanager;

import com.homemanager.family.repository.FamilyRepository;
import com.homemanager.family.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Base for API integration tests: full context, MockMvc with Spring Security,
 * in-memory H2, and each test rolled back afterwards.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
abstract class AbstractApiTest {

    @Autowired
    protected MockMvc mvc;
    @Autowired
    protected UserRepository users;
    @Autowired
    protected FamilyRepository families;
    @Autowired
    protected PasswordEncoder encoder;

    /** Registers an admin who creates a new household; returns the family invite code. */
    protected String registerHousehold(String email, String displayName, String familyName) throws Exception {
        String body = """
                {"email":"%s","password":"password123","displayName":"%s","familyName":"%s"}
                """.formatted(email, displayName, familyName);
        mvc.perform(post("/api/auth/register").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());
        return users.findByEmail(email).orElseThrow().getFamily().getInviteCode();
    }

    /** Registers a member who joins an existing household via its invite code. */
    protected void joinHousehold(String email, String displayName, String inviteCode) throws Exception {
        String body = """
                {"email":"%s","password":"password123","displayName":"%s","inviteCode":"%s"}
                """.formatted(email, displayName, inviteCode);
        mvc.perform(post("/api/auth/register").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());
    }

    protected long userId(String email) {
        return users.findByEmail(email).orElseThrow().getId();
    }
}
