package com.homemanager;

import com.homemanager.chores.model.Chore;
import com.homemanager.chores.repository.ChoreRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ChoreTests extends AbstractApiTest {

    private static final MediaType JSON = MediaType.APPLICATION_JSON;

    @Autowired
    private ChoreRepository chores;

    private void addChore(String user, String body) throws Exception {
        mvc.perform(post("/api/chores").with(user(user)).with(csrf()).contentType(JSON).content(body))
                .andExpect(status().isOk());
    }

    @Test
    void choresAreScopedPerFamily() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");
        registerHousehold("carol@b.com", "Carol", "Casa B");
        addChore("anna@a.com", """
                {"title":"Take out the trash","recurrence":"NONE"}""");

        mvc.perform(get("/api/chores").with(user("anna@a.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Take out the trash"))
                .andExpect(jsonPath("$[0].family").doesNotExist());

        mvc.perform(get("/api/chores").with(user("carol@b.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void canAssignToFamilyMemberButNotToOutsider() throws Exception {
        String code = registerHousehold("anna@a.com", "Anna", "Casa A");
        joinHousehold("bob@a.com", "Bob", code);
        registerHousehold("carol@b.com", "Carol", "Casa B");
        long bob = userId("bob@a.com");
        long carol = userId("carol@b.com");

        mvc.perform(post("/api/chores").with(user("anna@a.com")).with(csrf()).contentType(JSON)
                        .content("{\"title\":\"Dishes\",\"assigneeUserId\":" + bob + ",\"recurrence\":\"NONE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assigneeName").value("Bob"));

        // Assigning to someone from another family is rejected
        mvc.perform(post("/api/chores").with(user("anna@a.com")).with(csrf()).contentType(JSON)
                        .content("{\"title\":\"Dishes\",\"assigneeUserId\":" + carol + ",\"recurrence\":\"NONE\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void cannotUpdateOrDeleteAnotherFamilysChore() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");
        registerHousehold("carol@b.com", "Carol", "Casa B");
        addChore("anna@a.com", """
                {"title":"Mow the lawn","recurrence":"NONE"}""");
        long id = chores.findAll().get(0).getId();

        mvc.perform(put("/api/chores/" + id).with(user("carol@b.com")).with(csrf()).contentType(JSON)
                        .content("""
                                {"title":"Hacked","recurrence":"NONE"}"""))
                .andExpect(status().isNotFound());
        mvc.perform(delete("/api/chores/" + id).with(user("carol@b.com")).with(csrf()))
                .andExpect(status().isNotFound());
        mvc.perform(post("/api/chores/" + id + "/done").with(user("carol@b.com")).with(csrf()))
                .andExpect(status().isNotFound());
    }

    @Test
    void markDoneOneOff_setsDone() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");
        addChore("anna@a.com", """
                {"title":"Fix the shelf","recurrence":"NONE"}""");
        long id = chores.findAll().get(0).getId();

        mvc.perform(post("/api/chores/" + id + "/done").with(user("anna@a.com")).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.done").value(true));
    }

    @Test
    void markDoneRecurring_rollsForwardAndStaysOpen() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");
        addChore("anna@a.com", """
                {"title":"Vacuum","dueDate":"2026-01-15","recurrence":"WEEKLY"}""");
        long id = chores.findAll().get(0).getId();

        mvc.perform(post("/api/chores/" + id + "/done").with(user("anna@a.com")).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.done").value(false))
                .andExpect(jsonPath("$.dueDate").value("2026-01-22"));

        Chore c = chores.findById(id).orElseThrow();
        assertThat(c.getDueDate()).isEqualTo(LocalDate.of(2026, 1, 22));
        assertThat(c.isDone()).isFalse();
    }

    @Test
    void listRequiresAuthentication() throws Exception {
        mvc.perform(get("/api/chores")).andExpect(status().isUnauthorized());
    }
}
