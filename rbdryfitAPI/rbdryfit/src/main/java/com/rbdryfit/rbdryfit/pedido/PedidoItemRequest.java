package com.rbdryfit.rbdryfit.pedido;

import java.math.BigDecimal;

public record PedidoItemRequest(
        Integer productId,
        String productName,
        String size,
        Integer quantity,
        BigDecimal unitPrice
) {
}
