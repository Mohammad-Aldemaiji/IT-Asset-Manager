package com.itassets;

import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.test.util.ReflectionTestUtils;

final class TestAssets {
    static AssetRequest request() { return request("Test Laptop", "TEST-001", "Available", "", LocalDate.of(2027,1,15)); }
    static AssetRequest request(String name, String serial, String status, String assigned, LocalDate warranty) {
        return new AssetRequest(name, "Laptop", "Dell", "Latitude", serial, status, assigned, "IT", "Lab", LocalDate.of(2025,1,15), new BigDecimal("3500.00"), warranty, "");
    }
    static Asset asset(long number, AssetRequest request) {
        Asset asset=new Asset(request); ReflectionTestUtils.setField(asset, "number", number); return asset;
    }
}
