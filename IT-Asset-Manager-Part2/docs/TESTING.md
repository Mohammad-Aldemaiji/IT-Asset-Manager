# Part 2 verification results

Verified locally on 14 November 2026. The source baseline was public repository commit `b5b2103ab05539e5ea21cce719174f17d6ffe29b`. These results describe the integrated Part 2 implementation.

## Automated suites

| Check | Result |
|---|---|
| Frontend Vitest suite | 73 passed, 0 failed, 7 files |
| Frontend lint | Passed without warnings |
| React production build | Passed |
| Backend JUnit suite | 40 passed, 0 failed, 0 errors, 6 test classes |
| Maven verify and executable JAR packaging | Passed |
| Frontend line coverage | 97.41% |
| Backend JaCoCo line coverage | 99.35% |

Backend: 16 service tests with Mockito, 11 controller tests with mocked services and MockMvc, 5 validator tests, 4 real-H2 repository tests, 2 statistics tests and 2 full-application flow/routing tests. Parameterized ID cases count as separate executed tests.

Frontend tests run the production provider and mock HTTP responses. They verify loading, pagination, filtering, exact-ID lookup, direct URLs, mutation results, duplicate errors, connection failures, retry, pending submissions, stale replies and final-page correction. They do not inject local array state into production code.

## Real browser checks

The reproducible script `scripts/browser-smoke.mjs` ran with Playwright and headless Microsoft Edge against the actual executable Spring JAR containing React. Ten grouped scenarios passed with no uncaught browser page errors:

1. Server pagination through React and Spring.
2. Filtering resets the page and searches the full dataset.
3. Client validation and creation with a server ID.
4. New data survives browser refresh.
5. Update and reloaded server details.
6. Direct detail routes and missing IDs.
7. All four team names match their supplied IDs.
8. Dashboard counts include records outside page one.
9. Confirmed deletion refreshes the list.
10. Mobile layout fits a 390-pixel viewport without horizontal page overflow.

Desktop captures used a 1440-pixel viewport. Screenshots under `docs/screenshots/` show the integrated application. The dashboard screenshot includes the temporary demo asset before its deletion, so its count is 11 rather than the initial 10.

## Release and persistence checks

The Windows demo is tested with its bundled Java runtime, not the system Java 8 installation. Verification checks HTML and JavaScript MIME type, creates a record, terminates the server process, restarts it against the same H2 file, and reads the record back. The default file URL uses WRITE_DELAY=0 to remove H2's normal delay between commit and log flushing. Test data is separate from the delivered package.

## Reproduce the checks

From the repository root:

```powershell
npm.cmd ci
npm.cmd run lint
npm.cmd test
npm.cmd run coverage
npm.cmd run build
```

From backend, with JDK 21 selected:

```powershell
.\mvnw.cmd -B clean verify
```

JaCoCo reports appear under `backend/target/site/jacoco/`; frontend coverage is under `coverage/`. `Build-Release.ps1` runs installation, frontend lint/tests/build, then backend clean verify. Stop any Vite dev server before npm ci on Windows because its native module may be locked.

Against a fresh, seeded server at localhost:8080:

```powershell
npx.cmd playwright install chromium
npm.cmd run test:browser
```

For installed Edge, set `$env:BROWSER_CHANNEL='msedge'` and omit the Chromium download. Override BASE_URL and SMOKE_OUTPUT as needed. The smoke test creates and deletes a record and expects the ten initial examples; use disposable demo data.

## Evidence limits

Coverage measures executed code, not exhaustive correctness. Browser checks are local desktop/mobile checks, not full cross-browser or accessibility certification. Load testing and authentication/authorization testing are outside the implemented scope. GitHub Actions is configured, but remote execution remains unverified until a push. The deck was rendered and checked structurally; it was not manually opened in desktop PowerPoint.
