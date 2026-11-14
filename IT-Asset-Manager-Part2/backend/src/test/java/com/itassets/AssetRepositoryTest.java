package com.itassets;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.*;
import java.util.*;
import static org.assertj.core.api.Assertions.*;

@DataJpaTest(properties="app.seed=false")
class AssetRepositoryTest {
    @Autowired AssetRepository repository;
    @Test void savesAndReloadsWithGeneratedId() {
        Asset asset=repository.saveAndFlush(new Asset(TestAssets.request()));
        assertThat(asset.getNumber()).isPositive();
        assertThat(repository.findById(asset.getNumber())).isPresent();
    }
    @Test void uniqueConstraintRejectsDuplicateSerial() {
        repository.saveAndFlush(new Asset(TestAssets.request()));
        assertThatThrownBy(() -> repository.saveAndFlush(new Asset(TestAssets.request()))).isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
    }
    @Test void searchesCaseInsensitivelyFiltersBeforePagingAndSorts() {
        repository.saveAllAndFlush(List.of(new Asset(TestAssets.request("Dell Beta","SN-1","Available","",null)),
            new Asset(TestAssets.request("Dell Alpha","SN-2","Available","",null)),
            new Asset(TestAssets.request("Dell Retired","SN-3","Retired","",null))));
        var first=repository.findAll(AssetService.filters("DELL","Laptop","Available"),PageRequest.of(0,1,Sort.by("name")));
        var second=repository.findAll(AssetService.filters("DELL","Laptop","Available"),PageRequest.of(1,1,Sort.by("name")));
        assertThat(first.getTotalElements()).isEqualTo(2); assertThat(first.getTotalPages()).isEqualTo(2);
        assertThat(first.getContent().getFirst().getName()).isEqualTo("Dell Alpha"); assertThat(second.getContent().getFirst().getName()).isEqualTo("Dell Beta");
        assertThat(repository.existsBySerialNumberIgnoreCase("sn-1")).isTrue();
        Long id=first.getContent().getFirst().getNumber();
        assertThat(repository.existsBySerialNumberIgnoreCaseAndNumberNot("sn-2",id)).isFalse();
    }
    @Test void idSearchAndWildcardCharactersAreLiteral() {
        Asset asset=repository.saveAndFlush(new Asset(TestAssets.request("100% Laptop","SN-1","Available","",null)));
        String id=AssetResponse.from(asset).id();
        assertThat(repository.findAll(AssetService.filters(id.toLowerCase(Locale.ROOT),"",""))).hasSize(1);
        assertThat(repository.findAll(AssetService.filters("%","",""))).hasSize(1);
        assertThat(repository.findAll(AssetService.filters("_","",""))).isEmpty();
        assertThat(repository.findAll(AssetService.filters("ast-99999999999999999999999","",""))).isEmpty();
    }
}
