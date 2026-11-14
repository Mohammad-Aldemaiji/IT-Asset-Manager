package com.itassets;

import java.math.BigDecimal;
import java.time.LocalDate;
import jakarta.validation.constraints.*;

/** The write contract excludes id: only the server can allocate an asset ID. */
public record AssetRequest(
    @NotBlank @Size(min=2, max=80) String name,
    @NotBlank String category,
    @NotBlank @Size(max=40) String brand,
    @Size(max=60) String model,
    @NotBlank @Size(max=40) @Pattern(regexp="[A-Za-z0-9-]+") String serialNumber,
    @NotBlank String status,
    @Size(max=60) String assignedTo,
    @NotBlank String department,
    @Size(max=60) String location,
    @NotNull @PastOrPresent LocalDate purchaseDate,
    @NotNull @DecimalMin("0.00") @DecimalMax("10000000.00") @Digits(integer=8, fraction=2) BigDecimal purchasePrice,
    LocalDate warrantyExpiry,
    @Size(max=500) String notes
) {}
