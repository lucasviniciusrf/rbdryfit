package com.rbdryfit.rbdryfit.fornecedor;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public record FornecedorRequest(
        @NotBlank String name,
        String category,
        String contact,
        String phone,
        String city,
        Integer leadTime,
        BigDecimal rating,
        Integer openOrders,
        String status,
        Boolean active
) {
}
