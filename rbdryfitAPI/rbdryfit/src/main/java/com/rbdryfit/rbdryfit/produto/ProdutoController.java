package com.rbdryfit.rbdryfit.produto;

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
@RequestMapping("/produtos")
@CrossOrigin(origins = "*")
public class ProdutoController {

    private final ProdutoService produtoService;

    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @GetMapping("/bootstrap")
    public ProdutoBootstrapResponse bootstrap() {
        return produtoService.bootstrap();
    }

    @GetMapping
    public List<ProdutoResponse> listar(
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) Boolean somenteAtivos
    ) {
        return produtoService.listar(busca, somenteAtivos);
    }

    @GetMapping("/{id}")
    public ProdutoResponse buscar(@PathVariable Integer id) {
        return produtoService.buscar(id);
    }

    @PostMapping
    public ResponseEntity<ProdutoResponse> criar(@Valid @RequestBody ProdutoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(produtoService.criar(request));
    }

    @PutMapping("/{id}")
    public ProdutoResponse atualizar(@PathVariable Integer id, @Valid @RequestBody ProdutoRequest request) {
        return produtoService.atualizar(id, request);
    }

    @PatchMapping("/{id}/estoque")
    public ProdutoResponse atualizarEstoque(@PathVariable Integer id, @RequestBody EstoqueRequest request) {
        return produtoService.atualizarEstoque(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> inativar(@PathVariable Integer id) {
        produtoService.inativar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/ativar")
    public ProdutoResponse ativar(@PathVariable Integer id) {
        return produtoService.ativar(id);
    }
}
