package com.itassets;

import com.fasterxml.jackson.databind.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:flow;DB_CLOSE_DELAY=-1", "spring.jpa.hibernate.ddl-auto=create-drop", "app.seed=true"})
@AutoConfigureMockMvc
class ApplicationFlowTest {
    @Autowired MockMvc mvc; @Autowired ObjectMapper mapper; @Autowired DataSeeder seeder; @Autowired AssetRepository repository;
    @Test void browserRoutesForwardToReactWithoutInterceptingApiRoutes() throws Exception {
        mvc.perform(get("/")).andExpect(status().isOk()).andExpect(forwardedUrl("/index.html"));
        mvc.perform(get("/assets/AST-0001/edit")).andExpect(status().isOk()).andExpect(forwardedUrl("/index.html"));
        mvc.perform(get("/assets/missing.js")).andExpect(status().isNotFound());
    }
    @Test void seedCrudPaginationValidationAndStatsWorkTogether() throws Exception {
        mvc.perform(get("/api/assets").param("size","5")).andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(10)).andExpect(jsonPath("$.content.length()").value(5));
        seeder.run(); assertThat(repository.count()).isEqualTo(10); // seeding is idempotent
        mvc.perform(get("/api/assets").param("page","1").param("size","5")).andExpect(jsonPath("$.content[0].id").value("AST-0006"));
        String json=mapper.writeValueAsString(TestAssets.request());
        String response=mvc.perform(post("/api/assets").contentType(MediaType.APPLICATION_JSON).content(json)).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String id=mapper.readTree(response).get("id").asText();
        mvc.perform(get("/api/assets/"+id)).andExpect(status().isOk()).andExpect(jsonPath("$.serialNumber").value("TEST-001"));
        mvc.perform(post("/api/assets").contentType(MediaType.APPLICATION_JSON).content(json)).andExpect(status().isConflict());
        String updated=mapper.writeValueAsString(TestAssets.request("Updated Laptop","TEST-001","Available","",null));
        mvc.perform(put("/api/assets/"+id).contentType(MediaType.APPLICATION_JSON).content(updated)).andExpect(status().isOk()).andExpect(jsonPath("$.name").value("Updated Laptop"));
        mvc.perform(get("/api/assets").param("q",id)).andExpect(jsonPath("$.totalElements").value(1));
        mvc.perform(get("/api/assets/stats")).andExpect(jsonPath("$.total").value(11));
        mvc.perform(get("/api/assets").param("size","101")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/assets").param("sort","notes,asc")).andExpect(status().isBadRequest());
        mvc.perform(put("/api/assets/AST-9999").contentType(MediaType.APPLICATION_JSON).content(updated)).andExpect(status().isNotFound());
        mvc.perform(post("/api/assets").contentType(MediaType.APPLICATION_JSON).content(json.replace("3500.00","-1"))).andExpect(status().isBadRequest());
        mvc.perform(delete("/api/assets/"+id)).andExpect(status().isNoContent());
        mvc.perform(get("/api/assets/"+id)).andExpect(status().isNotFound());
        mvc.perform(get("/api/assets/stats")).andExpect(jsonPath("$.total").value(10));
    }
}
