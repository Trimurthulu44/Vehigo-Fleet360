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

# Expose ports 8080 and 10000
EXPOSE 8080 10000

# JVM memory constraints for cloud free tier
ENV JAVA_OPTS="-Xmx256m -Xms128m"

# Launch Spring Boot Application evaluating dynamic PORT variable
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar app.jar"]
