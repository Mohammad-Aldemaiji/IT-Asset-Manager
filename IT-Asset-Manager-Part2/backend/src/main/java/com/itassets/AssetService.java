package com.itassets;

import java.util.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.criteria.Predicate;

@Service
@Transactional(readOnly=true)
public class AssetService {
    private final AssetRepository repository;
    private final AssetValidator validator;
    private static final Set<String> SORT_FIELDS = Set.of("id", "name", "category", "status", "purchaseDate", "purchasePrice");
    public AssetService(AssetRepository repository, AssetValidator validator) { this.repository = repository; this.validator = validator; }

    public AssetResponse get(String id) { return AssetResponse.from(find(id)); }
    private Asset find(String id) {
        return repository.findById(number(id)).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Asset " + id + " was not found."));
    }
    static long number(String id) {
        try {
            if (id == null || !id.matches("AST-[0-9]{4,}")) throw new NumberFormatException();
            long number = Long.parseLong(id.substring(4));
            if (number <= 0 || !id.equals("AST-%04d".formatted(number))) throw new NumberFormatException();
            return number;
        } catch (NumberFormatException ex) { throw new ApiException(HttpStatus.NOT_FOUND, "Asset was not found."); }
    }

    @Transactional
    public AssetResponse create(AssetRequest request) {
        validator.validate(request);
        String serial = request.serialNumber().trim();
        if (repository.existsBySerialNumberIgnoreCase(serial)) throw duplicate();
        return AssetResponse.from(repository.saveAndFlush(new Asset(request)));
    }
    @Transactional
    public AssetResponse update(String id, AssetRequest request) {
        Asset asset = find(id);
        validator.validate(request);
        if (repository.existsBySerialNumberIgnoreCaseAndNumberNot(request.serialNumber().trim(), asset.getNumber())) throw duplicate();
        asset.apply(request);
        return AssetResponse.from(repository.saveAndFlush(asset));
    }
    @Transactional
    public void delete(String id) { repository.delete(find(id)); repository.flush(); }
    private ApiException duplicate() {
        return new ApiException(HttpStatus.CONFLICT, "Duplicate serial number.", Map.of("serialNumber", "Another asset already has this serial number."));
    }

    public PageResponse<AssetResponse> list(int page, int size, String q, String category, String status, String sort) {
        if (page < 0 || page > 1000000 || size < 1 || size > 100) throw new ApiException(HttpStatus.BAD_REQUEST, "page must be 0–1000000 and size must be 1–100.");
        String[] order = sort.split(",", -1);
        if (order.length != 2 || !SORT_FIELDS.contains(order[0]) || !(order[1].equals("asc") || order[1].equals("desc")))
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid sort. Example: id,asc.");
        if (q.length() > 200) throw new ApiException(HttpStatus.BAD_REQUEST, "Search must be at most 200 characters.");
        if (!category.isEmpty() && !AssetValidator.CATEGORIES.contains(category)) throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid category filter.");
        if (!status.isEmpty() && !AssetValidator.STATUSES.contains(status)) throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid status filter.");
        Sort ordering = Sort.by(Sort.Direction.fromString(order[1]), order[0].equals("id") ? "number" : order[0]);
        if (!order[0].equals("id")) ordering = ordering.and(Sort.by("number"));
        return PageResponse.from(repository.findAll(filters(q, category, status), PageRequest.of(page, size, ordering)).map(AssetResponse::from));
    }
    static Specification<Asset> filters(String q, String category, String status) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (!category.isEmpty()) predicates.add(cb.equal(root.get("category"), category));
            if (!status.isEmpty()) predicates.add(cb.equal(root.get("status"), status));
            String needle = q.trim().toLowerCase(Locale.ROOT);
            if (!needle.isEmpty()) {
                String escaped = needle.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
                List<Predicate> matches = new ArrayList<>();
                for (String field : List.of("name", "brand", "model", "serialNumber", "assignedTo", "department", "location"))
                    matches.add(cb.like(cb.lower(root.get(field)), "%" + escaped + "%", '\\'));
                // Exact ID searches also work through the list search box.
                if (needle.matches("ast-[0-9]{4,}")) {
                    try { matches.add(cb.equal(root.get("number"), number(needle.toUpperCase(Locale.ROOT)))); }
                    catch (ApiException ignored) { /* Treat an invalid ID as ordinary search text. */ }
                }
                predicates.add(cb.or(matches.toArray(Predicate[]::new)));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
