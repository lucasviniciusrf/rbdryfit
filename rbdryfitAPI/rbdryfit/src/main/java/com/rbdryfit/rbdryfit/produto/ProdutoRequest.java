package com.rbdryfit.rbdryfit.produto;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record ProdutoRequest(
        @NotBlank String name,
        String category,
        BigDecimal price,
        BigDecimal cost,
        String image,
        String badge,
        String description,
        String fabric,
        List<String> colors,
        Map<String, Integer> sizes,
        Integer supplierId,
        Integer reorderPoint,
        Boolean active,
        Boolean launch
) {
}
