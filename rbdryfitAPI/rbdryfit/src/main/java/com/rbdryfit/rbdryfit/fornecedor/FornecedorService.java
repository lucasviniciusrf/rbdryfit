package com.rbdryfit.rbdryfit.fornecedor;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class FornecedorService {

    private final JdbcTemplate jdbcTemplate;

    public FornecedorService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<FornecedorResponse> listar(String busca, boolean somenteAtivos) {
        StringBuilder sql = new StringBuilder("""
                SELECT ID, NOME, CATEGORIA, CONTATO, TELEFONE, CIDADE, LEAD_TIME_DIAS,
                       AVALIACAO, PEDIDOS_ABERTOS, STATUS, INATIVO
                FROM RB_FORNECEDOR
                WHERE 1 = 1
                """);
        List<Object> params = new ArrayList<>();

        if (somenteAtivos) {
            sql.append(" AND INATIVO = FALSE");
        }

        String termo = texto(busca);
        if (!termo.isBlank()) {
            sql.append("""
                    AND (
                        UPPER(NOME) LIKE ?
                        OR UPPER(COALESCE(CATEGORIA, '')) LIKE ?
                        OR UPPER(COALESCE(CONTATO, '')) LIKE ?
                        OR UPPER(COALESCE(CIDADE, '')) LIKE ?
                    )
                    """);
            String like = "%" + termo.toUpperCase(Locale.ROOT) + "%";
            params.add(like);
            params.add(like);
            params.add(like);
            params.add(like);
        }

        sql.append(" ORDER BY INATIVO, NOME");
        return jdbcTemplate.query(sql.toString(), this::mapear, params.toArray());
    }

    public FornecedorResponse buscar(Integer id) {
        validarId(id);
        List<FornecedorResponse> fornecedores = jdbcTemplate.query("""
                SELECT ID, NOME, CATEGORIA, CONTATO, TELEFONE, CIDADE, LEAD_TIME_DIAS,
                       AVALIACAO, PEDIDOS_ABERTOS, STATUS, INATIVO
                FROM RB_FORNECEDOR
                WHERE ID = ?
                """, this::mapear, id);

        if (fornecedores.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Fornecedor nao encontrado.");
        }

        return fornecedores.get(0);
    }

    @Transactional
    public FornecedorResponse criar(FornecedorRequest request) {
        validarRequest(request);
        Integer id = nextId();

        jdbcTemplate.update("""
                INSERT INTO RB_FORNECEDOR (
                    ID, NOME, CATEGORIA, CONTATO, TELEFONE, CIDADE,
                    LEAD_TIME_DIAS, AVALIACAO, PEDIDOS_ABERTOS, STATUS, INATIVO
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                id,
                texto(request.name()),
                textoOuPadrao(request.category(), "Fornecedor geral"),
                textoOuPadrao(request.contact(), "Contato comercial"),
                texto(request.phone()),
                textoOuPadrao(request.city(), "Brasil"),
                inteiroOuPadrao(request.leadTime(), 7),
                decimalOuPadrao(request.rating(), new BigDecimal("4.60")),
                inteiroOuPadrao(request.openOrders(), 0),
                textoOuPadrao(request.status(), "Em avaliacao"),
                request.active() != null && !request.active()
        );

        return buscar(id);
    }

    @Transactional
    public FornecedorResponse atualizar(Integer id, FornecedorRequest request) {
        validarId(id);
        validarRequest(request);
        buscar(id);

        jdbcTemplate.update("""
                UPDATE RB_FORNECEDOR
                SET NOME = ?,
                    CATEGORIA = ?,
                    CONTATO = ?,
                    TELEFONE = ?,
                    CIDADE = ?,
                    LEAD_TIME_DIAS = ?,
                    AVALIACAO = ?,
                    PEDIDOS_ABERTOS = ?,
                    STATUS = ?,
                    INATIVO = ?,
                    ATUALIZADO_EM = CURRENT_TIMESTAMP
                WHERE ID = ?
                """,
                texto(request.name()),
                textoOuPadrao(request.category(), "Fornecedor geral"),
                texto(request.contact()),
                texto(request.phone()),
                texto(request.city()),
                inteiroOuPadrao(request.leadTime(), 7),
                decimalOuPadrao(request.rating(), new BigDecimal("4.60")),
                inteiroOuPadrao(request.openOrders(), 0),
                textoOuPadrao(request.status(), "Em avaliacao"),
                request.active() != null && !request.active(),
                id
        );

        return buscar(id);
    }

    @Transactional
    public void inativar(Integer id) {
        validarId(id);
        int linhas = jdbcTemplate.update("""
                UPDATE RB_FORNECEDOR
                SET INATIVO = TRUE, ATUALIZADO_EM = CURRENT_TIMESTAMP
                WHERE ID = ?
                """, id);

        if (linhas == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Fornecedor nao encontrado.");
        }
    }

    @Transactional
    public FornecedorResponse ativar(Integer id) {
        validarId(id);
        int linhas = jdbcTemplate.update("""
                UPDATE RB_FORNECEDOR
                SET INATIVO = FALSE, ATUALIZADO_EM = CURRENT_TIMESTAMP
                WHERE ID = ?
                """, id);

        if (linhas == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Fornecedor nao encontrado.");
        }

        return buscar(id);
    }

    private FornecedorResponse mapear(ResultSet rs, int rowNum) throws SQLException {
        return new FornecedorResponse(
                rs.getInt("ID"),
                texto(rs.getString("NOME")),
                texto(rs.getString("CATEGORIA")),
                texto(rs.getString("CONTATO")),
                texto(rs.getString("TELEFONE")),
                texto(rs.getString("CIDADE")),
                rs.getInt("LEAD_TIME_DIAS"),
                rs.getBigDecimal("AVALIACAO"),
                rs.getInt("PEDIDOS_ABERTOS"),
                texto(rs.getString("STATUS")),
                !rs.getBoolean("INATIVO")
        );
    }

    private void validarRequest(FornecedorRequest request) {
        if (request == null || texto(request.name()).isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe o nome do fornecedor.");
        }
    }

    private void validarId(Integer id) {
        if (id == null || id <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Codigo do fornecedor invalido.");
        }
    }

    private Integer nextId() {
        return jdbcTemplate.queryForObject("SELECT NEXT VALUE FOR RB_FORNECEDOR_SEQ FROM RDB$DATABASE", Integer.class);
    }

    private String texto(String valor) {
        return valor == null ? "" : valor.trim();
    }

    private String textoOuPadrao(String valor, String padrao) {
        String normalizado = texto(valor);
        return normalizado.isBlank() ? padrao : normalizado;
    }

    private Integer inteiroOuPadrao(Integer valor, Integer padrao) {
        return valor != null ? valor : padrao;
    }

    private BigDecimal decimalOuPadrao(BigDecimal valor, BigDecimal padrao) {
        return valor != null ? valor : padrao;
    }
}
