package com.rbdryfit.rbdryfit.produto;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class ProdutoService {

    private static final List<String> SIZES = List.of("P", "M", "G", "GG", "XG");
    private static final List<String> CATEGORIES = List.of("Camisas", "Regatas", "Bermudas", "Times", "Kits");
    private static final String DEFAULT_IMAGE =
            "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&w=900&q=80";

    private final JdbcTemplate jdbcTemplate;

    public ProdutoService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public ProdutoBootstrapResponse bootstrap() {
        List<String> tecidos = jdbcTemplate.query("""
                SELECT DISTINCT TECIDO
                FROM RB_PRODUTO
                WHERE COALESCE(TRIM(TECIDO), '') <> ''
                ORDER BY TECIDO
                """, (rs, rowNum) -> texto(rs.getString("TECIDO")));

        if (tecidos.isEmpty()) {
            tecidos = List.of("Dry fit", "Poliester premium + elastano", "Malha fria 180g");
        }

        return new ProdutoBootstrapResponse(CATEGORIES, SIZES, tecidos);
    }

    public List<ProdutoResponse> listar(String busca, Boolean somenteAtivos) {
        StringBuilder sql = new StringBuilder("""
                SELECT ID, NOME, CATEGORIA, PRECO, CUSTO, IMAGEM_URL, BADGE, DESCRICAO, TECIDO,
                       CORES, FORNECEDOR_ID, PONTO_REPOSICAO, ATIVO, LANCAMENTO
                FROM RB_PRODUTO
                WHERE 1 = 1
                """);
        List<Object> params = new ArrayList<>();

        if (Boolean.TRUE.equals(somenteAtivos)) {
            sql.append(" AND ATIVO = TRUE");
        }

        String termo = texto(busca);
        if (!termo.isBlank()) {
            sql.append("""
                    AND (
                        UPPER(NOME) LIKE ?
                        OR UPPER(CATEGORIA) LIKE ?
                        OR UPPER(COALESCE(DESCRICAO, '')) LIKE ?
                        OR UPPER(COALESCE(TECIDO, '')) LIKE ?
                        OR CAST(ID AS VARCHAR(20)) LIKE ?
                    )
                    """);
            String like = "%" + termo.toUpperCase(Locale.ROOT) + "%";
            params.add(like);
            params.add(like);
            params.add(like);
            params.add(like);
            params.add("%" + termo + "%");
        }

        sql.append(" ORDER BY ATIVO DESC, LANCAMENTO DESC, NOME");
        return jdbcTemplate.query(sql.toString(), this::mapear, params.toArray());
    }

    public ProdutoResponse buscar(Integer id) {
        validarId(id);
        List<ProdutoResponse> produtos = jdbcTemplate.query("""
                SELECT ID, NOME, CATEGORIA, PRECO, CUSTO, IMAGEM_URL, BADGE, DESCRICAO, TECIDO,
                       CORES, FORNECEDOR_ID, PONTO_REPOSICAO, ATIVO, LANCAMENTO
                FROM RB_PRODUTO
                WHERE ID = ?
                """, this::mapear, id);

        if (produtos.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto nao encontrado.");
        }

        return produtos.get(0);
    }

    @Transactional
    public ProdutoResponse criar(ProdutoRequest request) {
        validarRequest(request);
        validarFornecedor(request.supplierId());
        Integer id = nextId("RB_PRODUTO_SEQ");

        jdbcTemplate.update("""
                INSERT INTO RB_PRODUTO (
                    ID, NOME, CATEGORIA, PRECO, CUSTO, IMAGEM_URL, BADGE, DESCRICAO, TECIDO,
                    CORES, FORNECEDOR_ID, PONTO_REPOSICAO, ATIVO, LANCAMENTO
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                id,
                texto(request.name()),
                textoOuPadrao(request.category(), "Camisas"),
                decimalOuZero(request.price()),
                decimalOuZero(request.cost()),
                textoOuPadrao(request.image(), DEFAULT_IMAGE),
                textoOuPadrao(request.badge(), "Novo"),
                textoOuPadrao(request.description(), "Produto cadastrado pelo painel interno."),
                textoOuPadrao(request.fabric(), "Dry fit"),
                coresParaBanco(request.colors()),
                request.supplierId(),
                inteiroOuPadrao(request.reorderPoint(), 10),
                request.active() == null || request.active(),
                request.launch() == null || request.launch()
        );

        salvarGrade(id, normalizarGrade(request.sizes(), true));
        return buscar(id);
    }

    @Transactional
    public ProdutoResponse atualizar(Integer id, ProdutoRequest request) {
        validarId(id);
        ProdutoResponse atual = buscar(id);
        validarRequestParcial(request, atual);
        validarFornecedor(request.supplierId());

        String nome = textoOuPadrao(request.name(), atual.name());
        String categoria = textoOuPadrao(request.category(), atual.category());
        BigDecimal preco = request.price() != null ? request.price() : atual.price();
        BigDecimal custo = request.cost() != null ? request.cost() : atual.cost();
        String imagem = textoOuPadrao(request.image(), atual.image());
        String badge = textoOuPadrao(request.badge(), atual.badge());
        String descricao = textoOuPadrao(request.description(), atual.description());
        String tecido = textoOuPadrao(request.fabric(), atual.fabric());
        List<String> cores = request.colors() != null ? request.colors() : atual.colors();
        Integer fornecedorId = request.supplierId() != null ? request.supplierId() : atual.supplierId();
        Integer pontoReposicao = request.reorderPoint() != null ? request.reorderPoint() : atual.reorderPoint();
        Boolean ativo = request.active() != null ? request.active() : atual.active();
        Boolean lancamento = request.launch() != null ? request.launch() : atual.launch();

        jdbcTemplate.update("""
                UPDATE RB_PRODUTO
                SET NOME = ?,
                    CATEGORIA = ?,
                    PRECO = ?,
                    CUSTO = ?,
                    IMAGEM_URL = ?,
                    BADGE = ?,
                    DESCRICAO = ?,
                    TECIDO = ?,
                    CORES = ?,
                    FORNECEDOR_ID = ?,
                    PONTO_REPOSICAO = ?,
                    ATIVO = ?,
                    LANCAMENTO = ?,
                    ATUALIZADO_EM = CURRENT_TIMESTAMP
                WHERE ID = ?
                """,
                nome,
                categoria,
                preco,
                custo,
                imagem,
                badge,
                descricao,
                tecido,
                coresParaBanco(cores),
                fornecedorId,
                pontoReposicao,
                ativo,
                lancamento,
                id
        );

        if (request.sizes() != null) {
            salvarGrade(id, normalizarGrade(request.sizes(), false));
        }

        return buscar(id);
    }

    @Transactional
    public ProdutoResponse atualizarEstoque(Integer id, EstoqueRequest request) {
        validarId(id);
        buscar(id);
        if (request == null || request.sizes() == null || request.sizes().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe a grade de estoque.");
        }

        salvarGrade(id, normalizarGrade(request.sizes(), false));
        return buscar(id);
    }

    @Transactional
    public void inativar(Integer id) {
        validarId(id);
        int linhas = jdbcTemplate.update("""
                UPDATE RB_PRODUTO
                SET ATIVO = FALSE, ATUALIZADO_EM = CURRENT_TIMESTAMP
                WHERE ID = ?
                """, id);

        if (linhas == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto nao encontrado.");
        }
    }

    @Transactional
    public ProdutoResponse ativar(Integer id) {
        validarId(id);
        int linhas = jdbcTemplate.update("""
                UPDATE RB_PRODUTO
                SET ATIVO = TRUE, ATUALIZADO_EM = CURRENT_TIMESTAMP
                WHERE ID = ?
                """, id);

        if (linhas == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto nao encontrado.");
        }

        return buscar(id);
    }

    private ProdutoResponse mapear(ResultSet rs, int rowNum) throws SQLException {
        Integer id = rs.getInt("ID");
        return new ProdutoResponse(
                id,
                texto(rs.getString("NOME")),
                texto(rs.getString("CATEGORIA")),
                decimalOuZero(rs.getBigDecimal("PRECO")),
                decimalOuZero(rs.getBigDecimal("CUSTO")),
                texto(rs.getString("IMAGEM_URL")),
                texto(rs.getString("BADGE")),
                texto(rs.getString("DESCRICAO")),
                texto(rs.getString("TECIDO")),
                coresDoBanco(rs.getString("CORES")),
                buscarGrade(id),
                (Integer) rs.getObject("FORNECEDOR_ID"),
                rs.getInt("PONTO_REPOSICAO"),
                rs.getBoolean("ATIVO"),
                rs.getBoolean("LANCAMENTO")
        );
    }

    private Map<String, Integer> buscarGrade(Integer produtoId) {
        Map<String, Integer> grade = new LinkedHashMap<>();
        jdbcTemplate.query("""
                SELECT TAMANHO, QUANTIDADE
                FROM RB_ESTOQUE_GRADE
                WHERE PRODUTO_ID = ?
                ORDER BY
                    CASE TAMANHO
                        WHEN 'P' THEN 1
                        WHEN 'M' THEN 2
                        WHEN 'G' THEN 3
                        WHEN 'GG' THEN 4
                        WHEN 'XG' THEN 5
                        ELSE 99
                    END,
                    TAMANHO
                """, (RowCallbackHandler) rs ->
                grade.put(texto(rs.getString("TAMANHO")), Math.max(0, rs.getInt("QUANTIDADE"))), produtoId);

        return grade;
    }

    private void salvarGrade(Integer produtoId, Map<String, Integer> grade) {
        for (Map.Entry<String, Integer> entry : grade.entrySet()) {
            int linhas = jdbcTemplate.update("""
                    UPDATE RB_ESTOQUE_GRADE
                    SET QUANTIDADE = ?, ATUALIZADO_EM = CURRENT_TIMESTAMP
                    WHERE PRODUTO_ID = ? AND TAMANHO = ?
                    """, entry.getValue(), produtoId, entry.getKey());

            if (linhas == 0) {
                jdbcTemplate.update("""
                        INSERT INTO RB_ESTOQUE_GRADE (ID, PRODUTO_ID, TAMANHO, QUANTIDADE)
                        VALUES (?, ?, ?, ?)
                        """, nextId("RB_ESTOQUE_GRADE_SEQ"), produtoId, entry.getKey(), entry.getValue());
            }
        }
    }

    private Map<String, Integer> normalizarGrade(Map<String, Integer> grade, boolean incluirPadrao) {
        Map<String, Integer> normalizada = new LinkedHashMap<>();

        if (incluirPadrao) {
            for (String tamanho : List.of("P", "M", "G", "GG")) {
                normalizada.put(tamanho, 0);
            }
        }

        if (grade != null) {
            for (String tamanhoPadrao : SIZES) {
                if (grade.containsKey(tamanhoPadrao)) {
                    normalizada.put(tamanhoPadrao, Math.max(0, grade.getOrDefault(tamanhoPadrao, 0)));
                }
            }

            for (Map.Entry<String, Integer> entry : grade.entrySet()) {
                String tamanho = texto(entry.getKey()).toUpperCase(Locale.ROOT);
                if (!tamanho.isBlank() && !normalizada.containsKey(tamanho)) {
                    normalizada.put(tamanho, Math.max(0, entry.getValue() != null ? entry.getValue() : 0));
                }
            }
        }

        return normalizada;
    }

    private List<String> coresDoBanco(String valor) {
        String normalizado = texto(valor);
        if (normalizado.isBlank()) {
            return List.of();
        }

        return Arrays.stream(normalizado.split("\\|"))
                .map(this::texto)
                .filter(cor -> !cor.isBlank())
                .toList();
    }

    private String coresParaBanco(List<String> cores) {
        if (cores == null || cores.isEmpty()) {
            return "Preto";
        }

        List<String> normalizadas = cores.stream()
                .map(this::texto)
                .filter(cor -> !cor.isBlank())
                .toList();

        return normalizadas.isEmpty() ? "Preto" : String.join("|", normalizadas);
    }

    private void validarRequest(ProdutoRequest request) {
        if (request == null || texto(request.name()).isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe o nome do produto.");
        }

        if (request.price() != null && request.price().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O preco nao pode ser negativo.");
        }
    }

    private void validarRequestParcial(ProdutoRequest request, ProdutoResponse atual) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dados do produto nao enviados.");
        }

        if (textoOuPadrao(request.name(), atual.name()).isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe o nome do produto.");
        }
    }

    private void validarFornecedor(Integer fornecedorId) {
        if (fornecedorId == null || fornecedorId <= 0) {
            return;
        }

        Integer quantidade = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM RB_FORNECEDOR
                WHERE ID = ?
                """, Integer.class, fornecedorId);

        if (quantidade == null || quantidade == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fornecedor informado nao existe.");
        }
    }

    private void validarId(Integer id) {
        if (id == null || id <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Codigo do produto invalido.");
        }
    }

    private Integer nextId(String sequence) {
        return jdbcTemplate.queryForObject("SELECT NEXT VALUE FOR " + sequence + " FROM RDB$DATABASE", Integer.class);
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

    private BigDecimal decimalOuZero(BigDecimal valor) {
        return valor != null ? valor : BigDecimal.ZERO;
    }
}
