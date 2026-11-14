# Presentation and code explanation guide

The required deck has exactly two slides. There is no separate title slide. Both slides include speaker notes.

## Slide 1 architecture

Explain: "Our React frontend calls a Java Spring Boot REST API. The controller handles HTTP and validation. The service enforces asset rules and builds database searches. The JPA repository stores assets in an H2 file. The browser does not generate IDs or hold the authoritative asset collection. Our JAR also serves React, so the demo runs as one application."

## Slide 2 REST API table

Explain the difference between POST (create), GET (read), PUT (replace editable fields), and DELETE. Show that the list route returns pagination metadata. Mention 201 and Location for creation, 204 with no body for deletion, and 400/404/409 error cases. The stats route is an extra endpoint to preserve accurate dashboard totals.

## Suggested demo sequence

1. Start the Windows demo or built JAR. Show the dashboard and About page.
2. Open Assets. Show page 1 then page 2 with page size 5.
3. Filter by a category, search Dell, then clear filters. Explain that the server searches before pagination.
4. Add a device with a unique serial such as PRESENTATION-001. Use a past purchase date and status Available. Record the returned ID rather than assuming AST-0011.
5. Refresh its details page to show data is loaded from the backend.
6. Return to Assets and enter the ID in Find by exact asset ID.
7. Edit its name or assignment and save.
8. Try an existing serial number or an invalid price to show validation.
9. Open /assets/AST-9999 to show a missing ID.
10. Show the JUnit/Mockito service test, run the backend suite, and explain the mock repository.
11. Delete the demo asset. If time permits, restart the server while keeping an asset to demonstrate persistence.

## Likely code questions

**Why use a service between controller and repository?** It centralizes business behavior and transactions. Unit tests can replace storage with Mockito without starting HTTP or H2.

**What is mocked?** AssetServiceTest mocks AssetRepository. The real service runs, and assertions verify results and storage interactions. AssetControllerTest mocks services to isolate HTTP behavior. Repository and application-flow tests use real in-memory H2 instead.

**Why validate twice?** Frontend validation gives immediate guidance. Backend validation prevents bad data when callers bypass the UI.

**How is a duplicate serial blocked?** A case-insensitive pre-check gives a readable error. Values are stored uppercase and a unique database constraint also prevents two concurrent inserts with the same serial.

**How does pagination work?** The service passes a JPA Specification and PageRequest to the repository. SQL applies filters and sort, then offset and limit. The response includes totalElements and totalPages.

**Why do IDs sometimes skip a number?** Database sequences reserve IDs. A failed/rolled-back insert may consume a number. IDs identify assets and do not promise a gapless count.

**Why not compute dashboard totals from the visible list?** The list is only one page. A separate stats endpoint uses all assets.

**What does revision do?** It changes only after a successful write and causes active data queries to reload. It is not an asset ID or database version.

**What if a slow search finishes after a newer search?** Effect cleanup marks the older request inactive, so its reply cannot overwrite the new result.

**Why no CORS annotation?** Vite proxies /api during development, and the production JAR serves both sides from one origin.

**Where is the data?** In the H2 file under the process working directory's data folder. The demo always starts in the same folder. Test databases are separate in-memory instances.

**What remains outside scope?** Public hosting, login/roles, audit logging, import/export and production operations. Explain these limits honestly.

## Before submitting

Confirm the instructor accepts four team members and AI-assisted backend work. Push the source to the public repository, verify the CI result, and have one member submit the URL. Do not submit the demo runtime as source code. Read PART2_WALKTHROUGH.md and practice tracing a request from React to H2.
