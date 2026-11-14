# Part 2 requirements and acceptance evidence

The supplied Part 2 document requires a Spring server integrated with the React frontend, adding assets, searching by ID, paginated listing, updating, a JUnit/Mockito backend test suite, a public GitHub submission and a two-slide presentation followed by a demo.

| Requirement | Implementation | Evidence |
|---|---|---|
| Java Spring server | backend/pom.xml and AssetManagerApplication | ApplicationFlowTest boots the app |
| Add element | POST /api/assets and asynchronous add form | AssetServiceTest, AssetControllerTest, browser smoke |
| Search by ID | GET /api/assets/{id} and exact-ID lookup form | Backend ID tests and browser lookup/detail flows |
| Paginated results | Database Pageable query and React page controls | Repository pagination test, controller test, browser smoke |
| Update element | PUT /api/assets/{id} and shared edit form | Mockito service tests, controller test, browser update |
| Backend tests with JUnit and Mockito | Six backend test classes plus shared fixture | 40 tests pass locally |
| Integrate both parts | HTTP client, asynchronous pages and packaged React build | Real browser against the executable Spring JAR |
| Two presentation slides | Architecture diagram and native REST route table | presentation/Final-Presentation.pptx |
| Public repository | Source and CI workflow prepared | Owner must push to existing public repository |

Delete, filters, sorting, dashboard, responsive navigation and About are preserved from Part 1. Persistent H2 storage, field errors, retry behavior and a portable Windows demo are added completion conveniences. Authentication and online hosting are not stated Part 2 requirements and are not implemented.

## Validation

Required fields: name, category, brand, serialNumber, status, department, purchaseDate and purchasePrice. Name must be 2–80 characters. Brand is limited to 40, model/assignedTo/location to 60, serialNumber to 40 and notes to 500. Serial numbers contain letters, digits or dashes and are unique ignoring case. Prices are 0 to 10000000 SAR with at most two decimal places. Purchase date cannot be in the future. Warranty date, if supplied, cannot precede purchase date. In Use assets require an assignee. Fixed choices match src/constants/assetOptions.js.

The frontend validates for usability, while the backend enforces constraints on direct API calls as well. Duplicate checks run against the complete database, not just the current page.

## Submission conditions needing owner confirmation

The assignment states three students per team. Four supplied names and corresponding IDs are displayed accurately. Part 1 says the backend will be manually coded in Part 2. This implementation is AI-assisted, as disclosed in AI_USAGE.md. Confirm instructor acceptance of these conditions before submission. The stated Part 2 deadline is 14 November 2026.
