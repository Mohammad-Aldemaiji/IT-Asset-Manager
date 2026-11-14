# Part 2 implementation and change explanation

The original project was a React application whose asset collection lived in browser memory. Part 2 makes Spring the owner of that collection. React now sends requests, waits for responses and displays server results. This guide explains the added files, each changed production file, the tests and the final deliverables.

## 1. What changed for the user

| Before | After | Reason |
|---|---|---|
| Refresh restored sample data | Changes survive refresh and server restart | H2 stores records on disk |
| Browser assigned IDs | Server assigns IDs from a database sequence | One authority prevents browser counter collisions |
| Search and sort used a local array | Spring queries the complete database | Results remain correct when the UI has only one page |
| Asset list displayed everything | Previous/Next and page-size controls request pages | Meets the Part 2 pagination requirement |
| Details depended on loaded local assets | Details request their own ID | Direct links and refresh work |
| Submit immediately assumed success | Submit awaits the HTTP response | Failed writes must not look successful |
| Dashboard used local assets | Dashboard requests complete server statistics | A single page cannot provide company totals |
| Backend was planned | Java REST server, tests and runnable JAR are included | Completes the application integration |

The original visual design, field names, asset ID format, currency formatting and navigation are retained. Delete remains available even though Part 2 does not explicitly repeat that Part 1 feature.

## 2. Backend files added

All Java production files below are in `backend/src/main/java/com/itassets/`.

| File | What it does | Why it exists |
|---|---|---|
| `AssetManagerApplication.java` | Starts Spring Boot | Entry point for the server |
| `AssetController.java` | Maps list, ID lookup, create, update, delete and stats routes | Keeps HTTP behavior separate from business logic |
| `AssetService.java` | Runs CRUD rules, parses IDs, checks duplicates and constructs paginated queries | Central place for asset operations and transactions |
| `AssetRepository.java` | Extends Spring Data JPA interfaces | Supplies persistence and specification-based queries |
| `Asset.java` | JPA entity with an internal sequence ID and asset fields | Defines stored records and the unique serial constraint |
| `AssetRequest.java` | Java record containing editable fields and validation annotations | Defines accepted write input and excludes server-owned IDs |
| `AssetResponse.java` | Maps an entity to JSON with an `AST-0001` style public ID | Preserves the frontend contract without exposing internal identity fields |
| `PageResponse.java` | Returns content, page, size, totalElements and totalPages | Gives React a stable pagination format |
| `AssetValidator.java` | Enforces fixed choices, assignee requirements and warranty order | Handles rules involving more than one field |
| `ApiException.java` | Carries an expected HTTP status, message and field errors | Lets business logic report predictable failures |
| `ApiExceptionHandler.java` | Maps application, validation, parsing and constraint errors to JSON | Keeps error formatting consistent across routes |
| `AssetStatsService.java` | Computes counts, active value and warranty reminders across all assets | Preserves the dashboard with pagination |
| `AppConfig.java` | Provides an injectable Asia/Riyadh Clock | Makes date-dependent statistics predictable and testable |
| `DataSeeder.java` | Loads ten examples when an empty database starts with seeding enabled | Gives the demonstration useful starting records |
| `SpaController.java` | Forwards known browser routes to React's index.html | Allows one-JAR deployment and direct browser URLs |

### Controller versus service

The controller understands HTTP: request bodies, query parameters, status codes and the Location header. The service understands assets: whether an ID exists, whether a serial is taken, and how to find a requested page. Keeping these responsibilities separate makes the code easier to explain and allows Mockito tests without running a server.

### Request versus entity versus response

`AssetRequest` has no ID. Its annotations reject missing fields, invalid sizes, invalid serial characters, future purchase dates and invalid money values. Optional dates may be null. `Asset` stores data and normalizes text and serial case. `AssetResponse` adds the public formatted ID. React's edit form already knows an ID, but the HTTP client removes it before sending a write request.

The database uses a numeric sequence internally. Record 11 becomes public ID `AST-0011`. The sequence is not the row count, so deleted IDs are not reused. Failed insert attempts can leave gaps. The implementation supports IDs longer than four digits when the sequence grows.

### Duplicate serial handling

The service checks serial uniqueness ignoring case. Updates exclude the current asset so it can keep its own serial. Normalization stores serials uppercase. The entity declares a database unique constraint, which also catches concurrent requests that both passed the initial check. A duplicate returns HTTP 409 and a `serialNumber` field error.

### Server pagination

The list endpoint accepts `page`, `size`, `q`, `category`, `status` and `sort`. Page numbering starts at zero. The service limits page size, validates choices and explicitly allows supported sort fields. It combines filters in a JPA Specification and passes a PageRequest to the repository. Filtering happens before pagination. A numeric ID tie-breaker keeps sorting deterministic when field values match.

Search uses bound query values and escapes percent signs, underscores and backslashes. It matches text fields ignoring case and recognizes complete public asset IDs. It does not load one page and then search only those rows.

### Persistence and seeding

`backend/src/main/resources/application.properties` sets up file-backed H2, disables the H2 web console, and exposes environment overrides for port and database settings. `seed-assets.json` contains the original ten example assets without browser-generated IDs. `DataSeeder` inserts those examples only when the table is empty and seeding is enabled.

The H2 file is relative to the process working directory. Starting from the same folder matters. If you delete every asset and restart with `APP_SEED=true`, samples will appear again. Use `APP_SEED=false` when an empty database is intentional. Tests use separate in-memory databases and do not modify the demo file.

The default file URL includes `WRITE_DELAY=0`, so committed changes are written without H2's normal write delay. This was added after a restart check deliberately terminated the Windows process immediately after a create response. The final verification repeats that abrupt restart and checks that the new asset still exists. See the [H2 write-delay reference](https://h2database.com/html/commands.html#set_write_delay).

### Other backend files

| File | Explanation |
|---|---|
| `backend/pom.xml` | Pins Spring Boot and Java, adds Web/JPA/Validation/H2/Test dependencies, configures JaCoCo and builds an executable JAR. It also packages the React `dist` directory into static resources. |
| `backend/mvnw`, `backend/mvnw.cmd` | Standard Maven Wrapper launchers for Unix and Windows. They remove the need for a preinstalled Maven. |
| `backend/.mvn/wrapper/maven-wrapper.properties` | Pins the downloaded Maven distribution to 3.9.11. |
| `backend/src/main/resources/application.properties` | Server, persistence, JSON parsing and sample-seeding configuration. |
| `backend/src/main/resources/seed-assets.json` | Backend-owned demonstration records copied from Part 1. |

## 3. Frontend files added

| File | Explanation |
|---|---|
| `src/api/assets.js` | The only production module that calls fetch. It builds endpoint URLs, sends JSON, checks HTTP status, preserves field errors, handles unreachable servers, omits ID in write bodies and skips JSON parsing for a 204 response. |
| `src/context/useAssetQuery.js` | Loads a list, one asset or dashboard statistics. Tracks loading/error/data, supports retry, and ignores obsolete replies after parameters change or a component unmounts. |
| `src/components/RequestState.jsx` | Reuses the loading message and error/retry UI instead of duplicating it across pages. |

### Why stale reply protection matters

Imagine typing `d`, then `de`, then `dell`. The server might return the first request last. Without protection, the list could display results for `d` while the search box says `dell`. Effect cleanup marks the old request inactive, so only the current request updates the screen. The network request is not aborted; its obsolete reply is ignored.

## 4. Existing frontend files changed

| File | Specific change | Effect |
|---|---|---|
| `src/context/AssetProvider.jsx` | Removed production use of initialAssets, reducer state, browser ID generation and local getAsset. Added asynchronous API mutations and a revision counter. | Spring owns records. Successful writes invalidate active reads. |
| `src/pages/AssetListPage.jsx` | Replaced local filtering with a paginated API query. Added ID lookup, page-size selection, Previous/Next, loading/retry and async deletion. | Meets pagination and ID lookup requirements while keeping search/filter/sort URL state. |
| `src/pages/AssetDetailsPage.jsx` | Fetches its ID directly, distinguishes 404 from connection errors, and awaits deletion. | Details work after refresh and do not disappear on failed DELETE. |
| `src/pages/AddAssetPage.jsx` | Awaits addAsset before navigating. | A success notice appears only after the server creates the asset. |
| `src/pages/EditAssetPage.jsx` | Fetches its ID, awaits updateAsset and normalizes an optional null warranty to an empty form value. | Direct edit links work and optional date fields remain controlled. |
| `src/pages/DashboardPage.jsx` | Uses the stats endpoint instead of computing totals from a local array. | Totals and warranty reminders represent all assets. |
| `src/components/AssetForm.jsx` | Awaits submission, adds a ref guard against repeats, shows Saving, disables actions and displays server errors. | Handles real request latency and preserves input on errors. |
| `src/components/ConfirmDialog.jsx` | Adds busy/error props, disables pending actions and shows delete failure messages. | Users can retry a failed delete without being shown false success. |
| `src/components/Layout.jsx` | Updates the footer to Part 2 and React + Spring Boot. | Describes the implemented application accurately. |
| `src/pages/AboutPage.jsx` | Updates the project description to the integrated app. | Removes the obsolete claim that refresh loses data. |
| `src/data/team.js` | Inserts all four supplied names and corresponding IDs. | About shows the requested team information. |
| `src/data/initialAssets.js` | Documents that this original array is now a test fixture only. | Makes clear that production data comes from Spring. |
| `src/utils/validation.js` | Adds a maximum of two decimal places for price. | Matches backend money constraints. |
| `src/index.css` | Adds layout styles for exact-ID lookup, pagination, disabled actions and request errors. | Fits the added controls into the original responsive design. |

### Pagination edge cases

Search/filter/sort/page-size changes reset the page to zero. Deleting the only row on the last page moves the list back to an existing page. Empty results show no table and Page 0 of 0. A failed read offers Retry. A failed delete keeps the dialog visible. URL parameters are sanitized before requests are sent.

### Revision and cache ownership

The provider does not store the complete database in React. It exposes stable API functions and a revision number. Each successful mutation increments revision. Active list/detail/stats queries include that value in their key, so they fetch current server data. This is a simple invalidation mechanism, not an optimistic concurrency version for database rows.

### Existing files intentionally retained

The original `assetReducer.js`, `ids.js`, `filterAssets.js` and `stats.js` remain available for historical regression tests and test fixtures. Production pages no longer rely on them for backend asset storage, searching or dashboard statistics. Reusable presentation components, routing, formatting and date helpers retain their existing roles.

## 5. Configuration and build changes

| File | Change and purpose |
|---|---|
| `vite.config.js` | Adds development and preview /api proxies with an optional API_PROXY_TARGET override. The browser talks to one origin. |
| `package.json` | Updates project metadata to Part 2, adds the Playwright smoke-test dependency and test:browser command. Existing development/build/test commands are retained. |
| `package-lock.json` | Locks the updated dependency graph for npm ci. |
| `.gitignore` | Excludes backend targets, local database files and browser test output from source control. Existing frontend output exclusions remain. |
| `Build-Release.ps1` | Installs locked frontend dependencies, lints, tests, builds React, then runs clean verify through Maven Wrapper. Stops on failure. |
| `.github/workflows/verify.yml` | Repeats frontend checks and backend verification in GitHub Actions, then uploads the executable JAR as a build artifact. It needs a push before remote execution can be observed. |
| `scripts/browser-smoke.mjs` | Exercises the real combined application in a browser, creates/deletes a demo record and captures desktop/mobile screenshots. It is separate from mocked frontend tests. |

The production build needs React built before Maven packaging. Maven copies `dist` into the JAR's static resources. SpaController forwards browser URLs while excluding dotted static filenames. This exclusion fixes a real browser integration issue found during verification: the generic asset route initially intercepted Vite's JavaScript file and returned HTML instead.

## 6. Tests added or updated

### Backend

All files below are in `backend/src/test/java/com/itassets/`.

| File | What is tested | Count |
|---|---|---:|
| `AssetServiceTest.java` | CRUD, ID parsing, duplicate rules, missing assets, query bounds and pagination/sort delegation with a Mockito repository | 16 |
| `AssetValidatorTest.java` | Cross-field rules, choices and Bean Validation constraints | 5 |
| `AssetControllerTest.java` | HTTP status, Location header, JSON shape, route dispatch, malformed requests and mapped errors with mocked services | 11 |
| `AssetRepositoryTest.java` | Real H2 persistence, unique constraint, filtering before paging, sorting, ID search and literal wildcards | 4 |
| `AssetStatsServiceTest.java` | Full-dataset totals, retired assets, warranty boundaries and empty data with a fixed clock | 2 |
| `ApplicationFlowTest.java` | Actual Spring/JPA/validation CRUD flow, sample seeding, pagination, stats and production route forwarding | 2 |
| `TestAssets.java` | Shared valid request/entity fixtures; not a test class itself | — |
| **Total** | **JUnit tests passing locally** | **40** |

Mockito is used to isolate a unit. For example, a service test makes `repository.findById(1L)` return a prepared asset, invokes the real service, and verifies the expected storage interaction. Repository and application-flow tests intentionally use a real database instead, so mocks cannot hide SQL or mapping errors.

### Frontend

`tests/testUtils.jsx` now installs a fake HTTP server for tests and renders the real production provider. It no longer injects local initial state into production code. `tests/integration/assets.test.jsx` covers API reads, pagination, search, exact-ID lookup, direct details, validation, asynchronous writes, retry, stale replies, delete errors, final-page correction and complete dashboard statistics. Navigation tests verify all supplied name/ID pairs. `tests/unit/api.test.js` adds HTTP-client error, encoding and 204-response checks. `tests/setup.js` restores mocked globals after each test. Original unit tests for pure helpers remain.

All 73 frontend tests pass. Measured frontend line coverage is 97.41%. Backend JaCoCo line coverage is 99.35%. These are executed-line measurements, not proof that every possible behavior is correct. See TESTING.md for commands and real-browser evidence.

## 7. Documentation and deliverables

| Item | Added work |
|---|---|
| `README.md` | Current setup, build, run, storage configuration, team, test and submission instructions |
| `docs/API.md` | REST route table, write JSON example, filters, pagination, response and error contracts |
| `docs/ARCHITECTURE.md` | Layer diagram, reads/writes, persistence and deployment explanations |
| `docs/REQUIREMENTS.md` | Part 2 requirement-to-implementation/test mapping |
| `docs/TESTING.md` | Executed test counts, coverage, commands and practical verification limits |
| `docs/DEMO_GUIDE.md` | Two-slide speaking guide, demo sequence and likely code questions |
| `docs/FEATURES.md`, `TECH_STACK.md`, `UI_DESIGN.md` | Updated feature, technology and interface descriptions |
| `docs/CODE_REVIEW.md` | Correctness review and practical limitations |
| `docs/AI_USAGE.md` | Accurate disclosure of AI assistance |
| `docs/PART2_WALKTHROUGH.md` | This file explaining all additions and changes |
| `docs/part1-archive/` | Preserved original documentation and Part 1 submission document |
| `docs/screenshots/` | Updated real-browser screenshots of the integrated application |
| `presentation/Final-Presentation.pptx` | Exactly two editable slides: architecture diagram and REST API table, with speaker notes |
| Source ZIP | Source and documentation ready to copy into the existing Git repository |
| Windows demo ZIP | Executable JAR, portable Java 21 runtime and Start-Demo.cmd, with no build tools required to run |

## 8. Things to understand before submission

This is a local course application without login/authorization, audit history or conflict detection for simultaneous edits. It is not prepared for hosting real organizational asset data publicly. The Windows launcher binds to localhost. Database schema updates and file storage are deliberately simple. No online deployment or GitHub push was performed as part of local delivery.

The assignment states teams of three and says the Part 2 backend is to be manually coded. The owner supplied four members and requested an AI-assisted implementation. Those facts are preserved transparently; confirm instructor acceptance. Read the code, run the demo and practice explaining a request from form to controller, service, repository and database before presenting.
