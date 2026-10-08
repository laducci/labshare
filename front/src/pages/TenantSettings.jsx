/*
 * ============================================================
 *  TenantSettings.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (exemplo de variabilidade: tenant_recurso), Q1 (Singleton FeatureFlagCache)
 * ------------------------------------------------------------
 *  O que faz: tela de personalização por cliente: liga/desliga os recursos de cada
 *  instituição (approvalRequired, costCenter, lateFee) gravando na tabela tenant_recurso.
 *  Quem chama: App.jsx, rota /admin/personalizacao (Dashboard e menu do admin).
 *  Chama: GET /api/tenants, PUT /api/tenants/{id}/recursos, AppContext.atualizarTenant (GET /api/tenants/atual).
 * ============================================================
 */
import { useState } from 'react';
import Layout from '../components/Layout';
import { ErrorState, LoadingState, SuccessMessage } from '../components/States';
import { useApp } from '../context/AppContext';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';

// Chave do recurso (coluna "recurso" da tabela tenant_recurso) -> título e explicação na tela.
const FEATURE_LABELS = {
  approvalRequired: 'Exigir aprovação de gestor antes da retirada',
  costCenter: 'Vincular reservas a centro de custo',
  lateFee: 'Cobrar multa por devolução em atraso',
};
const FEATURE_DESC = {
  approvalRequired: 'Toda reserva fica "Aguardando aprovação" até o gestor aprovar. Libera o perfil Gestor.',
  costCenter: 'A reserva pede um centro de custo e aparece o cadastro "Centros de custo" no menu.',
  lateFee: 'A devolução em atraso gera multa por dia e aparece o módulo "Multas" no menu.',
};

/** Um card de cliente com uma linha por recurso (título, explicação e interruptor). */
function CardCliente({ cliente, atual, onToggle }) {
  return (
    <div className="card">
      <div className="section-header">
        <div>
          <h2 className="section-title">{cliente.nome}</h2>
          <p className="feature-row__desc">{cliente.segmento}</p>
        </div>
        {atual && <span className="badge badge-success">Cliente atual</span>}
      </div>
      {Object.entries(FEATURE_LABELS).map(([chave, rotulo]) => {
        const ligado = Boolean(cliente.features[chave]);
        return (
          <div className="feature-row" key={chave}>
            <div>
              <p className="feature-row__title">{rotulo}</p>
              <p className="feature-row__desc">{FEATURE_DESC[chave]}</p>
            </div>
            {/* role="switch" + aria-checked: o CSS desenha o interruptor; o leitor de tela entende ligado/desligado. */}
            <button type="button" role="switch" aria-checked={ligado} aria-label={`${rotulo} (${cliente.nome})`}
              className="switch" onClick={() => onToggle(cliente, chave)} />
          </div>
        );
      })}
    </div>
  );
}

/**
 * ============================================================
 *  EXEMPLO DE VARIABILIDADE (questão 02)
 * ============================================================
 * Liga/desliga recursos de cada cliente SEM mudar código:
 *   checkbox -> PUT /api/tenants/{id}/recursos { "lateFee": true }
 *   -> TenantDao.salvarRecurso -> INSERT ... ON CONFLICT DO UPDATE (tabela tenant_recurso)
 *   -> FeatureFlagCache.invalidar (Singleton)
 * A partir daí: o menu mostra/esconde itens, as rotas liberam/bloqueiam e o backend
 * troca a estratégia (Strategy) usada nas reservas, multas e centros de custo.
 */
export default function TenantSettings() {
  // tenant = cliente do usuário logado; atualizarTenant relê o tenant atual (para o menu mudar na hora).
  const { tenant, atualizarTenant } = useApp();
  // GET /api/tenants -> TenantController.listar -> TenantService.listar
  //   -> TenantDao.listar -> SELECT id, nome, segmento FROM tenant ORDER BY nome
  //   -> para cada um: recursos do FeatureFlagCache (Singleton) ou, se não estiver em cache,
  //      SELECT recurso, habilitado FROM tenant_recurso WHERE tenant_id = ? ORDER BY recurso
  const { dados, setDados, carregando, erro } = useApi('/tenants');
  const [mensagem, setMensagem] = useState(null);
  const [erroAcao, setErroAcao] = useState(null);

  /**
   * Clique no checkbox:
   *   PUT /api/tenants/{id}/recursos { chave: true/false } -> TenantController.atualizarRecursos
   *   -> TenantService.atualizarRecursos -> TenantDao.salvarRecurso
   *   -> INSERT INTO tenant_recurso (tenant_id, recurso, habilitado) VALUES (?, ?, ?)
   *      ON CONFLICT (tenant_id, recurso) DO UPDATE SET habilitado = EXCLUDED.habilitado   ("upsert")
   *   -> FeatureFlagCache.invalidar(tenant) e INSERT INTO historico (... 'PERSONALIZACAO' ...)
   * Depois troca o cliente na lista e, se for o próprio cliente do admin, chama atualizarTenant()
   * (GET /api/tenants/atual) para o menu e as rotas mudarem sem novo login.
   */
  const toggleFeature = async (cliente, chave) => {
    setErroAcao(null);
    try {
      const atualizado = await api.put(`/tenants/${cliente.id}/recursos`, { [chave]: !cliente.features[chave] });
      setDados((lista) => lista.map((t) => (t.id === cliente.id ? atualizado : t)));
      setMensagem(`${cliente.nome}: "${FEATURE_LABELS[chave]}" ${atualizado.features[chave] ? 'ligado' : 'desligado'}.`);
      if (cliente.id === tenant.id) await atualizarTenant(); // o menu muda na hora
    } catch (e) {
      setErroAcao(e.message);
    }
  };

  // JSX: primeiro o cliente do administrador logado; depois os outros clientes (para demonstrar
  // que cada instituição tem a sua configuração, sem duplicar código).
  const atual = (dados || []).find((c) => c.id === tenant.id);
  const outros = (dados || []).filter((c) => c.id !== tenant.id);
  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Personalização</h1>
        <p className="page-subtitle">
          Ligue ou desligue recursos para cada instituição. O menu, as telas e as regras mudam na hora, sem mexer no código.
        </p>
      </div>
      <SuccessMessage mensagem={mensagem} />
      <ErrorState mensagem={erroAcao || erro} />
      {carregando && <LoadingState />}

      {atual && <CardCliente cliente={atual} atual onToggle={toggleFeature} />}
      {outros.length > 0 && (
        <section className="content-section" style={{ marginTop: 32 }}>
          <h2 className="section-title">Outros clientes do LabShare</h2>
          {outros.map((cliente) => <CardCliente key={cliente.id} cliente={cliente} onToggle={toggleFeature} />)}
        </section>
      )}
    </Layout>
  );
}
