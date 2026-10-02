-- ============================================================
--  LabShare - estrutura do banco (PostgreSQL / Neon)
--  Roda automaticamente quando o backend inicia.
--  "IF NOT EXISTS" garante que pode rodar várias vezes sem erro.
--
--  Toda tabela de negócio tem tenant_id: é o que permite o mesmo
--  banco atender vários clientes (Linha de Produto de Software).
-- ============================================================

-- Clientes (tenants) que usam o LabShare
CREATE TABLE IF NOT EXISTS tenant (
    id        VARCHAR(40)  PRIMARY KEY,
    nome      VARCHAR(120) NOT NULL,
    segmento  VARCHAR(80)
);

-- VARIABILIDADE: quais recursos cada cliente tem ligados (feature flags)
CREATE TABLE IF NOT EXISTS tenant_recurso (
    tenant_id   VARCHAR(40) NOT NULL REFERENCES tenant(id),
    recurso     VARCHAR(40) NOT NULL,
    habilitado  BOOLEAN     NOT NULL DEFAULT FALSE,
    PRIMARY KEY (tenant_id, recurso)
);

CREATE TABLE IF NOT EXISTS usuario (
    id          SERIAL PRIMARY KEY,
    tenant_id   VARCHAR(40)  NOT NULL REFERENCES tenant(id),
    nome        VARCHAR(120) NOT NULL,
    email       VARCHAR(120) NOT NULL UNIQUE,
    senha_hash  VARCHAR(100) NOT NULL,
    perfil      VARCHAR(20)  NOT NULL,
    ativo       BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS categoria (
    id         SERIAL PRIMARY KEY,
    tenant_id  VARCHAR(40) NOT NULL REFERENCES tenant(id),
    nome       VARCHAR(80) NOT NULL,
    icone      VARCHAR(30) DEFAULT 'cpu',
    ativo      BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS local (
    id         SERIAL PRIMARY KEY,
    tenant_id  VARCHAR(40)  NOT NULL REFERENCES tenant(id),
    nome       VARCHAR(120) NOT NULL,
    descricao  VARCHAR(255),
    ativo      BOOLEAN      NOT NULL DEFAULT TRUE
);

-- "Recurso / Ativo" genérico: pode ser Arduino, câmera, notebook, sala...
CREATE TABLE IF NOT EXISTS equipamento (
    id               SERIAL PRIMARY KEY,
    tenant_id        VARCHAR(40)  NOT NULL REFERENCES tenant(id),
    nome             VARCHAR(120) NOT NULL,
    descricao        TEXT,
    patrimonio       VARCHAR(40),
    status           VARCHAR(30)  NOT NULL DEFAULT 'DISPONIVEL',
    categoria_id     INTEGER REFERENCES categoria(id),
    local_id         INTEGER REFERENCES local(id),
    imagem_url       TEXT,
    itens_inclusos   TEXT,   -- um item por linha
    itens_checklist  TEXT,   -- um item por linha
    ativo            BOOLEAN NOT NULL DEFAULT TRUE
);

-- Usado apenas por clientes com o recurso "costCenter" (Empresa Corporativa)
CREATE TABLE IF NOT EXISTS centro_custo (
    id         SERIAL PRIMARY KEY,
    tenant_id  VARCHAR(40)  NOT NULL REFERENCES tenant(id),
    codigo     VARCHAR(20),
    nome       VARCHAR(120) NOT NULL,
    ativo      BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS reserva (
    id               SERIAL PRIMARY KEY,
    tenant_id        VARCHAR(40) NOT NULL REFERENCES tenant(id),
    usuario_id       INTEGER     NOT NULL REFERENCES usuario(id),
    equipamento_id   INTEGER     NOT NULL REFERENCES equipamento(id),
    data_inicio      DATE        NOT NULL,
    data_fim         DATE        NOT NULL,
    status           VARCHAR(30) NOT NULL,
    centro_custo_id  INTEGER REFERENCES centro_custo(id),
    justificativa    TEXT,
    data_retirada    TIMESTAMP,
    data_devolucao   DATE,
    observacoes      TEXT,
    ativo            BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS ocorrencia (
    id              SERIAL PRIMARY KEY,
    tenant_id       VARCHAR(40) NOT NULL REFERENCES tenant(id),
    equipamento_id  INTEGER     NOT NULL REFERENCES equipamento(id),
    reserva_id      INTEGER REFERENCES reserva(id),
    descricao       TEXT        NOT NULL,
    prioridade      VARCHAR(20) NOT NULL DEFAULT 'Média',
    status          VARCHAR(30) NOT NULL DEFAULT 'ABERTA',
    data_abertura   DATE        NOT NULL DEFAULT CURRENT_DATE,
    ativo           BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS manutencao (
    id                  SERIAL PRIMARY KEY,
    tenant_id           VARCHAR(40) NOT NULL REFERENCES tenant(id),
    equipamento_id      INTEGER     NOT NULL REFERENCES equipamento(id),
    ocorrencia_id       INTEGER REFERENCES ocorrencia(id),
    responsavel_id      INTEGER REFERENCES usuario(id),
    descricao_reparo    TEXT,
    pecas_substituidas  TEXT,
    data_inicio         DATE        NOT NULL DEFAULT CURRENT_DATE,
    data_fim            DATE,
    status              VARCHAR(30) NOT NULL DEFAULT 'EM_ANDAMENTO',
    ativo               BOOLEAN     NOT NULL DEFAULT TRUE
);

-- Usado apenas por clientes com o recurso "lateFee" (Escola Técnica)
CREATE TABLE IF NOT EXISTS multa (
    id           SERIAL PRIMARY KEY,
    tenant_id    VARCHAR(40)   NOT NULL REFERENCES tenant(id),
    reserva_id   INTEGER       NOT NULL REFERENCES reserva(id),
    dias_atraso  INTEGER       NOT NULL,
    valor        NUMERIC(10,2) NOT NULL,
    status       VARCHAR(20)   NOT NULL DEFAULT 'EM_ABERTO',
    ativo        BOOLEAN       NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS notificacao (
    id            SERIAL PRIMARY KEY,
    tenant_id     VARCHAR(40)  NOT NULL REFERENCES tenant(id),
    usuario_id    INTEGER      NOT NULL REFERENCES usuario(id),
    titulo        VARCHAR(150) NOT NULL,
    mensagem      TEXT         NOT NULL,
    lida          BOOLEAN      NOT NULL DEFAULT FALSE,
    data_criacao  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ativo         BOOLEAN      NOT NULL DEFAULT TRUE
);

-- Rastreabilidade (RNF10): tudo que acontece fica registrado aqui
CREATE TABLE IF NOT EXISTS historico (
    id           SERIAL PRIMARY KEY,
    tenant_id    VARCHAR(40) NOT NULL REFERENCES tenant(id),
    entidade     VARCHAR(40) NOT NULL,
    entidade_id  INTEGER,
    acao         VARCHAR(40) NOT NULL,
    descricao    TEXT,
    usuario_id   INTEGER REFERENCES usuario(id),
    data_hora    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);
