# Step 1: Multi-stage Build with Maven and JDK 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml and source code
COPY backend/pom.xml ./pom.xml
COPY backend/src ./src

# Compile and package Spring Boot executable JAR
RUN mvn clean package -DskipTests

# Step 2: Lightweight Runtime Container with Alpine JRE 21
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy compiled JAR artifact
COPY --from=build /app/target/*.jar app.jar

# Expose Spring Boot port 8080
EXPOSE 8080

# Environment variables
ENV PORT=8080
ENV JAVA_OPTS="-Xmx256m -Xms128m"

# Launch Spring Boot Application on port 8080
ENTRYPOINT ["java", "-Dserver.port=8080", "-jar", "app.jar"]
