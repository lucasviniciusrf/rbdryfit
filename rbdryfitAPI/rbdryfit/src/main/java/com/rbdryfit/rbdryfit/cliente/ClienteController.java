package com.rbdryfit.rbdryfit.cliente;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/clientes")
@CrossOrigin(origins = "*")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    public List<ClienteResponse> listar(
            @RequestParam(required = false) String busca,
            @RequestParam(defaultValue = "false") boolean somenteAtivos
    ) {
        return clienteService.listar(busca, somenteAtivos);
    }

    @GetMapping("/{id}")
    public ClienteResponse buscar(@PathVariable Integer id) {
        return clienteService.buscar(id);
    }

    @PostMapping
    public ResponseEntity<ClienteResponse> criar(@Valid @RequestBody ClienteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.criar(request));
    }

    @PutMapping("/{id}")
    public ClienteResponse atualizar(@PathVariable Integer id, @Valid @RequestBody ClienteRequest request) {
        return clienteService.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> inativar(@PathVariable Integer id) {
        clienteService.inativar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/ativar")
    public ClienteResponse ativar(@PathVariable Integer id) {
        return clienteService.ativar(id);
    }
}
