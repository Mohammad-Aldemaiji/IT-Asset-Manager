# Technology stack

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React, React DOM, React Router | Pages, forms and navigation |
| Client data | Browser fetch, React Context and effects | API calls, asynchronous state and invalidation |
| Frontend build | Node.js 22.13+, Vite | Development proxy and production assets |
| Backend | Java 21, Spring Boot 3.5.16, Spring MVC | HTTP server and REST routing |
| Validation | Jakarta Bean Validation and custom validator | Input and business rules |
| Storage | Spring Data JPA, Hibernate, H2 file database | Persistent records, sequence IDs and paginated queries |
| Backend build | Maven Wrapper 3.9.11 | Reproducible Maven execution and executable JAR |
| Backend tests | JUnit Jupiter, Mockito, MockMvc, Spring Boot Test | Unit, HTTP, repository and application-flow tests |
| Coverage | JaCoCo and Vitest v8 | Backend and frontend code coverage |
| Frontend tests | Vitest, React Testing Library, jsdom | User flows with mocked HTTP responses |
| Browser smoke | Playwright | Real React/Spring interaction and responsive screenshots |
| CI | GitHub Actions | Frontend and backend checks after push |

Exact JavaScript dependency versions are locked in package-lock.json. Backend dependency versions are managed by the pinned Spring Boot parent in backend/pom.xml. Java 8 is insufficient for this application. The Windows demo includes its own Java 21 runtime for running, while source compilation requires a full JDK 21.
