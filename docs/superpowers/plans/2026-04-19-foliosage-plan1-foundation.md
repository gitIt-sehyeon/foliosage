# FolioSage Plan 1: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up Spring Boot backend with JWT auth and Flyway schema, and a Next.js frontend with auth pages wired to the backend.

**Architecture:** Spring Boot (Java 17) serves a REST API secured with JWT. PostgreSQL is managed via Spring Data JPA and Flyway. Next.js App Router communicates through a typed Axios client. VaultSage WebClient is configured but not yet called.

**Tech Stack:** Java 17, Spring Boot 3.2, Spring Security, JJWT 0.12, Spring Data JPA, Flyway, PostgreSQL, Spring WebFlux (WebClient), Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Axios

---

## File Structure

### Backend: `foliosage-backend/`
```
pom.xml
src/main/java/com/foliosage/
  FoliosageApplication.java
  config/
    SecurityConfig.java
    WebClientConfig.java
  security/
    JwtTokenProvider.java
    JwtAuthenticationFilter.java
    UserDetailsServiceImpl.java
  entity/
    User.java
    Portfolio.java
    PortfolioFile.java
    Certificate.java
  repository/
    UserRepository.java
  controller/
    AuthController.java
  service/
    AuthService.java
  dto/
    auth/SignupRequest.java
    auth/LoginRequest.java
    auth/AuthResponse.java
  exception/
    GlobalExceptionHandler.java
src/main/resources/
  application.yml
  db/migration/V1__init_schema.sql
src/test/java/com/foliosage/controller/
  AuthControllerTest.java
src/test/resources/
  application-test.yml
```

### Frontend: `foliosage-frontend/`
```
package.json / next.config.ts
app/
  layout.tsx
  page.tsx          (landing)
  login/page.tsx
  signup/page.tsx
  dashboard/page.tsx  (stub)
lib/api.ts
lib/auth.ts
.env.local
```

---

## Task 1: Spring Boot Project Setup

**Files:**
- Create: `foliosage-backend/pom.xml`
- Create: `foliosage-backend/src/main/java/com/foliosage/FoliosageApplication.java`
- Create: `foliosage-backend/src/main/resources/application.yml`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p foliosage-backend/src/main/java/com/foliosage/{config,security,entity,repository,controller,service,dto/{auth,portfolio},exception}
mkdir -p foliosage-backend/src/main/resources/db/migration
mkdir -p foliosage-backend/src/test/java/com/foliosage/controller
mkdir -p foliosage-backend/src/test/resources
```

- [ ] **Step 2: Create `pom.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.4</version>
    </parent>
    <groupId>com.foliosage</groupId>
    <artifactId>foliosage-backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <properties><java.version>17</java.version></properties>
    <dependencies>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-security</artifactId></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-data-jpa</artifactId></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-validation</artifactId></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-webflux</artifactId></dependency>
        <dependency><groupId>org.flywaydb</groupId><artifactId>flyway-core</artifactId></dependency>
        <dependency><groupId>org.flywaydb</groupId><artifactId>flyway-database-postgresql</artifactId></dependency>
        <dependency><groupId>org.postgresql</groupId><artifactId>postgresql</artifactId><scope>runtime</scope></dependency>
        <dependency><groupId>io.jsonwebtoken</groupId><artifactId>jjwt-api</artifactId><version>0.12.5</version></dependency>
        <dependency><groupId>io.jsonwebtoken</groupId><artifactId>jjwt-impl</artifactId><version>0.12.5</version><scope>runtime</scope></dependency>
        <dependency><groupId>io.jsonwebtoken</groupId><artifactId>jjwt-jackson</artifactId><version>0.12.5</version><scope>runtime</scope></dependency>
        <dependency><groupId>org.apache.pdfbox</groupId><artifactId>pdfbox</artifactId><version>3.0.2</version></dependency>
        <dependency><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId><optional>true</optional></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-test</artifactId><scope>test</scope></dependency>
        <dependency><groupId>org.springframework.security</groupId><artifactId>spring-security-test</artifactId><scope>test</scope></dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes><exclude><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId></exclude></excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

- [ ] **Step 3: Create `FoliosageApplication.java`**

```java
package com.foliosage;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class FoliosageApplication {
    public static void main(String[] args) {
        SpringApplication.run(FoliosageApplication.class, args);
    }
}
```

- [ ] **Step 4: Create `application.yml`**

```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/foliosage}
    username: ${DB_USERNAME:foliosage}
    password: ${DB_PASSWORD:foliosage}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
  flyway:
    enabled: true
    locations: classpath:db/migration

server:
  port: 8080

jwt:
  secret: ${JWT_SECRET:foliosage-default-secret-key-minimum-256-bits-long}
  expiration-ms: 86400000

vaultsage:
  api-key: ${VAULTSAGE_API_KEY}
  base-url: ${VAULTSAGE_BASE_URL:https://api.vaultsage.ai}

cors:
  allowed-origins: ${CORS_ORIGINS:http://localhost:3000}

app:
  base-url: ${APP_BASE_URL:http://localhost:3000}
```

- [ ] **Step 5: Start PostgreSQL and verify compilation**

```bash
docker run -d \
  --name foliosage-pg \
  -e POSTGRES_DB=foliosage \
  -e POSTGRES_USER=foliosage \
  -e POSTGRES_PASSWORD=foliosage \
  -p 5432:5432 \
  postgres:16

cd foliosage-backend
./mvnw compile
```

Expected: `BUILD SUCCESS`

- [ ] **Step 6: Commit**

```bash
git init && git add . && git commit -m "feat: spring boot project scaffold"
```

---

## Task 2: Database Schema

**Files:**
- Create: `foliosage-backend/src/main/resources/db/migration/V1__init_schema.sql`

- [ ] **Step 1: Create `V1__init_schema.sql`**

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name          VARCHAR(100) NOT NULL,
    bio           TEXT,
    vaultsage_token VARCHAR(500),
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE portfolios (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title              VARCHAR(255) NOT NULL,
    description        TEXT,
    organizer_id       VARCHAR(100),
    share_code         VARCHAR(100) UNIQUE,
    vaultsage_share_id VARCHAR(100),
    is_published       BOOLEAN NOT NULL DEFAULT false,
    created_at         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE portfolio_files (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id      UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    vaultsage_file_id VARCHAR(100) NOT NULL,
    name              VARCHAR(255) NOT NULL,
    file_hash         VARCHAR(64) NOT NULL,
    file_size         BIGINT,
    mime_type         VARCHAR(100),
    certified_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE certificates (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id   UUID NOT NULL UNIQUE REFERENCES portfolio_files(id) ON DELETE CASCADE,
    pdf_path  VARCHAR(500),
    issued_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_portfolios_user     ON portfolios(user_id);
CREATE INDEX idx_portfolio_files_pid ON portfolio_files(portfolio_id);
CREATE INDEX idx_certificates_file   ON certificates(file_id);
```

- [ ] **Step 2: Run and verify migration**

```bash
./mvnw spring-boot:run
```

Expected in logs: `Successfully applied 1 migration to schema "public"`

- [ ] **Step 3: Commit**

```bash
git add src/main/resources/db/migration/
git commit -m "feat: database schema via flyway"
```

---

## Task 3: JPA Entities

**Files:**
- Create: `src/main/java/com/foliosage/entity/User.java`
- Create: `src/main/java/com/foliosage/entity/Portfolio.java`
- Create: `src/main/java/com/foliosage/entity/PortfolioFile.java`
- Create: `src/main/java/com/foliosage/entity/Certificate.java`

- [ ] **Step 1: Create `User.java`**

```java
package com.foliosage.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "vaultsage_token")
    private String vaultsageToken;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
```

- [ ] **Step 2: Create `Portfolio.java`**

```java
package com.foliosage.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Table(name = "portfolios")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Portfolio {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "organizer_id")
    private String organizerId;

    @Column(name = "share_code", unique = true)
    private String shareCode;

    @Column(name = "vaultsage_share_id")
    private String vaultsageShareId;

    @Column(name = "is_published", nullable = false)
    private boolean published = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
```

- [ ] **Step 3: Create `PortfolioFile.java`**

```java
package com.foliosage.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Table(name = "portfolio_files")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PortfolioFile {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @Column(name = "vaultsage_file_id", nullable = false)
    private String vaultsageFileId;

    @Column(nullable = false)
    private String name;

    @Column(name = "file_hash", nullable = false)
    private String fileHash;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "certified_at", nullable = false)
    private LocalDateTime certifiedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
```

- [ ] **Step 4: Create `Certificate.java`**

```java
package com.foliosage.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Table(name = "certificates")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Certificate {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id", nullable = false, unique = true)
    private PortfolioFile file;

    @Column(name = "pdf_path")
    private String pdfPath;

    @Column(name = "issued_at", nullable = false)
    private LocalDateTime issuedAt;
}
```

- [ ] **Step 5: Verify compilation**

```bash
./mvnw compile
```

Expected: `BUILD SUCCESS`

- [ ] **Step 6: Commit**

```bash
git add src/main/java/com/foliosage/entity/
git commit -m "feat: JPA entities"
```

---

## Task 4: JWT Security & WebClient

**Files:**
- Create: `src/main/java/com/foliosage/security/JwtTokenProvider.java`
- Create: `src/main/java/com/foliosage/security/JwtAuthenticationFilter.java`
- Create: `src/main/java/com/foliosage/security/UserDetailsServiceImpl.java`
- Create: `src/main/java/com/foliosage/config/SecurityConfig.java`
- Create: `src/main/java/com/foliosage/config/WebClientConfig.java`
- Create: `src/main/java/com/foliosage/repository/UserRepository.java`

- [ ] **Step 1: Create `UserRepository.java`**

```java
package com.foliosage.repository;

import com.foliosage.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

- [ ] **Step 2: Create `JwtTokenProvider.java`**

```java
package com.foliosage.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {
    private final SecretKey key;
    private final long expirationMs;

    public JwtTokenProvider(@Value("${jwt.secret}") String secret,
                            @Value("${jwt.expiration-ms}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(String email) {
        return Jwts.builder().subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key).compact();
    }

    public String getEmailFromToken(String token) {
        return Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload().getSubject();
    }

    public boolean validateToken(String token) {
        try { Jwts.parser().verifyWith(key).build().parseSignedClaims(token); return true; }
        catch (JwtException | IllegalArgumentException e) { return false; }
    }
}
```

- [ ] **Step 3: Create `UserDetailsServiceImpl.java`**

```java
package com.foliosage.security;

import com.foliosage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .map(u -> User.withUsername(u.getEmail())
                        .password(u.getPasswordHash()).authorities("ROLE_USER").build())
                .orElseThrow(() -> new UsernameNotFoundException("Not found: " + email));
    }
}
```

- [ ] **Step 4: Create `JwtAuthenticationFilter.java`**

```java
package com.foliosage.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component @RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                                    FilterChain chain) throws ServletException, IOException {
        String header = req.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtTokenProvider.validateToken(token)) {
                UserDetails ud = userDetailsService.loadUserByUsername(
                        jwtTokenProvider.getEmailFromToken(token));
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(ud, null, ud.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        chain.doFilter(req, res);
    }
}
```

- [ ] **Step 5: Create `SecurityConfig.java`**

```java
package com.foliosage.config;

import com.foliosage.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;
import java.util.List;

@Configuration @EnableWebSecurity @RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtFilter;

    @Value("${cors.allowed-origins}") private String allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(c -> c.disable())
                .cors(c -> c.configurationSource(corsSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(a -> a
                        .requestMatchers("/api/auth/**", "/api/public/**").permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of(allowedOrigins.split(",")));
        cfg.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }
}
```

- [ ] **Step 6: Create `WebClientConfig.java`**

```java
package com.foliosage.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {
    @Value("${vaultsage.base-url}") private String baseUrl;
    @Value("${vaultsage.api-key}")  private String apiKey;

    @Bean
    public WebClient vaultSageClient() {
        return WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .codecs(c -> c.defaultCodecs().maxInMemorySize(50 * 1024 * 1024))
                .build();
    }
}
```

- [ ] **Step 7: Verify compilation**

```bash
./mvnw compile
```

Expected: `BUILD SUCCESS`

- [ ] **Step 8: Commit**

```bash
git add src/main/java/com/foliosage/
git commit -m "feat: JWT security and VaultSage WebClient config"
```

---

## Task 5: Auth Endpoints

**Files:**
- Create: `src/main/java/com/foliosage/dto/auth/SignupRequest.java`
- Create: `src/main/java/com/foliosage/dto/auth/LoginRequest.java`
- Create: `src/main/java/com/foliosage/dto/auth/AuthResponse.java`
- Create: `src/main/java/com/foliosage/service/AuthService.java`
- Create: `src/main/java/com/foliosage/controller/AuthController.java`
- Create: `src/main/java/com/foliosage/exception/GlobalExceptionHandler.java`
- Test: `src/test/java/com/foliosage/controller/AuthControllerTest.java`

- [ ] **Step 1: Write failing test**

```java
package com.foliosage.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foliosage.dto.auth.SignupRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test") @Transactional
class AuthControllerTest {
    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    void signup_withValidData_returns200AndToken() throws Exception {
        var req = new SignupRequest("test@example.com", "password123", "Tester");
        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void signup_withDuplicateEmail_returns409() throws Exception {
        var req = new SignupRequest("dup@example.com", "password123", "Dup");
        mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req))).andReturn();
        mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict());
    }

    @Test
    void login_withValidCredentials_returns200AndToken() throws Exception {
        var signup = new SignupRequest("login@example.com", "password123", "User");
        mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signup))).andReturn();
        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"login@example.com\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }
}
```

- [ ] **Step 2: Create `src/test/resources/application-test.yml`**

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/foliosage
    username: foliosage
    password: foliosage
jwt:
  secret: test-secret-key-minimum-256-bit-length-padding-ok
  expiration-ms: 86400000
vaultsage:
  api-key: test-key
  base-url: http://localhost:9999
cors:
  allowed-origins: http://localhost:3000
app:
  base-url: http://localhost:3000
```

- [ ] **Step 3: Run test to confirm failure**

```bash
./mvnw test -Dtest=AuthControllerTest
```

Expected: FAIL — `SignupRequest` not found

- [ ] **Step 4: Create DTOs**

```java
// dto/auth/SignupRequest.java
package com.foliosage.dto.auth;
import jakarta.validation.constraints.*;
public record SignupRequest(
        @Email @NotBlank String email,
        @NotBlank @Size(min = 6) String password,
        @NotBlank String name) {}
```

```java
// dto/auth/LoginRequest.java
package com.foliosage.dto.auth;
import jakarta.validation.constraints.*;
public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
```

```java
// dto/auth/AuthResponse.java
package com.foliosage.dto.auth;
public record AuthResponse(String token, String email, String name) {}
```

- [ ] **Step 5: Create `AuthService.java`**

```java
package com.foliosage.service;

import com.foliosage.dto.auth.*;
import com.foliosage.entity.User;
import com.foliosage.repository.UserRepository;
import com.foliosage.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service @RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthResponse signup(SignupRequest req) {
        if (userRepository.existsByEmail(req.email()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        User user = userRepository.save(User.builder()
                .email(req.email())
                .passwordHash(passwordEncoder.encode(req.password()))
                .name(req.name()).build());
        return new AuthResponse(jwtTokenProvider.generateToken(user.getEmail()), user.getEmail(), user.getName());
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!passwordEncoder.matches(req.password(), user.getPasswordHash()))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        return new AuthResponse(jwtTokenProvider.generateToken(user.getEmail()), user.getEmail(), user.getName());
    }
}
```

- [ ] **Step 6: Create `AuthController.java`**

```java
package com.foliosage.controller;

import com.foliosage.dto.auth.*;
import com.foliosage.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/signup")
    public AuthResponse signup(@Valid @RequestBody SignupRequest req) { return authService.signup(req); }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) { return authService.login(req); }
}
```

- [ ] **Step 7: Create `GlobalExceptionHandler.java`**

```java
package com.foliosage.exception;

import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleStatus(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode())
                .body(Map.of("error", ex.getReason() != null ? ex.getReason() : ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(Map.of("error", errors));
    }
}
```

- [ ] **Step 8: Run tests**

```bash
./mvnw test -Dtest=AuthControllerTest
```

Expected: `Tests run: 3, Failures: 0, Errors: 0`

- [ ] **Step 9: Commit**

```bash
git add src/
git commit -m "feat: signup and login endpoints with JWT"
```

---

## Task 6: Next.js Frontend

**Files:** Full `foliosage-frontend/` project

- [ ] **Step 1: Bootstrap project**

```bash
npx create-next-app@latest foliosage-frontend \
  --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
cd foliosage-frontend
npm install axios zustand
npx shadcn@latest init
npx shadcn@latest add button input label card badge
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local
```

- [ ] **Step 2: Create `lib/api.ts`**

```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080',
})

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
```

- [ ] **Step 3: Create `lib/auth.ts`**

```typescript
export const setToken = (token: string) => localStorage.setItem('token', token)
export const getToken = () => localStorage.getItem('token')
export const removeToken = () => localStorage.removeItem('token')
export const isLoggedIn = () => !!getToken()
```

- [ ] **Step 4: Create `app/page.tsx`**

```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white">
      <nav className="flex justify-between items-center px-8 py-5">
        <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          FolioSage
        </span>
        <div className="flex gap-3">
          <Link href="/login"><Button variant="ghost" className="text-white">Login</Button></Link>
          <Link href="/signup"><Button className="bg-purple-600 hover:bg-purple-700">Get Started</Button></Link>
        </div>
      </nav>
      <div className="flex flex-col items-center justify-center text-center px-4 py-32">
        <h1 className="text-6xl font-bold mb-6 leading-tight">
          Your portfolio<br />
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            talks back
          </span>
        </h1>
        <p className="text-xl text-slate-300 mb-10 max-w-2xl">
          Upload your work. AI organizes it. Visitors chat with it.
          Every file gets a creation certificate — proof it&apos;s yours.
        </p>
        <Link href="/signup">
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700 px-10 py-6 text-lg">
            Create Your Portfolio
          </Button>
        </Link>
      </div>
      <div className="flex justify-center gap-16 pb-20 text-center">
        {[
          { icon: '🤖', title: 'AI Auto-Organize', desc: 'Smart Organizer categorizes files by project' },
          { icon: '💬', title: 'Portfolio Chat', desc: 'Visitors ask questions, AI answers from your files' },
          { icon: '📜', title: 'Creation Certificate', desc: 'SHA-256 + timestamp proof for every file' },
        ].map(f => (
          <div key={f.title} className="max-w-xs">
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
            <p className="text-slate-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 5: Create `app/signup/page.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'
import { setToken } from '@/lib/auth'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/api/auth/signup', form)
      setToken(data.token)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Signup failed.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle className="text-2xl text-center">Join FolioSage</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
            <div><Label>Password</Label><Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} /></div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </Button>
            <p className="text-center text-sm text-slate-500">
              Already have an account? <Link href="/login" className="text-purple-600">Log in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 6: Create `app/login/page.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'
import { setToken } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/api/auth/login', form)
      setToken(data.token)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Login failed.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle className="text-2xl text-center">Welcome back</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
            <div><Label>Password</Label><Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required /></div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <p className="text-center text-sm text-slate-500">
              No account? <Link href="/signup" className="text-purple-600">Sign up</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 7: Create `app/dashboard/page.tsx`**

```typescript
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isLoggedIn, removeToken } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const router = useRouter()
  useEffect(() => { if (!isLoggedIn()) router.push('/login') }, [router])

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex justify-between items-center px-8 py-4 bg-white border-b">
        <span className="text-xl font-bold text-purple-600">FolioSage</span>
        <div className="flex gap-3">
          <Link href="/portfolios/new">
            <Button className="bg-purple-600 hover:bg-purple-700">+ New Portfolio</Button>
          </Link>
          <Button variant="ghost" onClick={() => { removeToken(); router.push('/login') }}>Logout</Button>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">My Portfolios</h1>
        <p className="text-slate-500">No portfolios yet. Create your first one!</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Verify end-to-end**

```bash
# Terminal 1
cd foliosage-backend && ./mvnw spring-boot:run

# Terminal 2
cd foliosage-frontend && npm run dev
```

Open http://localhost:3000 → landing renders. Sign up → redirects to dashboard.

- [ ] **Step 9: Commit**

```bash
git add . && git commit -m "feat: next.js frontend with auth pages"
```

---

## Plan 1 Complete

- ✅ Spring Boot with all dependencies (pom.xml)
- ✅ PostgreSQL schema via Flyway
- ✅ JPA entities: User, Portfolio, PortfolioFile, Certificate
- ✅ JWT auth — 3 tests passing
- ✅ VaultSage WebClient configured
- ✅ Next.js frontend: landing, login, signup, dashboard stub

**Next:** Plan 2 — VaultSage file upload, Smart Organizer pipeline, file gallery frontend.
