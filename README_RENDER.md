Deploying this project to Render.com (quick guide)

1) Prepare repository
 - Repo already contains `demo/` (Spring Boot app), `control/` (frontend) and `index.html`.
 - We added a `demo/Dockerfile` and `.dockerignore` so Render can build the container.

2) Update environment variables on Render
 - Create a Managed Database (PostgreSQL recommended) in Render or use any managed Postgres service.
 - In your Render Web Service, set these Environment Variables:
   - `SPRING_DATASOURCE_URL` = `jdbc:postgresql://<HOST>:<PORT>/<DBNAME>`
   - `SPRING_DATASOURCE_USERNAME` = `<db_user>`
   - `SPRING_DATASOURCE_PASSWORD` = `<db_password>`
   - `SPRING_JPA_HIBERNATE_DDL_AUTO` = `update` (or `validate` in production)
   - `PORT` = `8080` (Render provides a port automatically but this keeps defaults)

 - If your provider gives a single `DATABASE_URL` in the form `postgres://user:pass@host:port/dbname`, convert it to JDBC like this:
   - Example provider URL: `postgres://alice:secret@db.example.com:5432/proyectocanal`
   - JDBC form: `jdbc:postgresql://db.example.com:5432/proyectocanal`
   - User: `alice`, Password: `secret`

3) Create a Render Web Service
 - Sign in to Render.com and create a new Web Service.
 - Connect your GitHub repo and select the `demo` folder (or Dockerfile build).
 - Select Docker as the environment (Render will use Dockerfile).
 - Add the environment variables from step (2). Ensure the managed PostgreSQL database is running and reachable from the service.

4) Deploy and test
 - Deploy the service. After successful build, open the service URL and test the API:
   - `GET https://<your-service>.onrender.com/api/sensores`

5) Host frontend
 - Option A (recommended): Serve static frontend from the same domain by building a small static handler in Spring Boot or configuring a static site on Render.
 - Option B: Host `control/` and `index.html` on Render Static Sites / Netlify / GitHub Pages and point frontend API calls to the backend URL.

Notes & best practices
 - Do not commit production DB credentials to the repo. Use Render environment variables.
 - Use backups on the managed DB and secure access.
 - Consider Flyway or Liquibase for schema migrations in production.
