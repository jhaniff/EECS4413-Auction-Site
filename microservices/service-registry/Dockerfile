FROM eclipse-temurin:17-jre

WORKDIR /app

ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar

# Docker profile
ENV SPRING_PROFILES_ACTIVE=docker

EXPOSE 8761

ENTRYPOINT ["java", "-jar", "/app/app.jar"]