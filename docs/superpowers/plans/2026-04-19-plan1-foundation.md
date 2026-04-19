# ClauseGuard — Plan 1: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up the full project skeleton — Spring Boot backend with JWT auth and AWS S3, PostgreSQL schema with Flyway migrations, and a Next.js frontend with auth pages wired to the backend.

**Architecture:** Spring Boot (Java 17) serves a REST API secured with JWT. PostgreSQL is managed via Spring Data JPA and Flyway migrations. Next.js (App Router) communicates with the backend through a typed API client. S3 is configured for file storage but not yet used for uploads.

**Tech Stack:** Java 17, Spring Boot 3.x, Spring Security, JJWT, Spring Data JPA, Flyway, PostgreSQL, AWS S3 SDK, Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Axios

---

## File Structure

### Backend: `clauseguard-backend/`
```
pom.xml
src/main/java/com/clauseguard/
  ClauseGuardApplication.java
  config/
    SecurityConfig.java
    S3Config.java
  security/
    JwtTokenProvider.java
    JwtAuthenticationFilter.java
    UserDetailsServiceImpl.java
  entity/
    User.java
    Workspace.java
    WorkspaceMember.java
    Contract.java
    ContractVersion.java
    Analysis.java
    Clause.java
    ShareLink.java
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
  db/migration/
    V1__init_schema.sql
```

### Frontend: `clauseguard-frontend/`
```
package.json
next.config.ts
tailwind.config.ts
app/
  layout.tsx
  page.tsx               (landing)
  login/page.tsx
  signup/page.tsx
  dashboard/page.tsx     (stub)
components/
  ui/                    (shadcn components)
  Navbar.tsx
lib/
  api.ts
  auth.ts
```

---

## Task 1: Spring Boot Project Setup

**Files:**
- Create: `clauseguard-backend/pom.xml`
- Create: `clauseguard-backend/src/main/java/com/clauseguard/ClauseGuardApplication.java`
- Create: `clauseguard-backend/src/main/resources/application.yml`

- [ ] **Step 1: Create the project directory**

```bash
mkdir -p clauseguard-backend/src/main/java/com/clauseguard
mkdir -p clauseguard-backend/src/main/resources/db/migration
mkdir -p clauseguard-backend/src/test/java/com/clauseguard
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

    <groupId>com.clauseguard</groupId>
    <artifactId>clauseguard-backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>clauseguard-backend</name>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-database-postgresql</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.5</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.5</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>software.amazon.awssdk</groupId>
            <artifactId>s3</artifactId>
            <version>2.25.28</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

- [ ] **Step 3: Create `ClauseGuardApplication.java`**

```java
// src/main/java/com/clauseguard/ClauseGuardApplication.java
package com.clauseguard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ClauseGuardApplication {
    public static void main(String[] args) {
        SpringApplication.run(ClauseGuardApplication.class, args);
    }
}
```

- [ ] **Step 4: Create `application.yml`**

```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/clauseguard}
    username: ${DB_USERNAME:clauseguard}
    password: ${DB_PASSWORD:clauseguard}
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
  secret: ${JWT_SECRET:changeme-minimum-256-bit-secret-key-for-hs256}
  expiration-ms: 86400000   # 24h
  refresh-expiration-ms: 604800000  # 7d

aws:
  region: ${AWS_REGION:ap-northeast-2}
  s3:
    bucket: ${S3_BUCKET:clauseguard-files}

vaultsage:
  api-key: ${VAULTSAGE_API_KEY}
  base-url: ${VAULTSAGE_BASE_URL:https://api.vaultsage.ai}

cors:
  allowed-origins: ${CORS_ORIGINS:http://localhost:3000}
```

- [ ] **Step 5: Start a local PostgreSQL with Docker and verify the app starts**

```bash
docker run -d \
  --name clauseguard-pg \
  -e POSTGRES_DB=clauseguard \
  -e POSTGRES_USER=clauseguard \
  -e POSTGRES_PASSWORD=clauseguard \
  -p 5432:5432 \
  postgres:16

cd clauseguard-backend
./mvnw spring-boot:run
```

Expected: App starts but fails on Flyway (no migrations yet). That's fine.

- [ ] **Step 6: Commit**

```bash
git init clauseguard-backend
cd clauseguard-backend
git add .
git commit -m "feat: spring boot project scaffold"
```

---

## Task 2: Database Schema (Flyway Migration)

**Files:**
- Create: `clauseguard-backend/src/main/resources/db/migration/V1__init_schema.sql`

- [ ] **Step 1: Create `V1__init_schema.sql`**

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE preferred_lang AS ENUM ('ko', 'en');
CREATE TYPE member_role AS ENUM ('owner', 'editor', 'viewer');
CREATE TYPE analysis_status AS ENUM ('pending', 'processing', 'done', 'failed');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    preferred_lang preferred_lang NOT NULL DEFAULT 'ko',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE workspace_members (
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role member_role NOT NULL DEFAULT 'viewer',
    PRIMARY KEY (workspace_id, user_id)
);

CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    uploader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE contract_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    version_num INT NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (contract_id, version_num)
);

CREATE TABLE analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_version_id UUID NOT NULL REFERENCES contract_versions(id) ON DELETE CASCADE,
    status analysis_status NOT NULL DEFAULT 'pending',
    risk_score INT CHECK (risk_score BETWEEN 0 AND 100),
    summary_ko TEXT,
    summary_en TEXT,
    raw_json JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE clauses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    clause_index INT NOT NULL,
    original_text TEXT NOT NULL,
    risk_level risk_level NOT NULL,
    explanation_ko TEXT,
    explanation_en TEXT,
    suggestion_ko TEXT,
    suggestion_en TEXT
);

CREATE TABLE share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    token VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contracts_uploader ON contracts(uploader_id);
CREATE INDEX idx_contracts_workspace ON contracts(workspace_id);
CREATE INDEX idx_analyses_version ON analyses(contract_version_id);
CREATE INDEX idx_clauses_analysis ON clauses(analysis_id);
CREATE INDEX idx_share_links_token ON share_links(token);
```

- [ ] **Step 2: Run migrations and verify**

```bash
cd clauseguard-backend
./mvnw spring-boot:run
```

Expected: `Successfully applied 1 migration to schema "public"` in logs. App starts on port 8080.

- [ ] **Step 3: Commit**

```bash
git add src/main/resources/db/migration/V1__init_schema.sql
git commit -m "feat: add database schema via flyway"
```

---

## Task 3: JPA Entities

**Files:**
- Create: `src/main/java/com/clauseguard/entity/User.java`
- Create: `src/main/java/com/clauseguard/entity/Workspace.java`
- Create: `src/main/java/com/clauseguard/entity/WorkspaceMember.java`
- Create: `src/main/java/com/clauseguard/entity/WorkspaceMemberId.java`
- Create: `src/main/java/com/clauseguard/entity/Contract.java`
- Create: `src/main/java/com/clauseguard/entity/ContractVersion.java`
- Create: `src/main/java/com/clauseguard/entity/Analysis.java`
- Create: `src/main/java/com/clauseguard/entity/Clause.java`
- Create: `src/main/java/com/clauseguard/entity/ShareLink.java`

- [ ] **Step 1: Create `User.java`**

```java
package com.clauseguard.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String name;

    @Column(name = "preferred_lang")
    @Enumerated(EnumType.STRING)
    private PreferredLang preferredLang = PreferredLang.ko;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum PreferredLang { ko, en }
}
```

- [ ] **Step 2: Create `Workspace.java`**

```java
package com.clauseguard.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "workspaces")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Workspace {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
```

- [ ] **Step 3: Create `WorkspaceMemberId.java` and `WorkspaceMember.java`**

```java
package com.clauseguard.entity;

import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class WorkspaceMemberId implements Serializable {
    private UUID workspaceId;
    private UUID userId;
}
```

```java
package com.clauseguard.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "workspace_members")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkspaceMember {
    @EmbeddedId
    private WorkspaceMemberId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("workspaceId")
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private Role role = Role.viewer;

    public enum Role { owner, editor, viewer }
}
```

- [ ] **Step 4: Create `Contract.java`**

```java
package com.clauseguard.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "contracts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Contract {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploader_id", nullable = false)
    private User uploader;

    @Column(nullable = false)
    private String title;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
```

- [ ] **Step 5: Create `ContractVersion.java`**

```java
package com.clauseguard.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "contract_versions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContractVersion {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Column(name = "version_num", nullable = false)
    private int versionNum;

    @Column(name = "s3_key", nullable = false)
    private String s3Key;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
```

- [ ] **Step 6: Create `Analysis.java`**

```java
package com.clauseguard.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "analyses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Analysis {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_version_id", nullable = false)
    private ContractVersion contractVersion;

    @Enumerated(EnumType.STRING)
    private Status status = Status.pending;

    @Column(name = "risk_score")
    private Integer riskScore;

    @Column(name = "summary_ko", columnDefinition = "TEXT")
    private String summaryKo;

    @Column(name = "summary_en", columnDefinition = "TEXT")
    private String summaryEn;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_json", columnDefinition = "jsonb")
    private Map<String, Object> rawJson;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum Status { pending, processing, done, failed }
}
```

- [ ] **Step 7: Create `Clause.java`**

```java
package com.clauseguard.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "clauses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Clause {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analysis_id", nullable = false)
    private Analysis analysis;

    @Column(name = "clause_index", nullable = false)
    private int clauseIndex;

    @Column(name = "original_text", columnDefinition = "TEXT", nullable = false)
    private String originalText;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false)
    private RiskLevel riskLevel;

    @Column(name = "explanation_ko", columnDefinition = "TEXT")
    private String explanationKo;

    @Column(name = "explanation_en", columnDefinition = "TEXT")
    private String explanationEn;

    @Column(name = "suggestion_ko", columnDefinition = "TEXT")
    private String suggestionKo;

    @Column(name = "suggestion_en", columnDefinition = "TEXT")
    private String suggestionEn;

    public enum RiskLevel { low, medium, high }
}
```

- [ ] **Step 8: Create `ShareLink.java`**

```java
package com.clauseguard.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "share_links")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ShareLink {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Column(unique = true, nullable = false)
    private String token;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
```

- [ ] **Step 9: Verify app still starts with entities**

```bash
./mvnw spring-boot:run
```

Expected: App starts successfully, Flyway reports `0 migrations executed` (already applied).

- [ ] **Step 10: Commit**

```bash
git add src/main/java/com/clauseguard/entity/
git commit -m "feat: add JPA entities for all domain models"
```

---

## Task 4: JWT Security Setup

**Files:**
- Create: `src/main/java/com/clauseguard/security/JwtTokenProvider.java`
- Create: `src/main/java/com/clauseguard/security/JwtAuthenticationFilter.java`
- Create: `src/main/java/com/clauseguard/security/UserDetailsServiceImpl.java`
- Create: `src/main/java/com/clauseguard/config/SecurityConfig.java`
- Create: `src/main/java/com/clauseguard/repository/UserRepository.java`

- [ ] **Step 1: Create `UserRepository.java`**

```java
package com.clauseguard.repository;

import com.clauseguard.entity.User;
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
package com.clauseguard.security;

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

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key)
                .compact();
    }

    public String getEmailFromToken(String token) {
        return Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload().getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
```

- [ ] **Step 3: Create `UserDetailsServiceImpl.java`**

```java
package com.clauseguard.security;

import com.clauseguard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .map(user -> User.withUsername(user.getEmail())
                        .password(user.getPasswordHash())
                        .authorities("ROLE_USER")
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }
}
```

- [ ] **Step 4: Create `JwtAuthenticationFilter.java`**

```java
package com.clauseguard.security;

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

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = extractToken(request);
        if (token != null && jwtTokenProvider.validateToken(token)) {
            String email = jwtTokenProvider.getEmailFromToken(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
```

- [ ] **Step 5: Create `SecurityConfig.java`**

```java
package com.clauseguard.config;

import com.clauseguard.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/api/share/**").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

- [ ] **Step 6: Verify compilation**

```bash
./mvnw compile
```

Expected: `BUILD SUCCESS`

- [ ] **Step 7: Commit**

```bash
git add src/main/java/com/clauseguard/security/ \
        src/main/java/com/clauseguard/config/SecurityConfig.java \
        src/main/java/com/clauseguard/repository/UserRepository.java
git commit -m "feat: add JWT security filter and Spring Security config"
```

---

## Task 5: Auth Endpoints (Signup + Login)

**Files:**
- Create: `src/main/java/com/clauseguard/dto/auth/SignupRequest.java`
- Create: `src/main/java/com/clauseguard/dto/auth/LoginRequest.java`
- Create: `src/main/java/com/clauseguard/dto/auth/AuthResponse.java`
- Create: `src/main/java/com/clauseguard/service/AuthService.java`
- Create: `src/main/java/com/clauseguard/controller/AuthController.java`
- Create: `src/main/java/com/clauseguard/exception/GlobalExceptionHandler.java`
- Test: `src/test/java/com/clauseguard/controller/AuthControllerTest.java`

- [ ] **Step 1: Write the failing test**

```java
// src/test/java/com/clauseguard/controller/AuthControllerTest.java
package com.clauseguard.controller;

import com.clauseguard.dto.auth.SignupRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
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

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    void signup_withValidData_returns200AndToken() throws Exception {
        SignupRequest req = new SignupRequest("test@example.com", "password123", "Test User", "ko");
        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void signup_withDuplicateEmail_returns409() throws Exception {
        SignupRequest req = new SignupRequest("dup@example.com", "pass", "User", "ko");
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req))).andReturn();

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict());
    }

    @Test
    void login_withValidCredentials_returns200AndToken() throws Exception {
        SignupRequest signup = new SignupRequest("login@example.com", "password123", "User", "ko");
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signup))).andReturn();

        String loginBody = """
                {"email":"login@example.com","password":"password123"}""";
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }
}
```

- [ ] **Step 2: Add `application-test.yml`**

```yaml
# src/test/resources/application-test.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/clauseguard
    username: clauseguard
    password: clauseguard
jwt:
  secret: test-secret-key-minimum-256-bit-length-ok
  expiration-ms: 86400000
aws:
  region: ap-northeast-2
  s3:
    bucket: clauseguard-test
vaultsage:
  api-key: test-key
  base-url: http://localhost:9999
cors:
  allowed-origins: http://localhost:3000
```

- [ ] **Step 3: Run test to verify it fails**

```bash
./mvnw test -pl . -Dtest=AuthControllerTest
```

Expected: FAIL — `SignupRequest` class not found

- [ ] **Step 4: Create DTOs**

```java
// src/main/java/com/clauseguard/dto/auth/SignupRequest.java
package com.clauseguard.dto.auth;

import jakarta.validation.constraints.*;

public record SignupRequest(
        @Email @NotBlank String email,
        @NotBlank @Size(min = 6) String password,
        @NotBlank String name,
        @Pattern(regexp = "ko|en") String lang
) {}
```

```java
// src/main/java/com/clauseguard/dto/auth/LoginRequest.java
package com.clauseguard.dto.auth;

import jakarta.validation.constraints.*;

public record LoginRequest(
        @Email @NotBlank String email,
        @NotBlank String password
) {}
```

```java
// src/main/java/com/clauseguard/dto/auth/AuthResponse.java
package com.clauseguard.dto.auth;

public record AuthResponse(String token, String email, String name) {}
```

- [ ] **Step 5: Create `AuthService.java`**

```java
package com.clauseguard.service;

import com.clauseguard.dto.auth.*;
import com.clauseguard.entity.User;
import com.clauseguard.repository.UserRepository;
import com.clauseguard.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthResponse signup(SignupRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }
        User user = User.builder()
                .email(req.email())
                .passwordHash(passwordEncoder.encode(req.password()))
                .name(req.name())
                .preferredLang(req.lang() != null
                        ? User.PreferredLang.valueOf(req.lang())
                        : User.PreferredLang.ko)
                .build();
        userRepository.save(user);
        return new AuthResponse(jwtTokenProvider.generateToken(user.getEmail()), user.getEmail(), user.getName());
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        return new AuthResponse(jwtTokenProvider.generateToken(user.getEmail()), user.getEmail(), user.getName());
    }
}
```

- [ ] **Step 6: Create `AuthController.java`**

```java
package com.clauseguard.controller;

import com.clauseguard.dto.auth.*;
import com.clauseguard.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public AuthResponse signup(@Valid @RequestBody SignupRequest req) {
        return authService.signup(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }
}
```

- [ ] **Step 7: Create `GlobalExceptionHandler.java`**

```java
package com.clauseguard.exception;

import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatus(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode())
                .body(Map.of("error", ex.getReason() != null ? ex.getReason() : ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", errors));
    }
}
```

- [ ] **Step 8: Run tests to verify they pass**

```bash
./mvnw test -Dtest=AuthControllerTest
```

Expected: `Tests run: 3, Failures: 0, Errors: 0`

- [ ] **Step 9: Commit**

```bash
git add src/
git commit -m "feat: add signup and login endpoints with JWT"
```

---

## Task 6: AWS S3 Configuration

**Files:**
- Create: `src/main/java/com/clauseguard/config/S3Config.java`
- Create: `src/main/java/com/clauseguard/service/S3Service.java`

- [ ] **Step 1: Create `S3Config.java`**

```java
package com.clauseguard.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class S3Config {

    @Value("${aws.region}")
    private String region;

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }
}
```

- [ ] **Step 2: Create `S3Service.java`**

```java
package com.clauseguard.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucket;

    public String upload(MultipartFile file, String folder) throws IOException {
        String key = folder + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .contentType(file.getContentType())
                        .build(),
                RequestBody.fromBytes(file.getBytes())
        );
        return key;
    }

    public byte[] download(String key) {
        return s3Client.getObjectAsBytes(
                GetObjectRequest.builder().bucket(bucket).key(key).build()
        ).asByteArray();
    }

    public void delete(String key) {
        s3Client.deleteObject(
                DeleteObjectRequest.builder().bucket(bucket).key(key).build()
        );
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/main/java/com/clauseguard/config/S3Config.java \
        src/main/java/com/clauseguard/service/S3Service.java
git commit -m "feat: add AWS S3 configuration and service"
```

---

## Task 7: Next.js Frontend Setup

**Files:**
- Create: `clauseguard-frontend/` (full project)

- [ ] **Step 1: Bootstrap Next.js project**

```bash
cd /path/to/clauseguard
npx create-next-app@latest clauseguard-frontend \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"
cd clauseguard-frontend
```

- [ ] **Step 2: Install dependencies**

```bash
npm install axios @tanstack/react-query zustand
npx shadcn@latest init
# When prompted: Default style, Zinc base color, CSS variables: yes
npx shadcn@latest add button input label card toast badge
```

- [ ] **Step 3: Create `lib/api.ts`**

```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080',
})

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('token')
    : null
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

- [ ] **Step 4: Create `lib/auth.ts`**

```typescript
export const setToken = (token: string) => localStorage.setItem('token', token)
export const getToken = () => localStorage.getItem('token')
export const removeToken = () => localStorage.removeItem('token')
export const isLoggedIn = () => !!getToken()
```

- [ ] **Step 5: Create `.env.local`**

```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local
```

- [ ] **Step 6: Update `app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ClauseGuard — AI Contract Reviewer',
  description: 'Protect yourself from bad contracts — without a lawyer.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

- [ ] **Step 7: Create landing page `app/page.tsx`**

```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <nav className="flex justify-between items-center px-8 py-4">
        <span className="text-xl font-bold text-indigo-400">ClauseGuard</span>
        <div className="flex gap-3">
          <Link href="/login"><Button variant="ghost">로그인</Button></Link>
          <Link href="/signup"><Button>시작하기</Button></Link>
        </div>
      </nav>
      <div className="flex flex-col items-center justify-center text-center px-4 py-32">
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          계약서, 이제<br />
          <span className="text-indigo-400">AI가 지켜드립니다</span>
        </h1>
        <p className="text-lg text-slate-300 mb-10 max-w-xl">
          변호사 없이도 계약서의 리스크를 파악하세요. VaultSage AI가
          위험 조항을 찾아내고 협상 문구를 제안합니다.
          당신의 문서는 저장되지 않습니다.
        </p>
        <Link href="/signup">
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-lg">
            무료로 시작하기
          </Button>
        </Link>
        <p className="mt-4 text-sm text-slate-400">한국어 · English 지원</p>
      </div>
    </main>
  )
}
```

- [ ] **Step 8: Create `app/signup/page.tsx`**

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
  const [form, setForm] = useState({ email: '', password: '', name: '', lang: 'ko' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/api/auth/signup', form)
      setToken(data.token)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error ?? '회원가입에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">ClauseGuard 가입</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>이름</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
            <div><Label>이메일</Label>
              <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
            <div><Label>비밀번호</Label>
              <Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} /></div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '처리 중...' : '가입하기'}
            </Button>
            <p className="text-center text-sm text-slate-500">
              이미 계정이 있으신가요? <Link href="/login" className="text-indigo-600">로그인</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 9: Create `app/login/page.tsx`**

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
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/api/auth/login', form)
      setToken(data.token)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error ?? '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">로그인</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>이메일</Label>
              <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
            <div><Label>비밀번호</Label>
              <Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required /></div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '처리 중...' : '로그인'}
            </Button>
            <p className="text-center text-sm text-slate-500">
              계정이 없으신가요? <Link href="/signup" className="text-indigo-600">가입하기</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 10: Create dashboard stub `app/dashboard/page.tsx`**

```typescript
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isLoggedIn, removeToken } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn()) router.push('/login')
  }, [router])

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex justify-between items-center px-8 py-4 bg-white border-b">
        <span className="text-xl font-bold text-indigo-600">ClauseGuard</span>
        <Button variant="ghost" onClick={() => { removeToken(); router.push('/login') }}>
          로그아웃
        </Button>
      </nav>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">내 계약서</h1>
        <p className="text-slate-500">아직 분석한 계약서가 없습니다. Plan 2에서 업로드 기능을 추가합니다.</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 11: Start dev server and verify**

```bash
npm run dev
```

Open http://localhost:3000 — landing page should render.
Open http://localhost:3000/signup — signup form should render.
With the backend running, complete a signup and verify redirect to `/dashboard`.

- [ ] **Step 12: Commit**

```bash
git add .
git commit -m "feat: next.js frontend with auth pages and API client"
```

---

## Plan 1 Complete

At this point you have:
- ✅ Spring Boot project with all dependencies
- ✅ PostgreSQL schema deployed via Flyway
- ✅ All JPA entities
- ✅ JWT auth (signup + login) with tests passing
- ✅ AWS S3 service ready
- ✅ Next.js frontend with landing, login, signup, dashboard stub
- ✅ Frontend ↔ Backend auth flow working end-to-end

**Next:** Proceed to Plan 2 — Contract Upload & VaultSage Integration.
