FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /app

# Copy only what is needed to build to leverage layer caching
COPY pom.xml .
COPY src ./src

# Build the application (skip tests for faster builds)
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy the fat jar produced by the build stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app.jar"]
