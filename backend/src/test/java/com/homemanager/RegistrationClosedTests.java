package com.homemanager;

import com.homemanager.family.model.Family;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@TestPropertySource(properties = "app.registration.open=false")
class RegistrationClosedTests extends AbstractApiTest {

    private static final MediaType JSON = MediaType.APPLICATION_JSON;

    @Test
    void configReportsRegistrationClosed() throws Exception {
        mvc.perform(get("/api/auth/config"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.registrationOpen").value(false));
    }

    @Test
    void firstAccountBootstrapsEvenWhenClosed() throws Exception {
        mvc.perform(post("/api/auth/register").with(csrf()).contentType(JSON).content("""
                        {"email":"anna@a.com","password":"password123","displayName":"Anna","familyName":"Casa A"}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void creatingASecondHouseholdIsForbidden() throws Exception {
        // The first account bootstraps the household…
        mvc.perform(post("/api/auth/register").with(csrf()).contentType(JSON).content("""
                        {"email":"anna@a.com","password":"password123","displayName":"Anna","familyName":"Casa A"}"""))
                .andExpect(status().isCreated());
        // …but a second, unrelated household cannot be created.
        mvc.perform(post("/api/auth/register").with(csrf()).contentType(JSON).content("""
                        {"email":"carol@b.com","password":"password123","displayName":"Carol","familyName":"Casa B"}"""))
                .andExpect(status().isForbidden());
    }

    @Test
    void joiningWithAnInviteCodeStillWorks() throws Exception {
        Family family = new Family();
        family.setName("Casa Rossi");
        family.setInviteCode("JOINME12");
        families.save(family);

        mvc.perform(post("/api/auth/register").with(csrf()).contentType(JSON).content("""
                        {"email":"bob@a.com","password":"password123","displayName":"Bob","inviteCode":"JOINME12"}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("MEMBER"));
    }
}
