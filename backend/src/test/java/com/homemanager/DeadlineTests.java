package com.homemanager;

import com.homemanager.bills.model.Deadline;
import com.homemanager.bills.repository.DeadlineRepository;
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

class DeadlineTests extends AbstractApiTest {

    private static final MediaType JSON = MediaType.APPLICATION_JSON;

    @Autowired
    private DeadlineRepository deadlines;

    private void addDeadline(String user, String body) throws Exception {
        mvc.perform(post("/api/deadlines").with(user(user)).with(csrf()).contentType(JSON).content(body))
                .andExpect(status().isOk());
    }

    @Test
    void deadlinesAreScopedPerFamily() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");
        registerHousehold("carol@b.com", "Carol", "Casa B");

        addDeadline("anna@a.com", """
                {"title":"Car tax","dueDate":"2026-09-01","category":"TAX","recurrence":"NONE"}""");

        mvc.perform(get("/api/deadlines").with(user("anna@a.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Car tax"))
                .andExpect(jsonPath("$[0].family").doesNotExist());

        mvc.perform(get("/api/deadlines").with(user("carol@b.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void cannotUpdateOrDeleteAnotherFamilysDeadline() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");
        registerHousehold("carol@b.com", "Carol", "Casa B");
        addDeadline("anna@a.com", """
                {"title":"Insurance","dueDate":"2026-09-01","category":"INSURANCE","recurrence":"NONE"}""");
        long id = deadlines.findAll().get(0).getId();

        mvc.perform(put("/api/deadlines/" + id).with(user("carol@b.com")).with(csrf()).contentType(JSON)
                        .content("""
                                {"title":"Hacked","dueDate":"2026-09-01","category":"OTHER","recurrence":"NONE"}"""))
                .andExpect(status().isNotFound());
        mvc.perform(delete("/api/deadlines/" + id).with(user("carol@b.com")).with(csrf()))
                .andExpect(status().isNotFound());
        mvc.perform(post("/api/deadlines/" + id + "/pay").with(user("carol@b.com")).with(csrf()))
                .andExpect(status().isNotFound());

        assertThat(deadlines.findById(id).orElseThrow().getTitle()).isEqualTo("Insurance");
    }

    @Test
    void upcomingIncludesOverdueAndExcludesFarFutureAndPaid() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");
        String overdue = LocalDate.now().minusDays(1).toString();
        String soon = LocalDate.now().plusDays(10).toString();
        String far = LocalDate.now().plusDays(100).toString();
        String soonPaid = LocalDate.now().plusDays(5).toString();

        addDeadline("anna@a.com", "{\"title\":\"Overdue\",\"dueDate\":\"" + overdue + "\",\"recurrence\":\"NONE\"}");
        addDeadline("anna@a.com", "{\"title\":\"Soon\",\"dueDate\":\"" + soon + "\",\"recurrence\":\"NONE\"}");
        addDeadline("anna@a.com", "{\"title\":\"Far\",\"dueDate\":\"" + far + "\",\"recurrence\":\"NONE\"}");
        addDeadline("anna@a.com", "{\"title\":\"SoonPaid\",\"dueDate\":\"" + soonPaid + "\",\"recurrence\":\"NONE\",\"paid\":true}");

        mvc.perform(get("/api/deadlines/upcoming").param("days", "30").with(user("anna@a.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].title").value("Overdue"))
                .andExpect(jsonPath("$[1].title").value("Soon"));
    }

    @Test
    void payOneOff_marksPaid() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");
        addDeadline("anna@a.com", """
                {"title":"Water bill","dueDate":"2026-09-01","category":"BILL","recurrence":"NONE"}""");
        long id = deadlines.findAll().get(0).getId();

        mvc.perform(post("/api/deadlines/" + id + "/pay").with(user("anna@a.com")).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paid").value(true));
    }

    @Test
    void payRecurring_rollsForwardAndStaysUnpaid() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");
        addDeadline("anna@a.com", """
                {"title":"Streaming","dueDate":"2026-01-15","category":"SUBSCRIPTION","recurrence":"MONTHLY"}""");
        long id = deadlines.findAll().get(0).getId();

        mvc.perform(post("/api/deadlines/" + id + "/pay").with(user("anna@a.com")).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paid").value(false))
                .andExpect(jsonPath("$.dueDate").value("2026-02-15"));

        Deadline d = deadlines.findById(id).orElseThrow();
        assertThat(d.getDueDate()).isEqualTo(LocalDate.of(2026, 2, 15));
        assertThat(d.isPaid()).isFalse();
    }

    @Test
    void listRequiresAuthentication() throws Exception {
        mvc.perform(get("/api/deadlines")).andExpect(status().isUnauthorized());
    }
}
