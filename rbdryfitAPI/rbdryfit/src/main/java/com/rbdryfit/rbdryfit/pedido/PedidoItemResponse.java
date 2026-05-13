package com.rbdryfit.rbdryfit.pedido;

import java.math.BigDecimal;

public record PedidoItemResponse(
        Integer productId,
        String productName,
        String size,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal
) {
}
