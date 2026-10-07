-- ============================================================
--  data.sql  |  Camada: Banco de dados (dados de demonstração)
--  Responsável na apresentação: Todos  |  Atividade: Q2 (dados das telas CRUD + variabilidade por cliente)
-- ------------------------------------------------------------
--  O que faz: preenche o banco com 3 clientes, os recursos ligados de cada um,
--  usuários (personas), categorias, locais, centros de custo, equipamentos e
--  reservas de exemplo, para as telas já abrirem com dados.
--  Quem chama: o Spring Boot, logo depois do schema.sql (spring.sql.init.mode=always).
--  Chama: nada.
-- ============================================================
--  LabShare - dados de demonstração
--  "ON CONFLICT DO NOTHING" = se o registro já existe, não insere de novo.
--  Assim o backend pode reiniciar sem duplicar nada.
--  Senha de TODOS os usuários: 123456 (guardada com hash BCrypt)
--  Os ids são informados à mão aqui para os exemplos se referirem uns aos outros
--  (ex.: equipamento 5 na categoria 2). No final, setval ajusta os contadores SERIAL.
-- ============================================================

-- ---------- Clientes (tenants) ----------
-- Cada cliente é uma variação da Linha de Produto. O id é o valor do cabeçalho X-Tenant-Id.
INSERT INTO tenant (id, nome, segmento) VALUES
 ('universidade',   'Universidade Padrão', 'Educação'),
 ('empresa',        'Empresa Corporativa', 'Corporativo'),
 ('escola_tecnica', 'Escola Técnica',      'Educação Profissionalizante')
ON CONFLICT (id) DO NOTHING;

-- ---------- VARIABILIDADE: recursos ligados por cliente ----------
-- Universidade: nenhum recurso extra (reserva direta, sem centro de custo, sem multa).
-- Empresa: approvalRequired + costCenter (gestor aprova e reserva exige centro de custo).
-- Escola Técnica: lateFee (devolução atrasada gera multa).
-- Esses valores podem ser trocados em tempo de execução na tela "Personalização".
INSERT INTO tenant_recurso (tenant_id, recurso, habilitado) VALUES
 ('universidade',   'approvalRequired', FALSE),
 ('universidade',   'costCenter',       FALSE),
 ('universidade',   'lateFee',          FALSE),
 ('empresa',        'approvalRequired', TRUE),
 ('empresa',        'costCenter',       TRUE),
 ('empresa',        'lateFee',          FALSE),
 ('escola_tecnica', 'approvalRequired', FALSE),
 ('escola_tecnica', 'costCenter',       FALSE),
 ('escola_tecnica', 'lateFee',          TRUE)
ON CONFLICT (tenant_id, recurso) DO NOTHING;

-- ---------- Usuários (personas) ----------
-- Todos usam o mesmo hash BCrypt da senha 123456 (RNF04: o banco nunca guarda a senha em texto).
-- O perfil define o que cada um pode fazer nas telas (RNF05).
INSERT INTO usuario (id, tenant_id, nome, email, senha_hash, perfil) VALUES
 (1,  'universidade',   'Lucas Almeida',    'lucas@email.com',          '$2a$10$xyUjQpUFLWUrp7ntuSvjsuC.TkheLJG2TZbnJvibvX9LiM1OIDcHa', 'aluno'),
 (2,  'universidade',   'Carlos Ferreira',  'carlos@email.com',         '$2a$10$xyUjQpUFLWUrp7ntuSvjsuC.TkheLJG2TZbnJvibvX9LiM1OIDcHa', 'tecnico'),
 (3,  'universidade',   'Fernanda Rocha',   'fernanda@email.com',       '$2a$10$xyUjQpUFLWUrp7ntuSvjsuC.TkheLJG2TZbnJvibvX9LiM1OIDcHa', 'manutencao'),
 (4,  'universidade',   'Roberto Lima',     'roberto@email.com',        '$2a$10$xyUjQpUFLWUrp7ntuSvjsuC.TkheLJG2TZbnJvibvX9LiM1OIDcHa', 'admin'),
 (5,  'universidade',   'Mariana Costa',    'mariana@email.com',        '$2a$10$xyUjQpUFLWUrp7ntuSvjsuC.TkheLJG2TZbnJvibvX9LiM1OIDcHa', 'aluno'),
 (6,  'universidade',   'Ricardo Nunes',    'ricardo@email.com',        '$2a$10$xyUjQpUFLWUrp7ntuSvjsuC.TkheLJG2TZbnJvibvX9LiM1OIDcHa', 'professor'),
 (7,  'empresa',        'Patrícia Souza',   'patricia@empresa.com',     '$2a$10$xyUjQpUFLWUrp7ntuSvjsuC.TkheLJG2TZbnJvibvX9LiM1OIDcHa', 'gestor'),
 (8,  'empresa',        'Bruno Tavares',    'bruno@empresa.com',        '$2a$10$xyUjQpUFLWUrp7ntuSvjsuC.TkheLJG2TZbnJvibvX9LiM1OIDcHa', 'aluno'),
 (9,  'empresa',        'Diego Martins',    'diego@empresa.com',        '$2a$10$xyUjQpUFLWUrp7ntuSvjsuC.TkheLJG2TZbnJvibvX9LiM1OIDcHa', 'tecnico'),
 (10, 'empresa',        'Helena Duarte',    'helena@empresa.com',       '$2a$10$xyUjQpUFLWUrp7ntuSvjsuC.TkheLJG2TZbnJvibvX9LiM1OIDcHa', 'admin'),
 (11, 'escola_tecnica', 'Vera Machado',     'vera@escolatecnica.com',   '$2a$10$xyUjQpUFLWUrp7ntuSvjsuC.TkheLJG2TZbnJvibvX9LiM1OIDcHa', 'admin'),
 (12, 'escola_tecnica', 'Igor Salles',      'igor@escolatecnica.com',   '$2a$10$xyUjQpUFLWUrp7ntuSvjsuC.TkheLJG2TZbnJvibvX9LiM1OIDcHa', 'aluno'),
 (13, 'escola_tecnica', 'Paulo Henrique',   'paulo@escolatecnica.com',  '$2a$10$xyUjQpUFLWUrp7ntuSvjsuC.TkheLJG2TZbnJvibvX9LiM1OIDcHa', 'tecnico')
ON CONFLICT (id) DO NOTHING;

-- ---------- Categorias ----------
-- Cada cliente tem as suas próprias categorias (separadas por tenant_id).
INSERT INTO categoria (id, tenant_id, nome, icone) VALUES
 (1, 'universidade',   'Eletrônica',    'cpu'),
 (2, 'universidade',   'Áudio e Vídeo', 'camera'),
 (3, 'universidade',   'Informática',   'monitor'),
 (4, 'universidade',   'Ferramentas',   'wrench'),
 (5, 'empresa',        'Informática',   'monitor'),
 (6, 'empresa',        'Áudio e Vídeo', 'camera'),
 (7, 'escola_tecnica', 'Eletrônica',    'cpu'),
 (8, 'escola_tecnica', 'Ferramentas',   'wrench')
ON CONFLICT (id) DO NOTHING;

-- ---------- Locais ----------
INSERT INTO local (id, tenant_id, nome, descricao) VALUES
 (1, 'universidade',   'Lab. Eletrônica – Sala 12', 'Bloco A, 1º andar'),
 (2, 'universidade',   'Lab. Eletrônica – Sala 10', 'Bloco A, 1º andar'),
 (3, 'universidade',   'Lab. Multimídia – Sala 5',  'Bloco C, térreo'),
 (4, 'universidade',   'Sala Maker',                'Bloco B, 2º andar'),
 (5, 'empresa',        'Almoxarifado de TI',        'Torre 1, 3º andar'),
 (6, 'escola_tecnica', 'Oficina Técnica',           'Prédio principal')
ON CONFLICT (id) DO NOTHING;

-- ---------- Centros de custo (só a Empresa Corporativa usa) ----------
INSERT INTO centro_custo (id, tenant_id, codigo, nome) VALUES
 (1, 'empresa', 'CC-ENG', 'Engenharia de Produto'),
 (2, 'empresa', 'CC-MKT', 'Marketing'),
 (3, 'empresa', 'CC-TI',  'TI Interna')
ON CONFLICT (id) DO NOTHING;

-- ---------- Equipamentos ----------
-- O prefixo E antes das aspas (E-string) faz o PostgreSQL entender barra-n como quebra de linha.
-- Assim itens_inclusos e itens_checklist ficam com um item por linha
-- (o AbstractDao.deLinhas transforma esse texto em lista no Java).
-- Há equipamentos em vários status (DISPONIVEL, INDISPONIVEL, EM_USO, RESERVADO) para testar as telas.
INSERT INTO equipamento (id, tenant_id, nome, descricao, patrimonio, status, categoria_id, local_id, imagem_url, itens_inclusos, itens_checklist) VALUES
 (1, 'universidade', 'Kit Arduino Uno',
  'Kit completo para desenvolvimento com Arduino Uno. Ideal para projetos de eletrônica e prototipagem.',
  'PAT-2024-001', 'DISPONIVEL', 1, 1,
  'https://images.unsplash.com/photo-1629654297299-c8500471aae0?w=400&h=300&fit=crop',
  E'1x Placa Arduino Uno R3\n1x Cabo USB\nJumpers\nProtoboard\nLEDs\nResistores\nSensores',
  E'Placa Arduino Uno\nCabo USB\nProtoboard\nSensores\nJumpers'),
 (2, 'universidade', 'Kit Arduino Mega',
  'Kit Arduino Mega 2560 para projetos avançados com mais pinos e memória.',
  'PAT-2024-002', 'DISPONIVEL', 1, 1,
  'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400&h=300&fit=crop',
  E'1x Placa Arduino Mega\n1x Cabo USB\nJumpers\nProtoboard',
  E'Placa Arduino Mega\nCabo USB\nProtoboard\nJumpers'),
 (3, 'universidade', 'Shield Arduino Sensor',
  'Shield com múltiplos sensores integrados para Arduino.',
  'PAT-2024-003', 'INDISPONIVEL', 1, 1,
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
  E'1x Shield Sensor\nCabos de conexão', E'Shield Sensor\nCabos'),
 (4, 'universidade', 'Osciloscópio Digital',
  'Osciloscópio digital de bancada 100MHz.',
  'PAT-2024-010', 'DISPONIVEL', 1, 2,
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
  E'1x Osciloscópio\n2x Sondas\n1x Cabo USB', E'Osciloscópio\nSondas\nCabo USB'),
 (5, 'universidade', 'Câmera HD',
  'Câmera profissional HD para gravações em laboratório.',
  'PAT-2024-020', 'EM_USO', 2, 3,
  'https://images.unsplash.com/photo-1516035069371-29a1b244ccaf?w=400&h=300&fit=crop',
  E'1x Câmera\n1x Tripé\n1x Cartão SD', E'Câmera\nTripé\nCartão SD'),
 (6, 'empresa', 'Notebook Dell Precision',
  'Workstation para apresentações e desenvolvimento.',
  'EMP-0001', 'RESERVADO', 5, 5,
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
  E'1x Notebook\n1x Carregador\n1x Mouse', E'Notebook\nCarregador\nMouse'),
 (7, 'empresa', 'Câmera HD',
  'Câmera para gravação de vídeos institucionais.',
  'EMP-0002', 'DISPONIVEL', 6, 5,
  'https://images.unsplash.com/photo-1516035069371-29a1b244ccaf?w=400&h=300&fit=crop',
  E'1x Câmera\n1x Tripé', E'Câmera\nTripé'),
 (8, 'escola_tecnica', 'Kit Arduino Uno',
  'Kit Arduino Uno para as aulas práticas do curso técnico.',
  'ET-001', 'DISPONIVEL', 7, 6,
  'https://images.unsplash.com/photo-1629654297299-c8500471aae0?w=400&h=300&fit=crop',
  E'1x Placa Arduino Uno R3\n1x Cabo USB\nProtoboard', E'Placa Arduino Uno\nCabo USB\nProtoboard'),
 (9, 'escola_tecnica', 'Kit Arduino Mega',
  'Kit Arduino Mega para projetos de conclusão de curso.',
  'ET-002', 'EM_USO', 7, 6,
  'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400&h=300&fit=crop',
  E'1x Placa Arduino Mega\n1x Cabo USB', E'Placa Arduino Mega\nCabo USB'),
 (10, 'escola_tecnica', 'Multímetro Digital',
  'Multímetro digital com pontas de prova.',
  'ET-010', 'DISPONIVEL', 8, 6,
  'https://images.unsplash.com/photo-1597424216809-3ba9864aeb18?w=400&h=300&fit=crop',
  E'1x Multímetro\n2x Pontas de prova', E'Multímetro\nPontas de prova')
ON CONFLICT (id) DO NOTHING;

-- ---------- Reservas de exemplo (datas relativas a hoje) ----------
-- CURRENT_DATE - 2 / + 1 calcula datas a partir de hoje, então os exemplos
-- continuam fazendo sentido em qualquer dia em que o backend for iniciado.
INSERT INTO reserva (id, tenant_id, usuario_id, equipamento_id, data_inicio, data_fim, status, centro_custo_id, justificativa, data_retirada) VALUES
 -- Mariana está com a Câmera HD e devolve amanhã (serve para testar o lembrete)
 (1, 'universidade', 5, 5, CURRENT_DATE - 2, CURRENT_DATE + 1, 'EM_USO', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '2 days'),
 -- Bruno (Empresa) pediu o notebook: aguarda aprovação da gestora Patrícia
 (2, 'empresa', 8, 6, CURRENT_DATE + 3, CURRENT_DATE + 5, 'AGUARDANDO_APROVACAO', 1, 'Uso em apresentação para cliente externo.', NULL),
 -- Igor (Escola Técnica) está 3 dias atrasado: ao devolver, gera multa
 (3, 'escola_tecnica', 12, 9, CURRENT_DATE - 6, CURRENT_DATE - 3, 'EM_USO', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '6 days')
ON CONFLICT (id) DO NOTHING;

-- Ajusta os contadores SERIAL para continuar depois dos IDs inseridos acima
-- Sem isso, o próximo INSERT feito pela tela tentaria usar id 1 de novo e daria erro
-- de chave duplicada. pg_get_serial_sequence acha a sequência da coluna id e
-- setval coloca nela o maior id existente (GREATEST garante no mínimo 1 com tabela vazia).
SELECT setval(pg_get_serial_sequence('usuario', 'id'),      GREATEST((SELECT MAX(id) FROM usuario), 1));
SELECT setval(pg_get_serial_sequence('categoria', 'id'),    GREATEST((SELECT MAX(id) FROM categoria), 1));
SELECT setval(pg_get_serial_sequence('local', 'id'),        GREATEST((SELECT MAX(id) FROM local), 1));
SELECT setval(pg_get_serial_sequence('centro_custo', 'id'), GREATEST((SELECT MAX(id) FROM centro_custo), 1));
SELECT setval(pg_get_serial_sequence('equipamento', 'id'),  GREATEST((SELECT MAX(id) FROM equipamento), 1));
SELECT setval(pg_get_serial_sequence('reserva', 'id'),      GREATEST((SELECT MAX(id) FROM reserva), 1));

-- ---------- Referências aos sistemas externos (AIEs da Medição) ----------
-- Só preenche se ainda estiver vazio (IS NULL), para não sobrescrever edições feitas pelas telas.
UPDATE categoria SET grupo_patrimonial = 'GP-ELE' WHERE id IN (1, 7) AND grupo_patrimonial IS NULL;
UPDATE categoria SET grupo_patrimonial = 'GP-AV'  WHERE id IN (2, 6) AND grupo_patrimonial IS NULL;
UPDATE categoria SET grupo_patrimonial = 'GP-INF' WHERE id IN (3, 5) AND grupo_patrimonial IS NULL;
UPDATE categoria SET grupo_patrimonial = 'GP-FER' WHERE id IN (4, 8) AND grupo_patrimonial IS NULL;
UPDATE local SET codigo_sala = 'BLA-112' WHERE id = 1 AND codigo_sala IS NULL;
UPDATE local SET codigo_sala = 'BLA-110' WHERE id = 2 AND codigo_sala IS NULL;
UPDATE local SET codigo_sala = 'BLC-005' WHERE id = 3 AND codigo_sala IS NULL;
UPDATE local SET codigo_sala = 'BLB-210' WHERE id = 4 AND codigo_sala IS NULL;
UPDATE local SET codigo_sala = 'T1-305'  WHERE id = 5 AND codigo_sala IS NULL;
UPDATE local SET codigo_sala = 'OF-01'   WHERE id = 6 AND codigo_sala IS NULL;
UPDATE usuario SET matricula = '2024100231'  WHERE id = 1  AND matricula IS NULL;
UPDATE usuario SET matricula = 'S-01290'     WHERE id = 2  AND matricula IS NULL;
UPDATE usuario SET matricula = 'S-01377'     WHERE id = 3  AND matricula IS NULL;
UPDATE usuario SET matricula = '2023200417'  WHERE id = 5  AND matricula IS NULL;
UPDATE usuario SET matricula = 'P-08812'     WHERE id = 6  AND matricula IS NULL;
UPDATE usuario SET matricula = 'RH-1022'     WHERE id = 8  AND matricula IS NULL;
UPDATE usuario SET matricula = 'ET-2026-014' WHERE id = 12 AND matricula IS NULL;
