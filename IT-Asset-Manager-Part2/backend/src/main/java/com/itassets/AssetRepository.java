package com.itassets;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AssetRepository extends JpaRepository<Asset, Long>, JpaSpecificationExecutor<Asset> {
    boolean existsBySerialNumberIgnoreCase(String serialNumber);
    boolean existsBySerialNumberIgnoreCaseAndNumberNot(String serialNumber, Long number);
}
