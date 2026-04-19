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
