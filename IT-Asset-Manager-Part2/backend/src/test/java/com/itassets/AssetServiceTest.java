package com.itassets;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssetServiceTest {
    @Mock AssetRepository repository;
    AssetService service;
    @BeforeEach void setup() { service=new AssetService(repository, new AssetValidator()); }
    @Test void createsAndNormalizesWithServerId() {
        when(repository.saveAndFlush(any(Asset.class))).thenAnswer(call -> {
            Asset asset=call.getArgument(0); org.springframework.test.util.ReflectionTestUtils.setField(asset,"number",11L); return asset;
        });
        var result=service.create(TestAssets.request("  Test Laptop  ","test-001","Available","unused",null));
        assertThat(result.id()).isEqualTo("AST-0011"); assertThat(result.name()).isEqualTo("Test Laptop");
        assertThat(result.serialNumber()).isEqualTo("TEST-001"); assertThat(result.assignedTo()).isEmpty();
    }
    @Test void rejectsDuplicateCreateWithoutSaving() {
        when(repository.existsBySerialNumberIgnoreCase("TEST-001")).thenReturn(true);
        assertThatThrownBy(() -> service.create(TestAssets.request())).isInstanceOfSatisfying(ApiException.class, ex -> assertThat(ex.getStatus()).isEqualTo(HttpStatus.CONFLICT));
        verify(repository,never()).saveAndFlush(any());
    }
    @Test void findsByPublicId() {
        when(repository.findById(1L)).thenReturn(Optional.of(TestAssets.asset(1, TestAssets.request())));
        assertThat(service.get("AST-0001").id()).isEqualTo("AST-0001");
    }
    @Test void missingIdIs404() {
        assertThatThrownBy(() -> service.get("AST-9999")).isInstanceOfSatisfying(ApiException.class, ex -> assertThat(ex.getStatus()).isEqualTo(HttpStatus.NOT_FOUND));
    }
    @ParameterizedTest @ValueSource(strings={"1", "AST-0", "AST-0000", "AST-00001", "AST-999999999999999999999999999"})
    void invalidIdsDoNotReachRepository(String id) {
        assertThatThrownBy(() -> service.get(id)).isInstanceOf(ApiException.class); verifyNoInteractions(repository);
    }
    @Test void updatesSameAssetAndExcludesItsOwnSerial() {
        Asset existing=TestAssets.asset(1, TestAssets.request());
        when(repository.findById(1L)).thenReturn(Optional.of(existing)); when(repository.saveAndFlush(existing)).thenReturn(existing);
        var result=service.update("AST-0001", TestAssets.request("Changed Laptop","TEST-001","In Use","Sara",null));
        assertThat(result.name()).isEqualTo("Changed Laptop"); assertThat(result.assignedTo()).isEqualTo("Sara");
        verify(repository).existsBySerialNumberIgnoreCaseAndNumberNot("TEST-001",1L);
    }
    @Test void missingUpdateDoesNotInsert() {
        assertThatThrownBy(() -> service.update("AST-0001",TestAssets.request())).isInstanceOf(ApiException.class);
        verify(repository,never()).saveAndFlush(any());
    }
    @Test void rejectsDuplicateUpdate() {
        when(repository.findById(1L)).thenReturn(Optional.of(TestAssets.asset(1, TestAssets.request())));
        when(repository.existsBySerialNumberIgnoreCaseAndNumberNot("TEST-001",1L)).thenReturn(true);
        assertThatThrownBy(() -> service.update("AST-0001",TestAssets.request())).isInstanceOf(ApiException.class);
        verify(repository,never()).saveAndFlush(any());
    }
    @Test void deletesExistingAsset() {
        Asset asset=TestAssets.asset(1,TestAssets.request()); when(repository.findById(1L)).thenReturn(Optional.of(asset));
        service.delete("AST-0001"); verify(repository).delete(asset); verify(repository).flush();
    }
    @Test void deletingMissingAssetIs404() {
        assertThatThrownBy(() -> service.delete("AST-9999")).isInstanceOf(ApiException.class); verify(repository,never()).delete(any(Asset.class));
    }
    @Test void passesPaginationAndStableSortToRepository() {
        when(repository.findAll(ArgumentMatchers.<Specification<Asset>>any(),any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(TestAssets.asset(2,TestAssets.request())),PageRequest.of(1,1),3));
        var result=service.list(1,1,"Dell","Laptop","Available","purchasePrice,desc");
        assertThat(result.page()).isEqualTo(1); assertThat(result.totalElements()).isEqualTo(3); assertThat(result.totalPages()).isEqualTo(3);
        ArgumentCaptor<Pageable> paging=ArgumentCaptor.forClass(Pageable.class);
        verify(repository).findAll(ArgumentMatchers.<Specification<Asset>>any(),paging.capture());
        assertThat(paging.getValue().getSort().getOrderFor("purchasePrice").getDirection()).isEqualTo(Sort.Direction.DESC);
        assertThat(paging.getValue().getSort().getOrderFor("number")).isNotNull();
    }
    @Test void validatesQueryBoundsAndChoices() {
        assertThatThrownBy(() -> service.list(-1,5,"","","","id,asc")).isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> service.list(0,101,"","","","id,asc")).isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> service.list(0,0,"","","","id,asc")).isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> service.list(0,5,"","","","notes,asc")).isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> service.list(0,5,"","","","id,wrong")).isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> service.list(0,5,"x".repeat(201),"","","id,asc")).isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> service.list(0,5,"","Car","","id,asc")).isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> service.list(0,5,"","","Unknown","id,asc")).isInstanceOf(ApiException.class);
        verifyNoInteractions(repository);
    }
}
