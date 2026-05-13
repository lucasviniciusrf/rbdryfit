package com.rbdryfit.rbdryfit.fornecedor;

import java.math.BigDecimal;

public record FornecedorResponse(
        Integer id,
        String name,
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
