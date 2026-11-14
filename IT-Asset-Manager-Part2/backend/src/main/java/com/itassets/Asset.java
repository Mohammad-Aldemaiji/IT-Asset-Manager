package com.itassets;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Locale;
import jakarta.persistence.*;

@Entity
@Table(name="assets", uniqueConstraints=@UniqueConstraint(name="uk_asset_serial", columnNames="serial_number"))
public class Asset {
    @Id @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="asset_seq")
    @SequenceGenerator(name="asset_seq", sequenceName="asset_seq", allocationSize=1)
    private Long number;
    
    private String name;
    
    private String category;
    
    private String brand;
    
    private String model;
    @Column(name="serial_number", nullable=false, length=40)
    private String serialNumber;
    
    private String status;
    
    private String assignedTo;
    
    private String department;
    
    private String location;
    
    private LocalDate purchaseDate;
    @Column(precision=10, scale=2)
    private BigDecimal purchasePrice;
    
    private LocalDate warrantyExpiry;
    @Column(length=500)
    private String notes;
    protected Asset() {}
    public Asset(AssetRequest request) { apply(request); }
    public void apply(AssetRequest request) {
        this.name = clean(request.name());
        this.category = clean(request.category());
        this.brand = clean(request.brand());
        this.model = clean(request.model());
        this.serialNumber = clean(request.serialNumber()).toUpperCase(Locale.ROOT);
        this.status = clean(request.status());
        this.assignedTo = clean(request.assignedTo());
        this.department = clean(request.department());
        this.location = clean(request.location());
        this.purchaseDate = request.purchaseDate();
        this.purchasePrice = request.purchasePrice();
        this.warrantyExpiry = request.warrantyExpiry();
        this.notes = clean(request.notes());
        if (!"In Use".equals(status)) assignedTo = "";
    }
    private static String clean(String value) { return value == null ? "" : value.trim(); }
    public Long getNumber() { return number; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public String getBrand() { return brand; }
    public String getModel() { return model; }
    public String getSerialNumber() { return serialNumber; }
    public String getStatus() { return status; }
    public String getAssignedTo() { return assignedTo; }
    public String getDepartment() { return department; }
    public String getLocation() { return location; }
    public LocalDate getPurchaseDate() { return purchaseDate; }
    public BigDecimal getPurchasePrice() { return purchasePrice; }
    public LocalDate getWarrantyExpiry() { return warrantyExpiry; }
    public String getNotes() { return notes; }
}
