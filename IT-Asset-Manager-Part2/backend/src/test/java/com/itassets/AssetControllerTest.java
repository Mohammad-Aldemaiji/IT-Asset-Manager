package com.itassets;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.*;
import java.util.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AssetController.class)
class AssetControllerTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @MockitoBean AssetService service;
    @MockitoBean AssetStatsService stats;
    @Test void postReturnsCreatedAndLocation() throws Exception {
        when(service.create(any())).thenReturn(AssetResponse.from(TestAssets.asset(11,TestAssets.request())));
        mvc.perform(post("/api/assets").contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(TestAssets.request())))
            .andExpect(status().isCreated()).andExpect(header().string("Location","/api/assets/AST-0011")).andExpect(jsonPath("$.id").value("AST-0011"));
    }
    @Test void getByIdReturnsJson() throws Exception {
        when(service.get("AST-0001")).thenReturn(AssetResponse.from(TestAssets.asset(1,TestAssets.request())));
        mvc.perform(get("/api/assets/AST-0001")).andExpect(status().isOk()).andExpect(jsonPath("$.name").value("Test Laptop"));
    }
    @Test void listPassesPageAndFilters() throws Exception {
        when(service.list(1,5,"Dell","Laptop","Available","name,desc")).thenReturn(new PageResponse<>(List.of(),1,5,0,0));
        mvc.perform(get("/api/assets").param("page","1").param("size","5").param("q","Dell").param("category","Laptop").param("status","Available").param("sort","name,desc"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.page").value(1)).andExpect(jsonPath("$.content").isArray());
    }
    @Test void putReturnsUpdatedAsset() throws Exception {
        when(service.update(eq("AST-0001"),any())).thenReturn(AssetResponse.from(TestAssets.asset(1,TestAssets.request())));
        mvc.perform(put("/api/assets/AST-0001").contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(TestAssets.request())))
            .andExpect(status().isOk()).andExpect(jsonPath("$.id").value("AST-0001"));
    }
    @Test void deleteReturnsNoBody() throws Exception { mvc.perform(delete("/api/assets/AST-0001")).andExpect(status().isNoContent()).andExpect(content().string("")); }
    @Test void missingAssetMapsTo404() throws Exception {
        when(service.get("AST-9999")).thenThrow(new ApiException(HttpStatus.NOT_FOUND,"Asset was not found."));
        mvc.perform(get("/api/assets/AST-9999")).andExpect(status().isNotFound()).andExpect(jsonPath("$.message").value("Asset was not found."));
    }
    @Test void duplicateMapsTo409() throws Exception {
        when(service.create(any())).thenThrow(new ApiException(HttpStatus.CONFLICT,"Duplicate",Map.of("serialNumber","Already used")));
        mvc.perform(post("/api/assets").contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(TestAssets.request())))
            .andExpect(status().isConflict()).andExpect(jsonPath("$.errors.serialNumber").value("Already used"));
    }
    @Test void rejectsMissingFieldsBeforeCallingService() throws Exception {
        mvc.perform(post("/api/assets").contentType(MediaType.APPLICATION_JSON).content("{}"))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors.name").exists());
        verifyNoInteractions(service);
    }
    @Test void rejectsMalformedJsonAndNonNumericPagination() throws Exception {
        mvc.perform(post("/api/assets").contentType(MediaType.APPLICATION_JSON).content("{" )).andExpect(status().isBadRequest());
        mvc.perform(get("/api/assets").param("page","abc")).andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }
    @Test void databaseConstraintRaceMapsToConflict() throws Exception {
        when(service.create(any())).thenThrow(new org.springframework.dao.DataIntegrityViolationException("internal SQL"));
        mvc.perform(post("/api/assets").contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(TestAssets.request())))
            .andExpect(status().isConflict()).andExpect(jsonPath("$.errors.serialNumber").exists());
    }
    @Test void statsRouteIsNotTreatedAsAnId() throws Exception {
        when(stats.get()).thenReturn(new AssetStatsService.Stats(0,Map.of(),Map.of(),java.math.BigDecimal.ZERO,List.of()));
        mvc.perform(get("/api/assets/stats")).andExpect(status().isOk()).andExpect(jsonPath("$.total").value(0));
        verifyNoInteractions(service);
    }
}
