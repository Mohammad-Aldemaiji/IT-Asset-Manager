package com.itassets;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Stable public IDs preserve the AST-0001 format used by the React application. */
public record AssetResponse(String id, String name, String category, String brand, String model, String serialNumber, String status, String assignedTo, String department, String location, LocalDate purchaseDate, BigDecimal purchasePrice, LocalDate warrantyExpiry, String notes) {
    public static AssetResponse from(Asset asset) {
        return new AssetResponse("AST-%04d".formatted(asset.getNumber()),
            asset.getName(), asset.getCategory(), asset.getBrand(), asset.getModel(), asset.getSerialNumber(), asset.getStatus(), asset.getAssignedTo(), asset.getDepartment(), asset.getLocation(), asset.getPurchaseDate(), asset.getPurchasePrice(), asset.getWarrantyExpiry(), asset.getNotes());
    }
}
