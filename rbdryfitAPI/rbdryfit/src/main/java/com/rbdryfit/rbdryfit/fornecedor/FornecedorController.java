package com.rbdryfit.rbdryfit.fornecedor;

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
@RequestMapping("/fornecedores")
@CrossOrigin(origins = "*")
public class FornecedorController {

    private final FornecedorService fornecedorService;

    public FornecedorController(FornecedorService fornecedorService) {
        this.fornecedorService = fornecedorService;
    }

    @GetMapping
    public List<FornecedorResponse> listar(
            @RequestParam(required = false) String busca,
            @RequestParam(defaultValue = "false") boolean somenteAtivos
    ) {
        return fornecedorService.listar(busca, somenteAtivos);
    }

    @GetMapping("/{id}")
    public FornecedorResponse buscar(@PathVariable Integer id) {
        return fornecedorService.buscar(id);
    }

    @PostMapping
    public ResponseEntity<FornecedorResponse> criar(@Valid @RequestBody FornecedorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(fornecedorService.criar(request));
    }

    @PutMapping("/{id}")
    public FornecedorResponse atualizar(@PathVariable Integer id, @Valid @RequestBody FornecedorRequest request) {
        return fornecedorService.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> inativar(@PathVariable Integer id) {
        fornecedorService.inativar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/ativar")
    public FornecedorResponse ativar(@PathVariable Integer id) {
        return fornecedorService.ativar(id);
    }
}
