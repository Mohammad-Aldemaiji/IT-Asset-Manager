package com.itassets;

import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/** Cross-field and fixed-choice rules complement Bean Validation on the request. */
@Component
public class AssetValidator {
    public static final List<String> CATEGORIES = List.of("Laptop", "Desktop", "Monitor", "Server", "Printer", "Phone", "Tablet", "Networking");
    public static final List<String> STATUSES = List.of("In Use", "Available", "Under Repair", "Retired");
    public static final List<String> DEPARTMENTS = List.of("Engineering", "Finance", "Human Resources", "IT", "Marketing", "Operations", "Sales");
    public void validate(AssetRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        if (!CATEGORIES.contains(clean(request.category()))) errors.put("category", "Choose a category.");
        if (!STATUSES.contains(clean(request.status()))) errors.put("status", "Choose a status.");
        if (!DEPARTMENTS.contains(clean(request.department()))) errors.put("department", "Choose a department.");
        if (clean(request.name()).length() < 2) errors.put("name", "Name must be at least 2 characters.");
        if ("In Use".equals(clean(request.status())) && clean(request.assignedTo()).isEmpty())
            errors.put("assignedTo", "Enter who is using this asset.");
        if (request.warrantyExpiry() != null && request.purchaseDate() != null && request.warrantyExpiry().isBefore(request.purchaseDate()))
            errors.put("warrantyExpiry", "Warranty cannot end before the purchase date.");
        if (!errors.isEmpty()) throw new ApiException(HttpStatus.BAD_REQUEST, "Please fix the highlighted fields.", errors);
    }
    private static String clean(String value) { return value == null ? "" : value.trim(); }
}
