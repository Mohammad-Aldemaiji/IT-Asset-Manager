package com.itassets;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.InputStream;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@ConditionalOnProperty(name="app.seed", havingValue="true", matchIfMissing=true)
public class DataSeeder implements CommandLineRunner {
    private final AssetRepository repository;
    private final ObjectMapper mapper;
    public DataSeeder(AssetRepository repository, ObjectMapper mapper) { this.repository=repository; this.mapper=mapper; }
    @Override @Transactional
    public void run(String... args) throws Exception {
        if (repository.count() != 0) return;
        try (InputStream input = getClass().getResourceAsStream("/seed-assets.json")) {
            List<AssetRequest> seeds = mapper.readValue(input, new TypeReference<List<AssetRequest>>() {});
            seeds.forEach(request -> repository.save(new Asset(request)));
        }
    }
}
