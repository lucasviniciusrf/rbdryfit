package com.rbdryfit.rbdryfit.pedido;

import jakarta.validation.constraints.NotBlank;

public record PedidoStatusRequest(@NotBlank String status) {
}
