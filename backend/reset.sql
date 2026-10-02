-- ============================================================
--  Volta o banco ao estado inicial de demonstração.
--  Uso: cole no SQL Editor do Neon e execute. Depois reinicie o backend:
--  ele recria as tabelas (schema.sql) e os dados de exemplo (data.sql).
-- ============================================================
DROP TABLE IF EXISTS historico, notificacao, multa, manutencao, ocorrencia, reserva,
    centro_custo, equipamento, local, categoria, usuario, tenant_recurso, tenant CASCADE;
