package com.rbdryfit.rbdryfit.produto;

import java.util.List;

public record ProdutoBootstrapResponse(
        List<String> categories,
        List<String> sizes,
        List<String> fabrics
) {
}
