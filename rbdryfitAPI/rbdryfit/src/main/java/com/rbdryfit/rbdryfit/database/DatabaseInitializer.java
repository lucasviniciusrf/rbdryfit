package com.rbdryfit.rbdryfit.database;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component
public class DatabaseInitializer implements ApplicationRunner {

    private static final List<String> SIZES = List.of("P", "M", "G", "GG", "XG");

    private final JdbcTemplate jdbcTemplate;
    private final boolean initialize;
    private final boolean seedSampleData;

    public DatabaseInitializer(
            JdbcTemplate jdbcTemplate,
            @Value("${app.database.initialize:true}") boolean initialize,
            @Value("${app.database.seed-sample-data:true}") boolean seedSampleData
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.initialize = initialize;
        this.seedSampleData = seedSampleData;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!initialize) {
            return;
        }

        criarSequences();
        criarTabelas();
        criarIndices();
        sincronizarSequences();

        if (seedSampleData) {
            semearDadosIniciais();
        }
    }

    private void criarSequences() {
        criarSequenceSeNecessario("RB_FORNECEDOR_SEQ");
        criarSequenceSeNecessario("RB_PRODUTO_SEQ");
        criarSequenceSeNecessario("RB_ESTOQUE_GRADE_SEQ");
        criarSequenceSeNecessario("RB_CLIENTE_SEQ");
        criarSequenceSeNecessario("RB_PEDIDO_SEQ");
        criarSequenceSeNecessario("RB_PEDIDO_ITEM_SEQ");
    }

    private void criarTabelas() {
        executarSeTabelaNaoExiste("RB_FORNECEDOR", """
                CREATE TABLE RB_FORNECEDOR (
                    ID INTEGER NOT NULL,
                    NOME VARCHAR(120) NOT NULL,
                    CATEGORIA VARCHAR(80),
                    CONTATO VARCHAR(80),
                    TELEFONE VARCHAR(30),
                    CIDADE VARCHAR(80),
                    LEAD_TIME_DIAS INTEGER DEFAULT 7 NOT NULL,
                    AVALIACAO NUMERIC(4,2) DEFAULT 4.60 NOT NULL,
                    PEDIDOS_ABERTOS INTEGER DEFAULT 0 NOT NULL,
                    STATUS VARCHAR(30) DEFAULT 'Em avaliacao' NOT NULL,
                    INATIVO BOOLEAN DEFAULT FALSE NOT NULL,
                    CRIADO_EM TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                    ATUALIZADO_EM TIMESTAMP,
                    CONSTRAINT PK_RB_FORNECEDOR PRIMARY KEY (ID)
                )
                """);

        executarSeTabelaNaoExiste("RB_PRODUTO", """
                CREATE TABLE RB_PRODUTO (
                    ID INTEGER NOT NULL,
                    NOME VARCHAR(140) NOT NULL,
                    CATEGORIA VARCHAR(50) NOT NULL,
                    PRECO NUMERIC(15,2) DEFAULT 0 NOT NULL,
                    CUSTO NUMERIC(15,2) DEFAULT 0 NOT NULL,
                    IMAGEM_URL VARCHAR(600),
                    BADGE VARCHAR(50),
                    DESCRICAO VARCHAR(1000),
                    TECIDO VARCHAR(160),
                    CORES VARCHAR(600),
                    FORNECEDOR_ID INTEGER,
                    PONTO_REPOSICAO INTEGER DEFAULT 10 NOT NULL,
                    ATIVO BOOLEAN DEFAULT TRUE NOT NULL,
                    LANCAMENTO BOOLEAN DEFAULT FALSE NOT NULL,
                    CRIADO_EM TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                    ATUALIZADO_EM TIMESTAMP,
                    CONSTRAINT PK_RB_PRODUTO PRIMARY KEY (ID),
                    CONSTRAINT FK_RB_PROD_FORN FOREIGN KEY (FORNECEDOR_ID) REFERENCES RB_FORNECEDOR (ID)
                )
                """);

        executarSeTabelaNaoExiste("RB_ESTOQUE_GRADE", """
                CREATE TABLE RB_ESTOQUE_GRADE (
                    ID INTEGER NOT NULL,
                    PRODUTO_ID INTEGER NOT NULL,
                    TAMANHO VARCHAR(10) NOT NULL,
                    QUANTIDADE INTEGER DEFAULT 0 NOT NULL,
                    CRIADO_EM TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                    ATUALIZADO_EM TIMESTAMP,
                    CONSTRAINT PK_RB_ESTOQUE_GRADE PRIMARY KEY (ID),
                    CONSTRAINT FK_RB_EST_PROD FOREIGN KEY (PRODUTO_ID) REFERENCES RB_PRODUTO (ID),
                    CONSTRAINT UQ_RB_EST_PROD_TAM UNIQUE (PRODUTO_ID, TAMANHO)
                )
                """);

        executarSeTabelaNaoExiste("RB_CLIENTE", """
                CREATE TABLE RB_CLIENTE (
                    ID INTEGER NOT NULL,
                    NOME VARCHAR(140) NOT NULL,
                    DOCUMENTO VARCHAR(20),
                    TELEFONE VARCHAR(30),
                    EMAIL VARCHAR(120),
                    CIDADE VARCHAR(80),
                    UF VARCHAR(2),
                    TIPO VARCHAR(40) DEFAULT 'Consumidor' NOT NULL,
                    OBSERVACAO VARCHAR(1000),
                    INATIVO BOOLEAN DEFAULT FALSE NOT NULL,
                    CRIADO_EM TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                    ATUALIZADO_EM TIMESTAMP,
                    CONSTRAINT PK_RB_CLIENTE PRIMARY KEY (ID)
                )
                """);

        executarSeTabelaNaoExiste("RB_PEDIDO", """
                CREATE TABLE RB_PEDIDO (
                    ID INTEGER NOT NULL,
                    CODIGO VARCHAR(20) NOT NULL,
                    CLIENTE_ID INTEGER,
                    CLIENTE_NOME VARCHAR(140),
                    DATA_PEDIDO TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                    FORMA_PAGAMENTO VARCHAR(40),
                    STATUS VARCHAR(30) DEFAULT 'Recebido' NOT NULL,
                    VALOR_BRUTO NUMERIC(15,2) DEFAULT 0 NOT NULL,
                    DESCONTO NUMERIC(15,2) DEFAULT 0 NOT NULL,
                    ACRESCIMO NUMERIC(15,2) DEFAULT 0 NOT NULL,
                    TOTAL NUMERIC(15,2) DEFAULT 0 NOT NULL,
                    OBSERVACAO VARCHAR(1000),
                    CRIADO_EM TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                    ATUALIZADO_EM TIMESTAMP,
                    CONSTRAINT PK_RB_PEDIDO PRIMARY KEY (ID),
                    CONSTRAINT UQ_RB_PEDIDO_COD UNIQUE (CODIGO),
                    CONSTRAINT FK_RB_PED_CLI FOREIGN KEY (CLIENTE_ID) REFERENCES RB_CLIENTE (ID)
                )
                """);

        executarSeTabelaNaoExiste("RB_PEDIDO_ITEM", """
                CREATE TABLE RB_PEDIDO_ITEM (
                    ID INTEGER NOT NULL,
                    PEDIDO_ID INTEGER NOT NULL,
                    PRODUTO_ID INTEGER,
                    PRODUTO_NOME VARCHAR(140) NOT NULL,
                    TAMANHO VARCHAR(10),
                    QUANTIDADE INTEGER DEFAULT 1 NOT NULL,
                    VALOR_UNITARIO NUMERIC(15,2) DEFAULT 0 NOT NULL,
                    SUBTOTAL NUMERIC(15,2) DEFAULT 0 NOT NULL,
                    CRIADO_EM TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                    CONSTRAINT PK_RB_PEDIDO_ITEM PRIMARY KEY (ID),
                    CONSTRAINT FK_RB_PEDITEM_PED FOREIGN KEY (PEDIDO_ID) REFERENCES RB_PEDIDO (ID),
                    CONSTRAINT FK_RB_PEDITEM_PROD FOREIGN KEY (PRODUTO_ID) REFERENCES RB_PRODUTO (ID)
                )
                """);
    }

    private void criarIndices() {
        criarIndiceSeNecessario("IX_RB_PRODUTO_NOME", "CREATE INDEX IX_RB_PRODUTO_NOME ON RB_PRODUTO (NOME)");
        criarIndiceSeNecessario("IX_RB_CLIENTE_NOME", "CREATE INDEX IX_RB_CLIENTE_NOME ON RB_CLIENTE (NOME)");
        criarIndiceSeNecessario("IX_RB_PEDIDO_DATA", "CREATE DESC INDEX IX_RB_PEDIDO_DATA ON RB_PEDIDO (DATA_PEDIDO)");
    }

    private void sincronizarSequences() {
        sincronizarSequence("RB_FORNECEDOR_SEQ", "RB_FORNECEDOR");
        sincronizarSequence("RB_PRODUTO_SEQ", "RB_PRODUTO");
        sincronizarSequence("RB_ESTOQUE_GRADE_SEQ", "RB_ESTOQUE_GRADE");
        sincronizarSequence("RB_CLIENTE_SEQ", "RB_CLIENTE");
        sincronizarSequence("RB_PEDIDO_SEQ", "RB_PEDIDO");
        sincronizarSequence("RB_PEDIDO_ITEM_SEQ", "RB_PEDIDO_ITEM");
    }

    private void semearDadosIniciais() {
        if (contar("RB_FORNECEDOR") == 0) {
            inserirFornecedor("Fenix Textil", "Dry fit premium", "Renata Lima", "(83) 99921-1840",
                    "Campina Grande - PB", 5, new BigDecimal("4.90"), 3, "Homologado");
            inserirFornecedor("Atlanta Sublimacao", "Camisas de time", "Bruno Matos", "(85) 98114-7721",
                    "Fortaleza - CE", 8, new BigDecimal("4.70"), 2, "Em producao");
            inserirFornecedor("North Fit Lab", "Bermudas e regatas", "Marina Torres", "(81) 98803-1520",
                    "Recife - PE", 6, new BigDecimal("4.80"), 1, "Homologado");
        }

        if (contar("RB_CLIENTE") == 0) {
            inserirCliente("Academia Iron Club", "11222333000144", "(83) 99100-2040", "compras@ironclub.com",
                    "Campina Grande", "PB", "Academia");
            inserirCliente("Studio Move Pro", "22333444000155", "(85) 98115-8722", "movepro@studio.com",
                    "Fortaleza", "CE", "Revenda");
            inserirCliente("Felipe Araujo", "12345678910", "(81) 98844-1200", "felipe@email.com",
                    "Recife", "PE", "Consumidor");
        }

        List<Integer> fornecedores = ids("RB_FORNECEDOR");
        if (contar("RB_PRODUTO") == 0 && !fornecedores.isEmpty()) {
            int fenix = fornecedores.get(0);
            int atlanta = fornecedores.size() > 1 ? fornecedores.get(1) : fenix;
            int north = fornecedores.size() > 2 ? fornecedores.get(2) : fenix;

            inserirProduto(
                    "Camisa Dry Fit Stealth", "Camisas", "54.90", "29.80",
                    "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&w=900&q=80",
                    "Giro alto", "Toque gelado, caimento atletico e secagem rapida.",
                    "Poliester premium + elastano", "Preto|Cinza chumbo|Off white", fenix, 18, true,
                    Map.of("P", 14, "M", 28, "G", 20, "GG", 11)
            );
            inserirProduto(
                    "Camisa Pro Compression", "Camisas", "69.90", "38.20",
                    "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&w=900&q=80",
                    "Performance", "Modelagem ajustada para treino pesado e alta respirabilidade.",
                    "Malha fria 180g", "Preto|Verde militar", fenix, 14, true,
                    Map.of("P", 8, "M", 19, "G", 16, "GG", 7, "XG", 4)
            );
            inserirProduto(
                    "Regata Dry Fit Basic", "Regatas", "44.90", "23.50",
                    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80",
                    "Leve", "Regata de treino com cava confortavel e acabamento reforcado.",
                    "Dry fit soft touch", "Preto|Branco|Azul petroleo", north, 12, false,
                    Map.of("P", 6, "M", 12, "G", 9, "GG", 3)
            );
            inserirProduto(
                    "Bermuda Flex Run", "Bermudas", "64.90", "35.10",
                    "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=900&q=80",
                    "2 bolsos", "Bermuda com elastico firme, bolso lateral e costura dupla.",
                    "Tactel elastano", "Preto|Grafite", north, 16, true,
                    Map.of("P", 10, "M", 18, "G", 22, "GG", 8)
            );
            inserirProduto(
                    "Camisa Team Prime", "Times", "79.90", "43.40",
                    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80",
                    "Atacado", "Base lisa para personalizacao, escudos e packs promocionais.",
                    "Microfibra esportiva", "Preto/dourado|Azul royal|Vermelho", atlanta, 20, false,
                    Map.of("P", 9, "M", 24, "G", 20, "GG", 15, "XG", 6)
            );
            inserirProduto(
                    "Kit Academia 3 Pecas", "Kits", "149.90", "87.60",
                    "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&w=900&q=80",
                    "Combo", "Camisa, regata e bermuda com preco fechado para revenda.",
                    "Mix dry fit e tactel", "Preto|Preto/branco", fenix, 8, true,
                    Map.of("P", 4, "M", 11, "G", 8, "GG", 5)
            );
        }

        if (contar("RB_PEDIDO") == 0) {
            List<Integer> clientes = ids("RB_CLIENTE");
            List<Integer> produtos = ids("RB_PRODUTO");
            if (!clientes.isEmpty() && !produtos.isEmpty()) {
                inserirPedidoSeed("RB-1048", clientes.get(0), "Academia Iron Club", "Pix", "Separacao",
                        LocalDateTime.now().minusHours(1), List.of(new ItemSeed(produtos.get(0), "Camisa Dry Fit Stealth", 42, "M", "54.90")));
                inserirPedidoSeed("RB-1047", clientes.size() > 1 ? clientes.get(1) : clientes.get(0), "Studio Move Pro", "Cartao", "Faturado",
                        LocalDateTime.now().minusHours(5), List.of(new ItemSeed(produtos.get(1), "Camisa Pro Compression", 18, "G", "69.90")));
                inserirPedidoSeed("RB-1046", clientes.size() > 2 ? clientes.get(2) : clientes.get(0), "Felipe Araujo", "Dinheiro", "Entregue",
                        LocalDateTime.now().minusDays(1), List.of(new ItemSeed(produtos.get(2), "Regata Dry Fit Basic", 6, "M", "44.90")));
            }
        }
    }

    private void inserirFornecedor(String nome, String categoria, String contato, String telefone, String cidade,
                                   int leadTime, BigDecimal avaliacao, int pedidosAbertos, String status) {
        jdbcTemplate.update("""
                INSERT INTO RB_FORNECEDOR (
                    ID, NOME, CATEGORIA, CONTATO, TELEFONE, CIDADE,
                    LEAD_TIME_DIAS, AVALIACAO, PEDIDOS_ABERTOS, STATUS, INATIVO
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)
                """, nextId("RB_FORNECEDOR_SEQ"), nome, categoria, contato, telefone, cidade,
                leadTime, avaliacao, pedidosAbertos, status);
    }

    private void inserirCliente(String nome, String documento, String telefone, String email,
                                String cidade, String uf, String tipo) {
        jdbcTemplate.update("""
                INSERT INTO RB_CLIENTE (
                    ID, NOME, DOCUMENTO, TELEFONE, EMAIL, CIDADE, UF, TIPO, INATIVO
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE)
                """, nextId("RB_CLIENTE_SEQ"), nome, documento, telefone, email, cidade, uf, tipo);
    }

    private void inserirProduto(String nome, String categoria, String preco, String custo, String imagem,
                                String badge, String descricao, String tecido, String cores, Integer fornecedorId,
                                Integer pontoReposicao, boolean lancamento, Map<String, Integer> grade) {
        Integer produtoId = nextId("RB_PRODUTO_SEQ");
        jdbcTemplate.update("""
                INSERT INTO RB_PRODUTO (
                    ID, NOME, CATEGORIA, PRECO, CUSTO, IMAGEM_URL, BADGE, DESCRICAO, TECIDO,
                    CORES, FORNECEDOR_ID, PONTO_REPOSICAO, ATIVO, LANCAMENTO
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)
                """, produtoId, nome, categoria, new BigDecimal(preco), new BigDecimal(custo), imagem, badge,
                descricao, tecido, cores, fornecedorId, pontoReposicao, lancamento);

        for (String tamanho : SIZES) {
            if (grade.containsKey(tamanho)) {
                inserirGrade(produtoId, tamanho, grade.get(tamanho));
            }
        }
    }

    private void inserirGrade(Integer produtoId, String tamanho, Integer quantidade) {
        jdbcTemplate.update("""
                INSERT INTO RB_ESTOQUE_GRADE (ID, PRODUTO_ID, TAMANHO, QUANTIDADE)
                VALUES (?, ?, ?, ?)
                """, nextId("RB_ESTOQUE_GRADE_SEQ"), produtoId, tamanho, quantidade);
    }

    private void inserirPedidoSeed(String codigo, Integer clienteId, String clienteNome, String formaPagamento,
                                   String status, LocalDateTime dataPedido, List<ItemSeed> itens) {
        BigDecimal valorBruto = itens.stream()
                .map(item -> new BigDecimal(item.valorUnitario()).multiply(BigDecimal.valueOf(item.quantidade())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Integer pedidoId = nextId("RB_PEDIDO_SEQ");

        jdbcTemplate.update("""
                INSERT INTO RB_PEDIDO (
                    ID, CODIGO, CLIENTE_ID, CLIENTE_NOME, DATA_PEDIDO, FORMA_PAGAMENTO,
                    STATUS, VALOR_BRUTO, DESCONTO, ACRESCIMO, TOTAL
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
                """, pedidoId, codigo, clienteId, clienteNome, Timestamp.valueOf(dataPedido), formaPagamento,
                status, valorBruto, valorBruto);

        for (ItemSeed item : itens) {
            BigDecimal valorUnitario = new BigDecimal(item.valorUnitario());
            jdbcTemplate.update("""
                    INSERT INTO RB_PEDIDO_ITEM (
                        ID, PEDIDO_ID, PRODUTO_ID, PRODUTO_NOME, TAMANHO, QUANTIDADE, VALOR_UNITARIO, SUBTOTAL
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, nextId("RB_PEDIDO_ITEM_SEQ"), pedidoId, item.produtoId(), item.produtoNome(),
                    item.tamanho(), item.quantidade(), valorUnitario,
                    valorUnitario.multiply(BigDecimal.valueOf(item.quantidade())));
        }
    }

    private void executarSeTabelaNaoExiste(String tabela, String ddl) {
        if (!tabelaExiste(tabela)) {
            jdbcTemplate.execute(ddl);
        }
    }

    private void criarSequenceSeNecessario(String sequence) {
        Integer quantidade = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM RDB$GENERATORS
                WHERE TRIM(RDB$GENERATOR_NAME) = ?
                """, Integer.class, sequence);

        if (quantidade == null || quantidade == 0) {
            jdbcTemplate.execute("CREATE SEQUENCE " + sequence);
        }
    }

    private void criarIndiceSeNecessario(String indice, String ddl) {
        Integer quantidade = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM RDB$INDICES
                WHERE TRIM(RDB$INDEX_NAME) = ?
                """, Integer.class, indice);

        if (quantidade == null || quantidade == 0) {
            jdbcTemplate.execute(ddl);
        }
    }

    private void sincronizarSequence(String sequence, String tabela) {
        Integer ultimo = jdbcTemplate.queryForObject(
                "SELECT COALESCE(MAX(ID), 0) FROM " + tabela,
                Integer.class
        );
        jdbcTemplate.execute("ALTER SEQUENCE " + sequence + " RESTART WITH " + (ultimo != null ? ultimo : 0));
    }

    private boolean tabelaExiste(String tabela) {
        Integer quantidade = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM RDB$RELATIONS
                WHERE TRIM(RDB$RELATION_NAME) = ?
                  AND COALESCE(RDB$SYSTEM_FLAG, 0) = 0
                """, Integer.class, tabela);

        return quantidade != null && quantidade > 0;
    }

    private int contar(String tabela) {
        Integer quantidade = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + tabela, Integer.class);
        return quantidade != null ? quantidade : 0;
    }

    private List<Integer> ids(String tabela) {
        return jdbcTemplate.query("SELECT ID FROM " + tabela + " ORDER BY ID", (rs, rowNum) -> rs.getInt("ID"));
    }

    private Integer nextId(String sequence) {
        return jdbcTemplate.queryForObject("SELECT NEXT VALUE FOR " + sequence + " FROM RDB$DATABASE", Integer.class);
    }

    private record ItemSeed(Integer produtoId, String produtoNome, Integer quantidade, String tamanho, String valorUnitario) {
    }
}
