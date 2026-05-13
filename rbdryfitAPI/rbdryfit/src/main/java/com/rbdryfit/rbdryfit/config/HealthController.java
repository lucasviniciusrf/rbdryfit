package com.rbdryfit.rbdryfit.config;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Integer ping = jdbcTemplate.queryForObject("SELECT 1 FROM RDB$DATABASE", Integer.class);
        return Map.of("status", "UP", "database", ping != null && ping == 1 ? "Firebird conectado" : "Indisponivel");
    }
}
