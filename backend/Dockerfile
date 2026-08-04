# --- Stage 1: build del jar con Maven ---
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
# Prima le dipendenze (sfrutta la cache di Docker)
COPY pom.xml .
RUN mvn -q dependency:go-offline
# Poi il codice
COPY src ./src
RUN mvn -q clean package -DskipTests

# --- Stage 2: immagine di runtime leggera ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
