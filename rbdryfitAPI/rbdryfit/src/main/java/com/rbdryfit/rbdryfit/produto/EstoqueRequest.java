package com.rbdryfit.rbdryfit.produto;

import java.util.Map;

public record EstoqueRequest(Map<String, Integer> sizes) {
}
