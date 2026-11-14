# Architecture

React renders the interface and sends HTTP requests to Spring. The backend owns asset data, validation, IDs, searching, pagination and persistence. React Context holds API operations and a revision counter, rather than a second independent asset database.

~~~mermaid
flowchart LR
  P[React pages and forms] --> Q[assetsApi and useAssetQuery]
  Q -->|HTTP JSON| C[AssetController]
  C --> V[Bean Validation and AssetValidator]
  C --> S[AssetService]
  S --> R[AssetRepository]
  R --> D[(H2 file database)]
  C --> ST[AssetStatsService]
  ST --> R
~~~

## Backend boundaries

AssetRequest is the write contract and has no id. Bean Validation checks field constraints. AssetValidator checks fixed choices and relationships between fields. AssetService applies business rules inside transactions. Asset is the JPA persistence entity. AssetResponse exposes formatted public IDs without leaking the internal database number. AssetRepository extends JpaRepository and JpaSpecificationExecutor. PageResponse provides a stable public pagination shape. ApiExceptionHandler maps expected failures to HTTP errors with field messages.

## Read flow

useAssetQuery builds a key from the operation, parameters, successful-write revision and retry attempt. An effect starts an API request. Replies from obsolete effects are ignored, preventing an old slow search from replacing newer results. A changed key shows loading instead of stale content. The asset list sends page, size, search, filters and sort to the backend. Details and edit pages request their ID directly, independently of any list page.

## Write flow

AssetForm awaits its submit handler and disables controls while pending. AssetProvider runs frontend validation for immediate feedback, normalizes values, and calls the API. The server revalidates independently. On success the provider increments revision, invalidating reads, and the page navigates with a success notice. On failure it returns field errors or a form error and preserves user input. The HTTP client removes id from edit submissions because IDs are server-owned.

## Search and persistence

The service constructs a JPA Specification of category/status AND a case-insensitive OR across searchable fields. Exact public IDs are converted to numeric IDs. User wildcard characters are escaped. JPA applies predicates, stable sort, offset and limit in SQL, with count metadata. The unique serial constraint protects against concurrent duplicates, beyond the pre-save existence check. A database sequence allocates IDs and is independent of deleted rows.

## Deployment modes

Development uses Vite with an /api proxy. Production packages dist into the Spring JAR through Maven resources. SpaController forwards browser routes to index.html and excludes dotted asset filenames, allowing Vite JavaScript/CSS resources to be served correctly. No wildcard CORS policy is needed. The Windows demo binds only to 127.0.0.1 and includes a portable Java runtime.

Dashboard calculations are separate from paginated listing and use all persisted assets. The implementation reads all assets for statistics, which is reasonable for a small course dataset; a larger deployment should use database aggregate queries.
