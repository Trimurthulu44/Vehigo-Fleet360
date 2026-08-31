# Step 1: Multi-stage Build with Maven and JDK 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Compile and package Spring Boot executable JAR
RUN mvn clean package -DskipTests

# Step 2: Lightweight Runtime Container with Alpine JRE 21
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy compiled JAR artifact
COPY --from=build /app/target/*.jar app.jar

# Expose Spring Boot web server port
EXPOSE 8080

# Restrain JVM heap memory for Koyeb free tier RAM limits
ENV JAVA_OPTS="-Xmx256m -Xms128m"

# Launch Spring Boot Application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
