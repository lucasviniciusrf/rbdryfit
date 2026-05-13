package com.rbdryfit.rbdryfit.pedido;

import java.math.BigDecimal;
import java.util.List;

public record PedidoResumoResponse(
        List<PedidoItemResponse> items,
        BigDecimal gross,
        BigDecimal discount,
        BigDecimal surcharge,
        BigDecimal total,
        Integer quantity
) {
}
