package com.trivallo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class TrivalloApplication {

    public static void main(String[] args) {
        SpringApplication.run(TrivalloApplication.class, args);
    }
}
