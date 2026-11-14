# IT Asset Manager Part 2

A React interface connected to a Java Spring Boot REST server. Users can create, find, edit and delete IT equipment, browse server-paginated search results, and view complete dashboard statistics. H2 file storage preserves changes after browser refreshes and server restarts.

## Run the prepared Windows demo

The separately delivered Windows demo includes the compiled application and a portable Java 21 runtime. Extract the entire demo ZIP to a writable folder and double-click **Start-Demo.cmd**. Open http://127.0.0.1:8080 after Spring starts. No Java, Node, Maven installation or internet connection is needed for this prepared demo. Keep the terminal open and press Ctrl+C to stop.

## Build and run from source

Prerequisites: JDK 21, Node.js 22.13 or later, and internet access for initial dependency downloads. Maven is downloaded by the checked-in Maven Wrapper. Set JAVA_HOME to the JDK 21 folder if your default Java is older.

On Windows, stop any running Vite dev server before rebuilding, then run from the repository root:

~~~powershell
powershell -ExecutionPolicy Bypass -File .\Build-Release.ps1
cd backend
java -jar target\it-asset-manager-2.0.0.jar
~~~

Open http://localhost:8080. The executable JAR contains both the Spring backend and the React production build. Direct links such as /assets/AST-0001/edit work without going through the home page.

Equivalent manual commands on macOS/Linux:

~~~bash
npm ci
npm run lint
npm test
npm run build
cd backend
bash mvnw -B clean verify
java -jar target/it-asset-manager-2.0.0.jar
~~~

## Develop with hot reload

Terminal 1, from backend:

~~~powershell
.\mvnw.cmd spring-boot:run
~~~

Terminal 2, from the repository root:

~~~powershell
npm.cmd ci
npm.cmd run dev
~~~

Use the URL Vite prints. Vite proxies /api to http://127.0.0.1:8080, so no permissive CORS configuration is necessary. Set API_PROXY_TARGET if the backend uses another port. For a production build, run npm run build BEFORE Maven packaging so the latest frontend is included.

## Tests

~~~powershell
# Repository root
npm.cmd test
npm.cmd run coverage
npm.cmd run lint
npm.cmd run build
# Backend folder
.\mvnw.cmd -B verify
~~~

Frontend: 73 passing tests. Backend: 40 passing tests using JUnit, Mockito, MockMvc and H2. See [testing evidence](docs/TESTING.md) and [the complete explanation](docs/PART2_WALKTHROUGH.md).

Optional real-browser smoke test, against a fresh seeded demo server:

~~~powershell
npx.cmd playwright install chromium
$env:BASE_URL='http://127.0.0.1:8080'
npm.cmd run test:browser
~~~

Set BROWSER_CHANNEL=msedge to use installed Microsoft Edge instead of downloading Chromium. The smoke test creates and deletes one clearly named demo asset. Run it against a disposable demo database, not real asset data.

## Storage and configuration

Start the JAR from the backend folder so the default database is backend/data/it-assets.mv.db. The Windows demo starts in its own application folder and stores data in that folder's data directory. Use the same working directory between restarts. Do not run two servers against the same H2 file.

| Environment variable | Default | Purpose |
|---|---|---|
| PORT | 8080 | HTTP port |
| DB_URL | jdbc:h2:file:./data/it-assets;WRITE_DELAY=0 | JDBC database location |
| DB_USER | sa | Database user |
| DB_PASSWORD | empty | Local demo database password |
| APP_SEED | true | Seed ten example assets when the table is empty at startup |
| API_PROXY_TARGET | http://127.0.0.1:8080 | Vite development/preview proxy only |

Seed data is inserted only if the asset table is empty. If you intentionally delete every asset and restart with APP_SEED=true, sample assets will be inserted again. Set APP_SEED=false for an intentionally empty persistent database. IDs come from a database sequence, may contain gaps, and are not allocated in React.

## Team

| Name | Student ID |
|---|---|
| Mohammad Aldemaiji | 222110184 |
| Abdulmalik Mohamede | 221211415 |
| Abdulrahman Makhanik | 222110452 |
| Ibrahim Aldayhani | 222111329 |

## Documentation and presentation

- [Every change and how the code works](docs/PART2_WALKTHROUGH.md)
- [REST API contract](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Requirements and acceptance evidence](docs/REQUIREMENTS.md)
- [Tests and measured results](docs/TESTING.md)
- [Presentation script and code questions](docs/DEMO_GUIDE.md)
- [Code review and practical limits](docs/CODE_REVIEW.md)
- [AI assistance disclosure](docs/AI_USAGE.md)
- Two-slide editable PowerPoint in presentation/Final-Presentation.pptx

Original Part 1 documents are preserved under docs/part1-archive and describe the old frontend-only implementation.

## Submission

Copy these source files into your existing IT-Asset-Manager Git checkout, keeping its .git folder. Review git diff, run the build, commit, and push to the public repository. Do not upload node_modules, backend/target, data files, coverage output or the bundled Windows runtime to the source repository. The GitHub Actions workflow runs checks after push; it has not been executed remotely during this local implementation.

The supplied assignment specifies teams of three, while the owner supplied four team members. It also says the Part 2 backend is to be manually coded. This implementation was AI-assisted at the owner's request. Confirm those two submission conditions with the instructor. Authentication, public hosting and a particular database were not explicit Part 2 requirements. This deliverable is a local course demonstration and has no login or role restrictions.
