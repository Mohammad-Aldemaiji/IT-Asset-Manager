package com.itassets;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AssetStatsService {
    private final AssetRepository repository;
    private final Clock clock;
    public AssetStatsService(AssetRepository repository, Clock clock) { this.repository=repository; this.clock=clock; }
    public record ExpiringAsset(String id, String name, LocalDate warrantyExpiry, long daysLeft) {}
    public record Stats(long total, Map<String, Long> byStatus, Map<String, Long> byCategory, BigDecimal activeValue, List<ExpiringAsset> expiringSoon) {}
    @Transactional(readOnly=true)
    public Stats get() {
        // The server uses the complete dataset, independently of the current list page.
        List<Asset> assets = repository.findAll();
        Map<String, Long> statuses = new LinkedHashMap<>(), categories = new LinkedHashMap<>();
        AssetValidator.STATUSES.forEach(s -> statuses.put(s, 0L));
        AssetValidator.CATEGORIES.forEach(c -> categories.put(c, 0L));
        BigDecimal value = BigDecimal.ZERO;
        List<ExpiringAsset> expiring = new ArrayList<>();
        LocalDate today = LocalDate.now(clock);
        for (Asset asset : assets) {
            statuses.merge(asset.getStatus(), 1L, Long::sum);
            categories.merge(asset.getCategory(), 1L, Long::sum);
            if (!"Retired".equals(asset.getStatus())) value = value.add(asset.getPurchasePrice());
            if (!"Retired".equals(asset.getStatus()) && asset.getWarrantyExpiry() != null) {
                long days = ChronoUnit.DAYS.between(today, asset.getWarrantyExpiry());
                if (days >= 0 && days <= 90) expiring.add(new ExpiringAsset(AssetResponse.from(asset).id(), asset.getName(), asset.getWarrantyExpiry(), days));
            }
        }
        expiring.sort(Comparator.comparing(ExpiringAsset::warrantyExpiry).thenComparing(ExpiringAsset::id));
        return new Stats(assets.size(), statuses, categories, value, expiring);
    }
}
