# ─────────────────────────────────────────────
# STAGE 1 — Build the JAR using Maven
# ─────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven project descriptor first (for dependency caching)
COPY pom.xml .

# Download all dependencies (this layer is cached unless pom.xml changes)
RUN mvn dependency:go-offline -B

# Copy the rest of the source code
COPY src ./src

# Build the project and skip tests (faster build)
RUN mvn clean package -DskipTests

# ─────────────────────────────────────────────
# STAGE 2 — Run the JAR using a slim JRE image
# ─────────────────────────────────────────────
FROM openjdk:17-jdk-slim

# Set the working directory inside the container
WORKDIR /app

# Copy only the built JAR from the builder stage
COPY --from=builder /app/target/student-management-system-0.0.1-SNAPSHOT.jar app.jar

# Expose the port Spring Boot listens on
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
