package com.itassets;

import java.net.URI;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assets")
public class AssetController {
    private final AssetService service;
    private final AssetStatsService stats;
    public AssetController(AssetService service, AssetStatsService stats) { this.service=service; this.stats=stats; }
    @GetMapping
    public PageResponse<AssetResponse> list(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="5") int size,
            @RequestParam(defaultValue="") String q, @RequestParam(defaultValue="") String category,
            @RequestParam(defaultValue="") String status, @RequestParam(defaultValue="id,asc") String sort) {
        return service.list(page, size, q, category, status, sort);
    }
    @GetMapping("/stats") public AssetStatsService.Stats stats() { return stats.get(); }
    @GetMapping("/{id}") public AssetResponse get(@PathVariable String id) { return service.get(id); }
    @PostMapping public ResponseEntity<AssetResponse> create(@Valid @RequestBody AssetRequest request) {
        AssetResponse result=service.create(request);
        return ResponseEntity.created(URI.create("/api/assets/" + result.id())).body(result);
    }
    @PutMapping("/{id}") public AssetResponse update(@PathVariable String id, @Valid @RequestBody AssetRequest request) { return service.update(id, request); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable String id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
