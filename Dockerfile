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

# Expose default port
EXPOSE 8080 10000

# Restrain JVM heap memory for free tier RAM limits
ENV JAVA_OPTS="-Xmx256m -Xms128m"

# Launch Spring Boot Application with dynamic PORT binding for Render/Koyeb
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar app.jar"]
