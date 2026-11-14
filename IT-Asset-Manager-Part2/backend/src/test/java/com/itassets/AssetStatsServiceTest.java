package com.itassets;

import java.math.BigDecimal;
import java.time.*;
import java.util.List;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;

class AssetStatsServiceTest {
    @Test void countsAllAssetsAndExcludesRetiredValueAndWarranties() {
        AssetRepository repository=mock(AssetRepository.class);
        LocalDate today=LocalDate.of(2026,11,14);
        when(repository.findAll()).thenReturn(List.of(
            TestAssets.asset(1, TestAssets.request("Current","SN-1","In Use","Sara",today)),
            TestAssets.asset(2, TestAssets.request("Future","SN-2","Available","",today.plusDays(90))),
            TestAssets.asset(3, TestAssets.request("Retired","SN-3","Retired","",today.plusDays(1))),
            TestAssets.asset(4, TestAssets.request("Expired","SN-4","Available","",today.minusDays(1))),
            TestAssets.asset(5, TestAssets.request("Later","SN-5","Available","",today.plusDays(91))),
            TestAssets.asset(6, TestAssets.request("No warranty","SN-6","Available","",null))));
        var result=new AssetStatsService(repository,Clock.fixed(Instant.parse("2026-11-14T09:00:00Z"),ZoneId.of("Asia/Riyadh"))).get();
        assertThat(result.total()).isEqualTo(6); assertThat(result.byStatus()).containsEntry("In Use",1L).containsEntry("Available",4L);
        assertThat(result.byCategory()).containsEntry("Laptop",6L).containsEntry("Monitor",0L);
        assertThat(result.activeValue()).isEqualByComparingTo(new BigDecimal("17500"));
        assertThat(result.expiringSoon()).extracting(AssetStatsService.ExpiringAsset::daysLeft).containsExactly(0L,90L);
    }
    @Test void emptyDatabaseHasZeroStats() {
        AssetRepository repository=mock(AssetRepository.class); when(repository.findAll()).thenReturn(List.of());
        var stats=new AssetStatsService(repository,Clock.systemUTC()).get();
        assertThat(stats.total()).isZero(); assertThat(stats.activeValue()).isEqualByComparingTo(BigDecimal.ZERO); assertThat(stats.expiringSoon()).isEmpty();
    }
}
