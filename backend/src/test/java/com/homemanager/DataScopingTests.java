package com.homemanager;

import com.homemanager.pantry.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class DataScopingTests extends AbstractApiTest {

    private static final MediaType JSON = MediaType.APPLICATION_JSON;

    @Autowired
    private ProductRepository products;

    @Test
    void productsAreScopedPerFamily() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");
        registerHousehold("carol@b.com", "Carol", "Casa B");

        mvc.perform(post("/api/products").with(user("anna@a.com")).with(csrf()).contentType(JSON)
                        .content("""
                                {"name":"MilkA","category":"FRESH"}"""))
                .andExpect(status().isOk());

        mvc.perform(get("/api/products").with(user("anna@a.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("MilkA"))
                .andExpect(jsonPath("$[0].family").doesNotExist());

        mvc.perform(get("/api/products").with(user("carol@b.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void cannotUpdateOrDeleteAnotherFamilysProduct() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");
        registerHousehold("carol@b.com", "Carol", "Casa B");

        mvc.perform(post("/api/products").with(user("anna@a.com")).with(csrf()).contentType(JSON)
                        .content("""
                                {"name":"MilkA","category":"FRESH"}"""))
                .andExpect(status().isOk());
        long id = products.findAll().get(0).getId();

        mvc.perform(put("/api/products/" + id).with(user("carol@b.com")).with(csrf()).contentType(JSON)
                        .content("""
                                {"name":"Hacked","category":"OTHER"}"""))
                .andExpect(status().isNotFound());

        mvc.perform(delete("/api/products/" + id).with(user("carol@b.com")).with(csrf()))
                .andExpect(status().isNotFound());

        assertThat(products.findById(id).orElseThrow().getName()).isEqualTo("MilkA");
    }

    @Test
    void shoppingItemsAreScopedAndRecordWhoAdded() throws Exception {
        registerHousehold("anna@a.com", "Anna", "Casa A");
        registerHousehold("carol@b.com", "Carol", "Casa B");

        mvc.perform(post("/api/shopping-items").with(user("anna@a.com")).with(csrf()).contentType(JSON)
                        .content("""
                                {"name":"Bread","purchased":false}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.addedBy").value("Anna"));

        mvc.perform(get("/api/shopping-items").with(user("carol@b.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
