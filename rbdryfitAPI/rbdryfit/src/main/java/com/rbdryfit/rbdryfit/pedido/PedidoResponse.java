package com.rbdryfit.rbdryfit.pedido;

import java.math.BigDecimal;
import java.util.List;

public record PedidoResponse(
        String id,
        Integer numericId,
        String customer,
        String date,
        String items,
        String payment,
        BigDecimal total,
        String status,
        List<PedidoItemResponse> itemDetails
) {
}
