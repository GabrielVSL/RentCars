# ==============================================================================
# ESTÁGIO 1: Build da aplicação Micronaut com JDK 21
# ==============================================================================
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copia scripts do wrapper e arquivos de configuração primeiro para aproveitar o cache do Docker
COPY gradle/ gradle/
COPY gradlew gradlew.bat settings.gradle.kts build.gradle.kts gradle.properties ./

RUN chmod +x ./gradlew

# Copia o código-fonte
COPY src/ src/

# Gera o Fat JAR unificado (Shadow JAR)
RUN ./gradlew shadowJar --no-daemon -x test

# ==============================================================================
# ESTÁGIO 2: Runtime de Produção (JRE 21 Alpine - ~140MB)
# ==============================================================================
FROM eclipse-temurin:21-jre-alpine AS runner

WORKDIR /app

# Boas práticas de segurança: executar sem privilégios de root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copia o JAR gerado no estágio anterior
COPY --from=builder /app/build/libs/*-all.jar app.jar

RUN chown -R appuser:appgroup /app
USER appuser

# Porta padrão de escuta
ENV PORT=8080
EXPOSE 8080

# Flags da JVM otimizadas para containers com 512MB de RAM (Free Tiers de nuvem)
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-XX:+UseSerialGC", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
