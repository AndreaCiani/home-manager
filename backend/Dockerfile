# --- Stage 1: build the jar with Maven ---
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
# Dependencies first (leverages Docker's cache)
COPY pom.xml .
RUN mvn -q dependency:go-offline
# Then the source code
COPY src ./src
RUN mvn -q clean package -DskipTests

# --- Stage 2: lightweight runtime image ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# curl is used by the container healthcheck.
RUN apk add --no-cache curl
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
