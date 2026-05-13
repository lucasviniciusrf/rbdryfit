package com.rbdryfit.rbdryfit.pedido;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @GetMapping
    public List<PedidoResponse> listar(
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) String status
    ) {
        return pedidoService.listar(busca, status);
    }

    @GetMapping("/{codigo}")
    public PedidoResponse buscar(@PathVariable String codigo) {
        return pedidoService.buscar(codigo);
    }

    @PostMapping("/calcular-resumo")
    public PedidoResumoResponse calcularResumo(@RequestBody PedidoFinalizarRequest request) {
        return pedidoService.calcularResumo(request);
    }

    @PostMapping("/finalizar")
    public ResponseEntity<PedidoResponse> finalizar(@RequestBody PedidoFinalizarRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoService.finalizar(request));
    }

    @PatchMapping("/{codigo}/status")
    public PedidoResponse atualizarStatus(
            @PathVariable String codigo,
            @Valid @RequestBody PedidoStatusRequest request
    ) {
        return pedidoService.atualizarStatus(codigo, request);
    }
}
