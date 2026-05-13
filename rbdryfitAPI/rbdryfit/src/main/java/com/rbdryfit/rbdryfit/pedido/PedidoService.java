package com.rbdryfit.rbdryfit.pedido;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class PedidoService {

    private static final List<String> STATUS_VALIDOS =
            List.of("Recebido", "Separacao", "Faturado", "Enviado", "Entregue", "Cancelado");

    private final JdbcTemplate jdbcTemplate;

    public PedidoService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<PedidoResponse> listar(String busca, String status) {
        StringBuilder sql = new StringBuilder("""
                SELECT p.ID, p.CODIGO, p.CLIENTE_NOME, c.NOME AS CLIENTE_CADASTRADO,
                       p.DATA_PEDIDO, p.FORMA_PAGAMENTO, p.TOTAL, p.STATUS,
                       COALESCE((SELECT SUM(i.QUANTIDADE) FROM RB_PEDIDO_ITEM i WHERE i.PEDIDO_ID = p.ID), 0) AS QTD_ITENS
                FROM RB_PEDIDO p
                LEFT JOIN RB_CLIENTE c ON c.ID = p.CLIENTE_ID
                WHERE 1 = 1
                """);
        List<Object> params = new ArrayList<>();

        if (!texto(status).isBlank()) {
            sql.append(" AND p.STATUS = ?");
            params.add(status);
        }

        String termo = texto(busca);
        if (!termo.isBlank()) {
            sql.append("""
                    AND (
                        UPPER(p.CODIGO) LIKE ?
                        OR UPPER(COALESCE(p.CLIENTE_NOME, '')) LIKE ?
                        OR UPPER(COALESCE(c.NOME, '')) LIKE ?
                    )
                    """);
            String like = "%" + termo.toUpperCase(Locale.ROOT) + "%";
            params.add(like);
            params.add(like);
            params.add(like);
        }

        sql.append(" ORDER BY p.DATA_PEDIDO DESC, p.ID DESC");
        return jdbcTemplate.query(sql.toString(), this::mapearResumo, params.toArray());
    }

    public PedidoResponse buscar(String codigo) {
        String normalizado = texto(codigo);
        if (normalizado.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Codigo do pedido invalido.");
        }

        List<PedidoResponse> pedidos = jdbcTemplate.query("""
                SELECT p.ID, p.CODIGO, p.CLIENTE_NOME, c.NOME AS CLIENTE_CADASTRADO,
                       p.DATA_PEDIDO, p.FORMA_PAGAMENTO, p.TOTAL, p.STATUS,
                       COALESCE((SELECT SUM(i.QUANTIDADE) FROM RB_PEDIDO_ITEM i WHERE i.PEDIDO_ID = p.ID), 0) AS QTD_ITENS
                FROM RB_PEDIDO p
                LEFT JOIN RB_CLIENTE c ON c.ID = p.CLIENTE_ID
                WHERE p.CODIGO = ? OR CAST(p.ID AS VARCHAR(20)) = ?
                """, this::mapearResumo, normalizado, normalizado);

        if (pedidos.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido nao encontrado.");
        }

        PedidoResponse resumo = pedidos.get(0);
        return new PedidoResponse(
                resumo.id(),
                resumo.numericId(),
                resumo.customer(),
                resumo.date(),
                resumo.items(),
                resumo.payment(),
                resumo.total(),
                resumo.status(),
                listarItens(resumo.numericId())
        );
    }

    public PedidoResumoResponse calcularResumo(PedidoFinalizarRequest request) {
        List<PedidoItemResponse> itens = processarItens(request != null ? request.items() : null, false);
        BigDecimal bruto = somarSubtotal(itens);
        BigDecimal desconto = dinheiro(request != null ? request.discount() : null);
        BigDecimal acrescimo = dinheiro(request != null ? request.surcharge() : null);
        BigDecimal total = bruto.subtract(desconto).add(acrescimo).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        Integer quantidade = itens.stream().map(PedidoItemResponse::quantity).reduce(0, Integer::sum);

        return new PedidoResumoResponse(itens, bruto, desconto, acrescimo, total, quantidade);
    }

    @Transactional
    public PedidoResponse finalizar(PedidoFinalizarRequest request) {
        if (request == null || request.items() == null || request.items().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Adicione pelo menos um item ao pedido.");
        }

        List<PedidoItemResponse> itens = processarItens(request.items(), true);
        BigDecimal bruto = somarSubtotal(itens);
        BigDecimal desconto = dinheiro(request.discount());
        BigDecimal acrescimo = dinheiro(request.surcharge());
        BigDecimal total = bruto.subtract(desconto).add(acrescimo).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        Integer clienteId = obterClienteId(request);
        Integer pedidoId = nextId("RB_PEDIDO_SEQ");
        String codigo = "RB-" + (1000 + pedidoId);
        String clienteNome = nomeCliente(request, clienteId);

        jdbcTemplate.update("""
                INSERT INTO RB_PEDIDO (
                    ID, CODIGO, CLIENTE_ID, CLIENTE_NOME, DATA_PEDIDO, FORMA_PAGAMENTO, STATUS,
                    VALOR_BRUTO, DESCONTO, ACRESCIMO, TOTAL, OBSERVACAO
                ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?)
                """,
                pedidoId,
                codigo,
                clienteId,
                clienteNome,
                textoOuPadrao(request.payment(), "WhatsApp"),
                statusOuPadrao(request.status()),
                bruto,
                desconto,
                acrescimo,
                total,
                texto(request.notes())
        );

        for (PedidoItemResponse item : itens) {
            jdbcTemplate.update("""
                    INSERT INTO RB_PEDIDO_ITEM (
                        ID, PEDIDO_ID, PRODUTO_ID, PRODUTO_NOME, TAMANHO,
                        QUANTIDADE, VALOR_UNITARIO, SUBTOTAL
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    nextId("RB_PEDIDO_ITEM_SEQ"),
                    pedidoId,
                    item.productId(),
                    item.productName(),
                    texto(item.size()),
                    item.quantity(),
                    item.unitPrice(),
                    item.subtotal()
            );

            abaterEstoqueSeTiverTamanho(item);
        }

        return buscar(codigo);
    }

    @Transactional
    public PedidoResponse atualizarStatus(String codigo, PedidoStatusRequest request) {
        String status = request != null ? texto(request.status()) : "";
        if (!STATUS_VALIDOS.contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status de pedido invalido.");
        }

        int linhas = jdbcTemplate.update("""
                UPDATE RB_PEDIDO
                SET STATUS = ?, ATUALIZADO_EM = CURRENT_TIMESTAMP
                WHERE CODIGO = ? OR CAST(ID AS VARCHAR(20)) = ?
                """, status, texto(codigo), texto(codigo));

        if (linhas == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido nao encontrado.");
        }

        return buscar(codigo);
    }

    private List<PedidoItemResponse> processarItens(List<PedidoItemRequest> itensRequest, boolean validarEstoque) {
        if (itensRequest == null || itensRequest.isEmpty()) {
            return List.of();
        }

        List<PedidoItemResponse> itens = new ArrayList<>();
        for (PedidoItemRequest item : itensRequest) {
            if (item == null) {
                continue;
            }

            Integer quantidade = item.quantity() != null ? item.quantity() : 1;
            if (quantidade <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A quantidade do item deve ser maior que zero.");
            }

            ProdutoPedido produto = item.productId() != null ? buscarProdutoPedido(item.productId()) : null;
            String nome = textoOuPadrao(item.productName(), produto != null ? produto.nome() : "");
            if (nome.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Existe item sem produto informado.");
            }

            BigDecimal unitario = item.unitPrice() != null
                    ? dinheiro(item.unitPrice())
                    : produto != null ? dinheiro(produto.preco()) : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

            if (validarEstoque && produto != null && !texto(item.size()).isBlank()) {
                validarEstoque(produto.id(), item.size(), quantidade);
            }

            itens.add(new PedidoItemResponse(
                    produto != null ? produto.id() : item.productId(),
                    nome,
                    texto(item.size()),
                    quantidade,
                    unitario,
                    unitario.multiply(BigDecimal.valueOf(quantidade)).setScale(2, RoundingMode.HALF_UP)
            ));
        }

        if (itens.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Adicione pelo menos um item ao pedido.");
        }

        return itens;
    }

    private ProdutoPedido buscarProdutoPedido(Integer produtoId) {
        List<ProdutoPedido> produtos = jdbcTemplate.query("""
                SELECT ID, NOME, PRECO, ATIVO
                FROM RB_PRODUTO
                WHERE ID = ?
                """, (rs, rowNum) -> new ProdutoPedido(
                rs.getInt("ID"),
                texto(rs.getString("NOME")),
                dinheiro(rs.getBigDecimal("PRECO")),
                rs.getBoolean("ATIVO")
        ), produtoId);

        if (produtos.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Produto " + produtoId + " nao encontrado.");
        }

        ProdutoPedido produto = produtos.get(0);
        if (!produto.ativo()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Produto " + produto.nome() + " esta inativo.");
        }

        return produto;
    }

    private void validarEstoque(Integer produtoId, String tamanho, Integer quantidade) {
        Integer disponivel = jdbcTemplate.queryForObject("""
                SELECT COALESCE(MAX(QUANTIDADE), 0)
                FROM RB_ESTOQUE_GRADE
                WHERE PRODUTO_ID = ? AND TAMANHO = ?
                """, Integer.class, produtoId, texto(tamanho).toUpperCase(Locale.ROOT));

        if (disponivel == null || disponivel < quantidade) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estoque insuficiente para o tamanho " + tamanho + ".");
        }
    }

    private void abaterEstoqueSeTiverTamanho(PedidoItemResponse item) {
        String tamanho = texto(item.size()).toUpperCase(Locale.ROOT);
        if (item.productId() == null || tamanho.isBlank()) {
            return;
        }

        jdbcTemplate.update("""
                UPDATE RB_ESTOQUE_GRADE
                SET QUANTIDADE = QUANTIDADE - ?, ATUALIZADO_EM = CURRENT_TIMESTAMP
                WHERE PRODUTO_ID = ? AND TAMANHO = ? AND QUANTIDADE >= ?
                """, item.quantity(), item.productId(), tamanho, item.quantity());
    }

    private Integer obterClienteId(PedidoFinalizarRequest request) {
        if (request.clientId() != null && request.clientId() > 0) {
            Integer quantidade = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM RB_CLIENTE WHERE ID = ?", Integer.class, request.clientId());
            if (quantidade != null && quantidade > 0) {
                return request.clientId();
            }
        }

        PedidoClienteRequest cliente = request.client();
        if (cliente == null || texto(cliente.name()).isBlank()) {
            return null;
        }

        Integer id = nextId("RB_CLIENTE_SEQ");
        jdbcTemplate.update("""
                INSERT INTO RB_CLIENTE (
                    ID, NOME, DOCUMENTO, TELEFONE, EMAIL, CIDADE, UF, TIPO, INATIVO
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE)
                """,
                id,
                texto(cliente.name()),
                documento(cliente.document()),
                documento(cliente.phone()),
                texto(cliente.email()),
                texto(cliente.city()),
                uf(cliente.uf()),
                textoOuPadrao(cliente.type(), "Consumidor")
        );

        return id;
    }

    private String nomeCliente(PedidoFinalizarRequest request, Integer clienteId) {
        if (clienteId != null) {
            String nome = jdbcTemplate.queryForObject("SELECT NOME FROM RB_CLIENTE WHERE ID = ?", String.class, clienteId);
            if (!texto(nome).isBlank()) {
                return nome;
            }
        }

        if (request.client() != null && !texto(request.client().name()).isBlank()) {
            return texto(request.client().name());
        }

        return "Pedido WhatsApp";
    }

    private PedidoResponse mapearResumo(ResultSet rs, int rowNum) throws SQLException {
        Integer pedidoId = rs.getInt("ID");
        Integer quantidadeItens = rs.getInt("QTD_ITENS");
        String cliente = textoOuPadrao(rs.getString("CLIENTE_CADASTRADO"), textoOuPadrao(rs.getString("CLIENTE_NOME"), "Cliente avulso"));
        String itens = quantidadeItens + (quantidadeItens == 1 ? " peca" : " pecas");

        return new PedidoResponse(
                texto(rs.getString("CODIGO")),
                pedidoId,
                cliente,
                formatarData(rs.getTimestamp("DATA_PEDIDO")),
                itens,
                texto(rs.getString("FORMA_PAGAMENTO")),
                dinheiro(rs.getBigDecimal("TOTAL")),
                texto(rs.getString("STATUS")),
                List.of()
        );
    }

    private List<PedidoItemResponse> listarItens(Integer pedidoId) {
        return jdbcTemplate.query("""
                SELECT PRODUTO_ID, PRODUTO_NOME, TAMANHO, QUANTIDADE, VALOR_UNITARIO, SUBTOTAL
                FROM RB_PEDIDO_ITEM
                WHERE PEDIDO_ID = ?
                ORDER BY ID
                """, (rs, rowNum) -> new PedidoItemResponse(
                (Integer) rs.getObject("PRODUTO_ID"),
                texto(rs.getString("PRODUTO_NOME")),
                texto(rs.getString("TAMANHO")),
                rs.getInt("QUANTIDADE"),
                dinheiro(rs.getBigDecimal("VALOR_UNITARIO")),
                dinheiro(rs.getBigDecimal("SUBTOTAL"))
        ), pedidoId);
    }

    private BigDecimal somarSubtotal(List<PedidoItemResponse> itens) {
        return itens.stream()
                .map(PedidoItemResponse::subtotal)
                .reduce(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP), BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private String statusOuPadrao(String status) {
        String normalizado = texto(status);
        if (normalizado.isBlank()) {
            return "Recebido";
        }

        if (!STATUS_VALIDOS.contains(normalizado)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status de pedido invalido.");
        }

        return normalizado;
    }

    private Integer nextId(String sequence) {
        return jdbcTemplate.queryForObject("SELECT NEXT VALUE FOR " + sequence + " FROM RDB$DATABASE", Integer.class);
    }

    private String formatarData(Timestamp timestamp) {
        if (timestamp == null) {
            return "";
        }

        LocalDateTime data = timestamp.toLocalDateTime();
        LocalDate hoje = LocalDate.now();
        DateTimeFormatter hora = DateTimeFormatter.ofPattern("HH:mm");

        if (data.toLocalDate().isEqual(hoje)) {
            return "Hoje, " + data.format(hora);
        }

        if (data.toLocalDate().isEqual(hoje.minusDays(1))) {
            return "Ontem, " + data.format(hora);
        }

        return data.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
    }

    private BigDecimal dinheiro(BigDecimal valor) {
        return valor != null ? valor.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }

    private String texto(String valor) {
        return valor == null ? "" : valor.trim();
    }

    private String textoOuPadrao(String valor, String padrao) {
        String normalizado = texto(valor);
        return normalizado.isBlank() ? padrao : normalizado;
    }

    private String documento(String valor) {
        return texto(valor).replaceAll("\\D", "");
    }

    private String uf(String valor) {
        String normalizado = texto(valor).toUpperCase(Locale.ROOT);
        return normalizado.length() > 2 ? normalizado.substring(0, 2) : normalizado;
    }

    private record ProdutoPedido(Integer id, String nome, BigDecimal preco, Boolean ativo) {
    }
}
