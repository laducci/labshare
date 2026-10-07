-- ============================================================
--  schema.sql  |  Camada: Banco de dados (estrutura / DDL)
--  Responsável na apresentação: Todos  |  Atividade: Q2 (tabelas + variabilidade tenant_recurso)
-- ------------------------------------------------------------
--  O que faz: cria todas as tabelas do LabShare no PostgreSQL (Neon).
--  Quem chama: o Spring Boot, ao iniciar (spring.sql.init.mode=always em application.properties).
--  Chama: nada. Depois dele o Spring roda o data.sql (dados de demonstração).
-- ============================================================
--  LabShare - estrutura do banco (PostgreSQL / Neon)
--  Roda automaticamente quando o backend inicia.
--  "IF NOT EXISTS" garante que pode rodar várias vezes sem erro.
--
--  Toda tabela de negócio tem tenant_id: é o que permite o mesmo
--  banco atender vários clientes (Linha de Produto de Software).
--
--  Convenções usadas em todas as tabelas:
--  - id SERIAL PRIMARY KEY: número gerado automaticamente pelo banco (1, 2, 3...).
--  - tenant_id REFERENCES tenant(id): chave estrangeira, o registro pertence a um cliente.
--    Todo SELECT dos DAOs filtra "tenant_id = ?" para um cliente nunca ver dado de outro.
--  - ativo BOOLEAN DEFAULT TRUE: exclusão lógica. "Excluir" na tela faz
--    UPDATE ... SET ativo = FALSE, o registro continua no banco (histórico, RN11 / RNF10).
--  - status VARCHAR: guarda o nome do enum Java (ex.: 'DISPONIVEL', 'EM_USO').
-- ============================================================

-- Clientes (tenants) que usam o LabShare
-- O id é texto legível ('universidade', 'empresa', 'escola_tecnica') e é o valor
-- enviado pelo frontend no cabeçalho X-Tenant-Id.
CREATE TABLE IF NOT EXISTS tenant (
    id        VARCHAR(40)  PRIMARY KEY,
    nome      VARCHAR(120) NOT NULL,
    segmento  VARCHAR(80)
);

-- VARIABILIDADE: quais recursos cada cliente tem ligados (feature flags)
-- Recursos: approvalRequired (reserva precisa de aprovação do gestor),
-- costCenter (reserva exige centro de custo), lateFee (atraso gera multa).
-- Chave primária composta (tenant_id, recurso): cada recurso aparece uma vez por cliente,
-- o que permite o "ON CONFLICT (tenant_id, recurso) DO UPDATE" do TenantDao.salvarRecurso.
-- Lida pelo TenantDao.carregarRecursos e guardada no Singleton FeatureFlagCache.
CREATE TABLE IF NOT EXISTS tenant_recurso (
    tenant_id   VARCHAR(40) NOT NULL REFERENCES tenant(id),
    recurso     VARCHAR(40) NOT NULL,
    habilitado  BOOLEAN     NOT NULL DEFAULT FALSE,
    PRIMARY KEY (tenant_id, recurso)
);

-- Usuários do sistema (CRUD de Usuários e login).
-- email UNIQUE no sistema inteiro: o login busca só pelo e-mail, sem saber o cliente.
-- senha_hash: guarda o hash BCrypt, nunca a senha em texto (RNF04).
-- perfil: aluno, professor, tecnico, manutencao, gestor ou admin (autorização por perfil, RNF05).
CREATE TABLE IF NOT EXISTS usuario (
    id          SERIAL PRIMARY KEY,
    tenant_id   VARCHAR(40)  NOT NULL REFERENCES tenant(id),
    nome        VARCHAR(120) NOT NULL,
    email       VARCHAR(120) NOT NULL UNIQUE,
    senha_hash  VARCHAR(100) NOT NULL,
    perfil      VARCHAR(20)  NOT NULL,
    ativo       BOOLEAN      NOT NULL DEFAULT TRUE
);

-- Categorias de equipamento (CRUD de Categorias). icone = nome do ícone mostrado no frontend.
CREATE TABLE IF NOT EXISTS categoria (
    id         SERIAL PRIMARY KEY,
    tenant_id  VARCHAR(40) NOT NULL REFERENCES tenant(id),
    nome       VARCHAR(80) NOT NULL,
    icone      VARCHAR(30) DEFAULT 'cpu',
    ativo      BOOLEAN     NOT NULL DEFAULT TRUE
);

-- Locais físicos onde ficam os equipamentos (CRUD de Locais): laboratórios, salas.
CREATE TABLE IF NOT EXISTS local (
    id         SERIAL PRIMARY KEY,
    tenant_id  VARCHAR(40)  NOT NULL REFERENCES tenant(id),
    nome       VARCHAR(120) NOT NULL,
    descricao  VARCHAR(255),
    ativo      BOOLEAN      NOT NULL DEFAULT TRUE
);

-- "Recurso / Ativo" genérico: pode ser Arduino, câmera, notebook, sala...
-- status: DISPONIVEL, RESERVADO, EM_USO, EM_INSPECAO, EM_MANUTENCAO ou INDISPONIVEL.
-- Equipamento EM_MANUTENCAO ou INDISPONIVEL não pode ser reservado (RN01 / RN02).
-- categoria_id e local_id podem ser NULL, por isso os DAOs usam LEFT JOIN.
-- itens_checklist: itens conferidos na retirada e na devolução (RN05 / RN07).
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

-- Reservas / empréstimos (CRUD de Reservas e fluxo de retirada e devolução).
-- data_inicio e data_fim NOT NULL: reserva precisa de data inicial e final (RN03).
-- status: AGUARDANDO_APROVACAO, AGENDADA, EM_USO, FINALIZADA, CANCELADA ou REJEITADA.
-- centro_custo_id e justificativa: só preenchidos quando o cliente tem costCenter ligado.
-- data_retirada: gravada ao confirmar a retirada (RN06). data_devolucao: gravada na devolução.
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

-- Ocorrências: defeito ou dano encontrado na inspeção da devolução (RN08).
-- Abrir uma ocorrência leva o equipamento para Em manutenção (RN09).
-- reserva_id pode ser NULL (ocorrência registrada fora de um empréstimo).
-- status: ABERTA, EM_MANUTENCAO ou ENCERRADA.
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

-- Manutenções (CRUD de Manutenções). Geralmente nasce de uma ocorrência (ocorrencia_id).
-- Só quando a manutenção é concluída o equipamento volta a Disponível (RN10).
-- responsavel_id: usuário de manutenção que fez o reparo.
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
-- Criada na devolução atrasada. valor NUMERIC(10,2): dinheiro com 2 casas decimais exatas
-- (calculado pela Strategy CalculoMulta, ex.: dias_atraso x valor diário).
CREATE TABLE IF NOT EXISTS multa (
    id           SERIAL PRIMARY KEY,
    tenant_id    VARCHAR(40)   NOT NULL REFERENCES tenant(id),
    reserva_id   INTEGER       NOT NULL REFERENCES reserva(id),
    dias_atraso  INTEGER       NOT NULL,
    valor        NUMERIC(10,2) NOT NULL,
    status       VARCHAR(20)   NOT NULL DEFAULT 'EM_ABERTO',
    ativo        BOOLEAN       NOT NULL DEFAULT TRUE
);

-- Notificações mostradas na tela de avisos (ex.: lembrete perto da devolução, RN12).
-- lida: muda para TRUE quando o usuário abre o aviso.
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
-- Manter histórico (RN11). Não tem coluna "ativo": histórico nunca é editado nem excluído.
-- entidade + entidade_id dizem qual registro foi afetado (ex.: 'reserva', 5).
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

-- ============================================================
--  MEDIÇÃO (pontos de função): referências a ARQUIVOS DE INTERFACE EXTERNA (AIE)
--  Estas colunas guardam só a CHAVE de um registro que pertence a outro sistema
--  da instituição (patrimônio, ensalamento, acadêmico/RH, compras).
--  O LabShare apenas LÊ esses sistemas: não cria, não altera e não apaga nada lá.
--  ADD COLUMN IF NOT EXISTS permite rodar de novo num banco que já existia.
-- ============================================================
ALTER TABLE categoria  ADD COLUMN IF NOT EXISTS grupo_patrimonial VARCHAR(20);
ALTER TABLE local      ADD COLUMN IF NOT EXISTS codigo_sala       VARCHAR(20);
ALTER TABLE usuario    ADD COLUMN IF NOT EXISTS matricula         VARCHAR(30);
ALTER TABLE manutencao ADD COLUMN IF NOT EXISTS fornecedor_cnpj   VARCHAR(20);
