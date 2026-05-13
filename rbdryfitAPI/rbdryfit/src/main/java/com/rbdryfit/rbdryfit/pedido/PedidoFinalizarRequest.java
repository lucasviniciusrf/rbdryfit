package com.rbdryfit.rbdryfit.pedido;

import java.math.BigDecimal;
import java.util.List;

public record PedidoFinalizarRequest(
        Integer clientId,
        PedidoClienteRequest client,
        String payment,
        String status,
        BigDecimal discount,
        BigDecimal surcharge,
        String notes,
        List<PedidoItemRequest> items
) {
}
