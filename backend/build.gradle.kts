plugins {
    id("io.micronaut.application") version "4.6.2"
    id("com.gradleup.shadow") version "8.3.9"
    id("io.micronaut.aot") version "4.6.2"
}

version = "0.1"
group = "com.example"



repositories {
    mavenCentral()
}

dependencies {
    // --- MANTÉM OS PROCESSADORES ORIGINAIS ---
    annotationProcessor("io.micronaut:micronaut-http-validation")
    annotationProcessor("io.micronaut.serde:micronaut-serde-processor")
    
    // --- 🟢 NOVOS PROCESSADORES PARA JPA E SEGURANÇA ---
    annotationProcessor("io.micronaut.data:micronaut-data-processor")
    annotationProcessor("io.micronaut.security:micronaut-security-annotations")

    // --- MANTÉM ---
    implementation("io.micronaut.serde:micronaut-serde-jackson")

    // --- 🟢 NOVAS DEPENDÊNCIAS DE BANCO DE DADOS E JWT ---
    // 1. Micronaut Data (Hibernate/JPA) e Conexão Hikari
    implementation("io.micronaut.data:micronaut-data-hibernate-jpa")
    implementation("io.micronaut.sql:micronaut-jdbc-hikari")
    // 2. Driver do PostgreSQL (só precisamos na hora de rodar)
    runtimeOnly("org.postgresql:postgresql")
    // 3. Suporte a programação reativa (Flux/Mono) para a Segurança
    implementation("io.micronaut.security:micronaut-security-jwt")   
    implementation("io.micronaut.reactor:micronaut-reactor")

    // --- MANTÉM OS OUTROS ORIGINAIS ---
    compileOnly("io.micronaut:micronaut-http-client")
    runtimeOnly("ch.qos.logback:logback-classic")
    testImplementation("io.micronaut:micronaut-http-client")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")

    // Criptografia de Senhas
    implementation("org.mindrot:jbcrypt:0.4")   
}



application {
    mainClass = "com.example.Application"
}

java {
    sourceCompatibility = JavaVersion.toVersion("21")
    targetCompatibility = JavaVersion.toVersion("21")
}




graalvmNative.toolchainDetection = false





micronaut {
    runtime("netty")
    testRuntime("junit5")
    processing {
        incremental(true)
        annotations("com.example.*")
    }
    aot {
        // Please review carefully the optimizations enabled below
        // Check https://micronaut-projects.github.io/micronaut-aot/latest/guide/ for more details
        optimizeServiceLoading = false
        convertYamlToJava = false
        precomputeOperations = true
        cacheEnvironment = true
        optimizeClassLoading = true
        deduceEnvironment = true
        optimizeNetty = true
        replaceLogbackXml = true
    }

}


tasks.named<io.micronaut.gradle.docker.NativeImageDockerfile>("dockerfileNative") {
    jdkVersion = "21"
}


// Faz o comando 'gradlew run' ler o arquivo .env automaticamente
tasks.named<JavaExec>("run") {
    val envFile = file(".env")
    if (envFile.exists()) {
        envFile.readLines().forEach { line ->
            if (line.isNotBlank() && !line.startsWith("#")) {
                val key = line.substringBefore("=").trim()
                val value = line.substringAfter("=").trim()
                environment(key, value)
            }
        }
    }
}




