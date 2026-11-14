package com.itassets;

import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.LocalDate;
import static org.assertj.core.api.Assertions.*;

class AssetValidatorTest {
    final AssetValidator validator=new AssetValidator();
    @Test void acceptsValidRequest() { assertThatCode(() -> validator.validate(TestAssets.request())).doesNotThrowAnyException(); }
    @Test void requiresAssigneeForInUse() {
        assertThatThrownBy(() -> validator.validate(TestAssets.request("Laptop","TEST-001","In Use"," ",null)))
            .isInstanceOfSatisfying(ApiException.class, ex -> assertThat(ex.getErrors()).containsKey("assignedTo"));
    }
    @Test void rejectsWarrantyBeforePurchase() {
        assertThatThrownBy(() -> validator.validate(TestAssets.request("Laptop","TEST-001","Available","",LocalDate.of(2020,1,1))))
            .isInstanceOfSatisfying(ApiException.class, ex -> assertThat(ex.getErrors()).containsKey("warrantyExpiry"));
    }
    @Test void rejectsInvalidChoicesAndWhitespaceName() {
        var request=new AssetRequest("  ","Car","Dell","","SN","Invalid","","Invalid","",LocalDate.of(2025,1,1),BigDecimal.ONE,null,"");
        assertThatThrownBy(() -> validator.validate(request)).isInstanceOfSatisfying(ApiException.class,
            ex -> assertThat(ex.getErrors()).containsKeys("name","category","status","department"));
    }
    @Test void beanValidationRejectsMissingFieldsFutureDateNegativePriceAndLongText() {
        try (var factory=Validation.buildDefaultValidatorFactory()) {
            var request=new AssetRequest("x","","x".repeat(41),"x".repeat(61),"bad serial!","","x".repeat(61),"","x".repeat(61),LocalDate.now().plusDays(1),new BigDecimal("-1.001"),null,"x".repeat(501));
            assertThat(factory.getValidator().validate(request)).extracting(v -> v.getPropertyPath().toString())
                .contains("name","category","brand","model","serialNumber","status","assignedTo","department","location","purchaseDate","purchasePrice","notes");
            assertThat(factory.getValidator().validate(new AssetRequest(null,null,null,null,null,null,null,null,null,null,null,null,null)))
                .extracting(v -> v.getPropertyPath().toString()).contains("name","serialNumber","purchaseDate","purchasePrice");
        }
    }
}
