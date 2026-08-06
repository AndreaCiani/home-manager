package com.homemanager;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class FamilyManagementTests extends AbstractApiTest {

    private static final MediaType JSON = MediaType.APPLICATION_JSON;

    @Test
    void adminCanPromoteAndDemoteMember() throws Exception {
        String code = registerHousehold("anna@a.com", "Anna", "Casa A");
        joinHousehold("bob@a.com", "Bob", code);
        long bob = userId("bob@a.com");

        mvc.perform(put("/api/family/members/" + bob + "/role").with(user("anna@a.com")).with(csrf())
                        .contentType(JSON).content("""
                        {"role":"ADMIN"}"""))
                .andExpect(status().isOk());
        assertThat(users.findByEmail("bob@a.com").orElseThrow().getRole().name()).isEqualTo("ADMIN");

        mvc.perform(put("/api/family/members/" + bob + "/role").with(user("anna@a.com")).with(csrf())
                        .contentType(JSON).content("""
                        {"role":"MEMBER"}"""))
                .andExpect(status().isOk());
        assertThat(users.findByEmail("bob@a.com").orElseThrow().getRole().name()).isEqualTo("MEMBER");
    }

    @Test
    void cannotDemoteTheLastAdmin() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");
        long anna = userId("anna@a.com");

        mvc.perform(put("/api/family/members/" + anna + "/role").with(user("anna@a.com")).with(csrf())
                        .contentType(JSON).content("""
                        {"role":"MEMBER"}"""))
                .andExpect(status().isBadRequest());
        assertThat(users.findByEmail("anna@a.com").orElseThrow().getRole().name()).isEqualTo("ADMIN");
    }

    @Test
    void memberCannotManageOthers() throws Exception {
        String code = registerHousehold("anna@a.com", "Anna", "Casa A");
        joinHousehold("bob@a.com", "Bob", code);
        long anna = userId("anna@a.com");

        mvc.perform(delete("/api/family/members/" + anna).with(user("bob@a.com")).with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCannotRemoveThemselves() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");
        long anna = userId("anna@a.com");

        mvc.perform(delete("/api/family/members/" + anna).with(user("anna@a.com")).with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void adminRemovesMember() throws Exception {
        String code = registerHousehold("anna@a.com", "Anna", "Casa A");
        joinHousehold("bob@a.com", "Bob", code);
        long bob = userId("bob@a.com");

        mvc.perform(delete("/api/family/members/" + bob).with(user("anna@a.com")).with(csrf()))
                .andExpect(status().isOk());
        assertThat(users.findByEmail("bob@a.com")).isEmpty();
    }

    @Test
    void cannotManageMemberOfAnotherFamily() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");
        registerHousehold("carol@b.com", "Carol", "Casa B");
        long carol = userId("carol@b.com");

        mvc.perform(delete("/api/family/members/" + carol).with(user("anna@a.com")).with(csrf()))
                .andExpect(status().isNotFound());
    }

    @Test
    void inviteCodeVisibleToAdminButNotMember() throws Exception {
        String code = registerHousehold("anna@a.com", "Anna", "Casa A");
        joinHousehold("bob@a.com", "Bob", code);

        mvc.perform(get("/api/family").with(user("anna@a.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inviteCode").value(code))
                .andExpect(jsonPath("$.members.length()").value(2));

        mvc.perform(get("/api/family").with(user("bob@a.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inviteCode").isEmpty());
    }
}
