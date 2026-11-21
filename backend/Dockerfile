# Build stage: compile and package the jar with the full JDK and Maven.
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
# Dependencies first, so this layer is cached until pom.xml changes.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q package -DskipTests

# Runtime stage: only the JRE and the jar, running as a non-root user.
FROM eclipse-temurin:21-jre
RUN useradd --system --uid 1001 trivallo \
    && mkdir -p /var/lib/trivallo/media \
    && chown trivallo /var/lib/trivallo/media
WORKDIR /app
# Uploaded images; mount a volume here so they survive container rebuilds.
ENV MEDIA_DIR=/var/lib/trivallo/media
VOLUME /var/lib/trivallo/media
COPY --from=build /workspace/target/trivallo-backend-*.jar app.jar
USER trivallo
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "/app/app.jar"]
