package com.rbdryfit.rbdryfit.cliente;

public record ClienteResponse(
        Integer id,
        String name,
        String document,
        String phone,
        String email,
        String city,
        String uf,
        String type,
        String notes,
        Boolean active
) {
}
