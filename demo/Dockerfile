FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /app

# Copy only what is needed to build to leverage layer caching
COPY pom.xml .
COPY src ./src

# Build the application (skip tests for faster builds)
RUN mvn -B -DskipTests package \
	&& echo "build finished, listing target:" \
	&& ls -la target || true

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy the fat jar produced by the build stage
## Copy a single runnable jar from the build stage.
## Avoid copying files ending with .original (these are the unhashed originals).
COPY --from=build /app/target/*.jar /app/
WORKDIR /app
RUN set -eux; \
	# prefer a repackaged jar (not the .original one)
	JAR=$(ls /app/target/*.jar 2>/dev/null | grep -v '\.original' | head -n 1 || true); \
	if [ -z "$JAR" ]; then echo "ERROR: no jar found in /app/target"; ls -la /app/target || true; exit 1; fi; \
	cp "$JAR" /app/app.jar; \
	ls -la /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
