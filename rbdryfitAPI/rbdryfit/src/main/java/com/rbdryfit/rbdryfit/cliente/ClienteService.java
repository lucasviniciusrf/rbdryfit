package com.rbdryfit.rbdryfit.cliente;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class ClienteService {

    private final JdbcTemplate jdbcTemplate;

    public ClienteService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ClienteResponse> listar(String busca, boolean somenteAtivos) {
        StringBuilder sql = new StringBuilder("""
                SELECT ID, NOME, DOCUMENTO, TELEFONE, EMAIL, CIDADE, UF, TIPO, OBSERVACAO, INATIVO
                FROM RB_CLIENTE
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
                        OR COALESCE(DOCUMENTO, '') LIKE ?
                        OR COALESCE(TELEFONE, '') LIKE ?
                        OR UPPER(COALESCE(EMAIL, '')) LIKE ?
                        OR UPPER(COALESCE(CIDADE, '')) LIKE ?
                    )
                    """);
            String like = "%" + termo.toUpperCase(Locale.ROOT) + "%";
            String digits = "%" + termo.replaceAll("\\D", "") + "%";
            params.add(like);
            params.add(digits);
            params.add(digits);
            params.add(like);
            params.add(like);
        }

        sql.append(" ORDER BY INATIVO, NOME");
        return jdbcTemplate.query(sql.toString(), this::mapear, params.toArray());
    }

    public ClienteResponse buscar(Integer id) {
        validarId(id);
        List<ClienteResponse> clientes = jdbcTemplate.query("""
                SELECT ID, NOME, DOCUMENTO, TELEFONE, EMAIL, CIDADE, UF, TIPO, OBSERVACAO, INATIVO
                FROM RB_CLIENTE
                WHERE ID = ?
                """, this::mapear, id);

        if (clientes.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente nao encontrado.");
        }

        return clientes.get(0);
    }

    @Transactional
    public ClienteResponse criar(ClienteRequest request) {
        validarRequest(request);
        Integer id = nextId();

        jdbcTemplate.update("""
                INSERT INTO RB_CLIENTE (
                    ID, NOME, DOCUMENTO, TELEFONE, EMAIL, CIDADE, UF, TIPO, OBSERVACAO, INATIVO
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                id,
                texto(request.name()),
                documento(request.document()),
                telefone(request.phone()),
                texto(request.email()),
                texto(request.city()),
                uf(request.uf()),
                textoOuPadrao(request.type(), "Consumidor"),
                texto(request.notes()),
                request.active() != null && !request.active()
        );

        return buscar(id);
    }

    @Transactional
    public ClienteResponse atualizar(Integer id, ClienteRequest request) {
        validarId(id);
        validarRequest(request);
        buscar(id);

        jdbcTemplate.update("""
                UPDATE RB_CLIENTE
                SET NOME = ?,
                    DOCUMENTO = ?,
                    TELEFONE = ?,
                    EMAIL = ?,
                    CIDADE = ?,
                    UF = ?,
                    TIPO = ?,
                    OBSERVACAO = ?,
                    INATIVO = ?,
                    ATUALIZADO_EM = CURRENT_TIMESTAMP
                WHERE ID = ?
                """,
                texto(request.name()),
                documento(request.document()),
                telefone(request.phone()),
                texto(request.email()),
                texto(request.city()),
                uf(request.uf()),
                textoOuPadrao(request.type(), "Consumidor"),
                texto(request.notes()),
                request.active() != null && !request.active(),
                id
        );

        return buscar(id);
    }

    @Transactional
    public void inativar(Integer id) {
        validarId(id);
        int linhas = jdbcTemplate.update("""
                UPDATE RB_CLIENTE
                SET INATIVO = TRUE, ATUALIZADO_EM = CURRENT_TIMESTAMP
                WHERE ID = ?
                """, id);

        if (linhas == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente nao encontrado.");
        }
    }

    @Transactional
    public ClienteResponse ativar(Integer id) {
        validarId(id);
        int linhas = jdbcTemplate.update("""
                UPDATE RB_CLIENTE
                SET INATIVO = FALSE, ATUALIZADO_EM = CURRENT_TIMESTAMP
                WHERE ID = ?
                """, id);

        if (linhas == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente nao encontrado.");
        }

        return buscar(id);
    }

    private ClienteResponse mapear(ResultSet rs, int rowNum) throws SQLException {
        return new ClienteResponse(
                rs.getInt("ID"),
                texto(rs.getString("NOME")),
                texto(rs.getString("DOCUMENTO")),
                texto(rs.getString("TELEFONE")),
                texto(rs.getString("EMAIL")),
                texto(rs.getString("CIDADE")),
                texto(rs.getString("UF")),
                texto(rs.getString("TIPO")),
                texto(rs.getString("OBSERVACAO")),
                !rs.getBoolean("INATIVO")
        );
    }

    private void validarRequest(ClienteRequest request) {
        if (request == null || texto(request.name()).isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe o nome do cliente.");
        }
    }

    private void validarId(Integer id) {
        if (id == null || id <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Codigo do cliente invalido.");
        }
    }

    private Integer nextId() {
        return jdbcTemplate.queryForObject("SELECT NEXT VALUE FOR RB_CLIENTE_SEQ FROM RDB$DATABASE", Integer.class);
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

    private String telefone(String valor) {
        return documento(valor);
    }

    private String uf(String valor) {
        String normalizado = texto(valor).toUpperCase(Locale.ROOT);
        return normalizado.length() > 2 ? normalizado.substring(0, 2) : normalizado;
    }
}
