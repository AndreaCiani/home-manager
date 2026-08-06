package com.homemanager;

import com.homemanager.budget.repository.ExpenseRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ExpenseTests extends AbstractApiTest {

    private static final MediaType JSON = MediaType.APPLICATION_JSON;

    @Autowired
    private ExpenseRepository expenses;

    private void addExpense(String user, String body) throws Exception {
        mvc.perform(post("/api/expenses").with(user(user)).with(csrf()).contentType(JSON).content(body))
                .andExpect(status().isOk());
    }

    @Test
    void expensesAreScopedPerFamily() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");
        registerHousehold("carol@b.com", "Carol", "Casa B");
        addExpense("anna@a.com", """
                {"description":"Groceries","amount":50,"category":"GROCERIES","date":"2026-03-05"}""");

        mvc.perform(get("/api/expenses").with(user("anna@a.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].description").value("Groceries"))
                .andExpect(jsonPath("$[0].family").doesNotExist());

        mvc.perform(get("/api/expenses").with(user("carol@b.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void canSetPayerToMemberButNotOutsider() throws Exception {
        String code = registerHousehold("anna@a.com", "Anna", "Casa A");
        joinHousehold("bob@a.com", "Bob", code);
        registerHousehold("carol@b.com", "Carol", "Casa B");
        long bob = userId("bob@a.com");
        long carol = userId("carol@b.com");

        mvc.perform(post("/api/expenses").with(user("anna@a.com")).with(csrf()).contentType(JSON)
                        .content("{\"description\":\"Dinner\",\"amount\":40,\"category\":\"LEISURE\",\"date\":\"2026-03-10\",\"paidByUserId\":" + bob + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paidByName").value("Bob"));

        mvc.perform(post("/api/expenses").with(user("anna@a.com")).with(csrf()).contentType(JSON)
                        .content("{\"description\":\"Dinner\",\"amount\":40,\"category\":\"LEISURE\",\"date\":\"2026-03-10\",\"paidByUserId\":" + carol + "}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void cannotUpdateOrDeleteAnotherFamilysExpense() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");
        registerHousehold("carol@b.com", "Carol", "Casa B");
        addExpense("anna@a.com", """
                {"description":"Rent","amount":800,"category":"RENT","date":"2026-03-01"}""");
        long id = expenses.findAll().get(0).getId();

        mvc.perform(put("/api/expenses/" + id).with(user("carol@b.com")).with(csrf()).contentType(JSON)
                        .content("""
                                {"description":"Hacked","amount":1,"category":"OTHER","date":"2026-03-01"}"""))
                .andExpect(status().isNotFound());
        mvc.perform(delete("/api/expenses/" + id).with(user("carol@b.com")).with(csrf()))
                .andExpect(status().isNotFound());
    }

    @Test
    void monthlySummaryTotalsByCategory() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");
        addExpense("anna@a.com", """
                {"description":"Food 1","amount":50,"category":"GROCERIES","date":"2026-03-05"}""");
        addExpense("anna@a.com", """
                {"description":"Food 2","amount":30,"category":"GROCERIES","date":"2026-03-20"}""");
        addExpense("anna@a.com", """
                {"description":"Power","amount":20,"category":"UTILITIES","date":"2026-03-15"}""");
        // Different month — must be excluded from the March summary
        addExpense("anna@a.com", """
                {"description":"Rent","amount":1000,"category":"RENT","date":"2026-04-01"}""");

        mvc.perform(get("/api/expenses/summary").param("month", "2026-03").with(user("anna@a.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.month").value("2026-03"))
                .andExpect(jsonPath("$.total").value(100))
                .andExpect(jsonPath("$.byCategory.length()").value(2))
                .andExpect(jsonPath("$.byCategory[0].category").value("GROCERIES"))
                .andExpect(jsonPath("$.byCategory[0].total").value(80))
                .andExpect(jsonPath("$.byCategory[1].category").value("UTILITIES"));
    }

    @Test
    void summaryWithInvalidMonthIsBadRequest() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");
        mvc.perform(get("/api/expenses/summary").param("month", "not-a-month").with(user("anna@a.com")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void listRequiresAuthentication() throws Exception {
        mvc.perform(get("/api/expenses")).andExpect(status().isUnauthorized());
    }
}
