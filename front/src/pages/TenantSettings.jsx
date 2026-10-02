import { useState } from 'react';
import Layout from '../components/Layout';
import { ErrorState, LoadingState, SuccessMessage } from '../components/States';
import { useApp } from '../context/AppContext';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';

const FEATURE_LABELS = {
  approvalRequired: 'Exigir aprovação de gestor antes da retirada',
  costCenter: 'Vincular reservas a centro de custo',
  lateFee: 'Cobrar multa por devolução em atraso',
};

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
  const { tenant, atualizarTenant } = useApp();
  const { dados, setDados, carregando, erro } = useApi('/tenants');
  const [mensagem, setMensagem] = useState(null);
  const [erroAcao, setErroAcao] = useState(null);

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

  return (
    <Layout>
      <h1 className="page-title">Personalização por cliente</h1>
      <p className="page-subtitle">
        Cada instituição que utiliza o LabShare é um cliente (tenant) independente, com seu próprio conjunto
        de recursos habilitados — sem duplicar código-fonte. As alterações são gravadas no banco.
      </p>
      <SuccessMessage mensagem={mensagem} />
      <ErrorState mensagem={erroAcao || erro} />
      {carregando && <LoadingState />}

      <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1.5rem' }}>
        {(dados || []).map((cliente) => (
          <div key={cliente.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 className="section-title" style={{ marginBottom: '0.25rem' }}>
                {cliente.nome} {cliente.id === tenant.id && <small style={{ color: 'var(--color-text-muted)' }}>(você está aqui)</small>}
              </h3>
              <span className="badge badge-neutral">{cliente.segmento}</span>
            </div>
            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
              {Object.entries(FEATURE_LABELS).map(([chave, rotulo]) => (
                <label key={chave} className="form-checkbox">
                  <input type="checkbox" checked={Boolean(cliente.features[chave])} onChange={() => toggleFeature(cliente, chave)} />
                  {rotulo} <code style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{chave}</code>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
