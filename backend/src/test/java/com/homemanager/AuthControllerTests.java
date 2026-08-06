package com.homemanager;

import com.homemanager.family.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerTests extends AbstractApiTest {

    private static final MediaType JSON = MediaType.APPLICATION_JSON;

    @Test
    void register_createsHousehold_asAdmin() throws Exception {
        mvc.perform(post("/api/auth/register").with(csrf()).contentType(JSON).content("""
                        {"email":"anna@a.com","password":"password123","displayName":"Anna","familyName":"Casa A"}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.familyName").value("Casa A"));
        assertThat(users.findByEmail("anna@a.com")).isPresent();
    }

    @Test
    void register_join_withValidInviteCode_asMember() throws Exception {
        String code = registerHousehold("anna@a.com", "Anna", "Casa A");
        mvc.perform(post("/api/auth/register").with(csrf()).contentType(JSON).content("""
                        {"email":"bob@a.com","password":"password123","displayName":"Bob","inviteCode":"%s"}"""
                        .formatted(code)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("MEMBER"))
                .andExpect(jsonPath("$.familyName").value("Casa A"));
    }

    @Test
    void register_withInvalidInviteCode_isBadRequest() throws Exception {
        mvc.perform(post("/api/auth/register").with(csrf()).contentType(JSON).content("""
                        {"email":"bob@a.com","password":"password123","displayName":"Bob","inviteCode":"NOPE0000"}"""))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_duplicateEmail_isConflict() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");
        mvc.perform(post("/api/auth/register").with(csrf()).contentType(JSON).content("""
                        {"email":"anna@a.com","password":"password123","displayName":"Anna2","familyName":"Casa B"}"""))
                .andExpect(status().isConflict());
    }

    @Test
    void register_withoutCsrf_isRejected() throws Exception {
        // CSRF protection blocks the mutation (rejected before the controller runs);
        // the exact 4xx status depends on anonymous resolution, so assert the effect.
        mvc.perform(post("/api/auth/register").contentType(JSON).content("""
                        {"email":"anna@a.com","password":"password123","displayName":"Anna","familyName":"Casa A"}"""))
                .andExpect(status().is4xxClientError());
        assertThat(users.findByEmail("anna@a.com")).isEmpty();
    }

    @Test
    void login_withCorrectPassword_ok_andWrongPassword_unauthorized() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");

        mvc.perform(post("/api/auth/login").with(csrf()).contentType(JSON).content("""
                        {"email":"anna@a.com","password":"password123"}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("anna@a.com"));

        mvc.perform(post("/api/auth/login").with(csrf()).contentType(JSON).content("""
                        {"email":"anna@a.com","password":"wrong-password"}"""))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void me_requiresAuthentication() throws Exception {
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());

        registerHousehold("anna@a.com", "Anna", "Casa A");
        mvc.perform(get("/api/auth/me").with(user("anna@a.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("anna@a.com"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void changePassword_wrongCurrent_badRequest_thenCorrect_updatesHash() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");

        mvc.perform(post("/api/auth/change-password").with(user("anna@a.com")).with(csrf())
                        .contentType(JSON).content("""
                        {"currentPassword":"wrong","newPassword":"newpass123"}"""))
                .andExpect(status().isBadRequest());

        mvc.perform(post("/api/auth/change-password").with(user("anna@a.com")).with(csrf())
                        .contentType(JSON).content("""
                        {"currentPassword":"password123","newPassword":"newpass123"}"""))
                .andExpect(status().isNoContent());

        User anna = users.findByEmail("anna@a.com").orElseThrow();
        assertThat(encoder.matches("newpass123", anna.getPasswordHash())).isTrue();
    }

    @Test
    void logout_returnsNoContent() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");
        mvc.perform(post("/api/auth/logout").with(user("anna@a.com")).with(csrf()))
                .andExpect(status().isNoContent());
    }
}
