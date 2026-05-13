package com.rbdryfit.rbdryfit.cliente;

import jakarta.validation.constraints.NotBlank;

public record ClienteRequest(
        @NotBlank String name,
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
