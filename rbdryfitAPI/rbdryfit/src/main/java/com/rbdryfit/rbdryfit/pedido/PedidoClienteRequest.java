package com.rbdryfit.rbdryfit.pedido;

public record PedidoClienteRequest(
        String name,
        String document,
        String phone,
        String email,
        String city,
        String uf,
        String type
) {
}
