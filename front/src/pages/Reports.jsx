/*
 * ============================================================
 *  Reports.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Laura, João e Camilla  |  Disciplina: Medição (Saídas Externas - SE)
 * ------------------------------------------------------------
 *  O que faz: central de relatórios. Mostra um card para cada relatório (SE) que o perfil logado
 *  pode ver; clicar abre /relatorios/{tipo} (RelatorioView).
 *  VARIABILIDADE: relatório com "feature" (ex.: Multas -> lateFee) só aparece se o cliente tiver o recurso.
 *  Quem chama: App.jsx, rota /relatorios (menu "Relatórios").
 *  Chama: config/relatorioConfigs.jsx (RELATORIOS), AppContext (user, hasFeature). Não chama a API.
 * ============================================================
 */
import { useNavigate } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { RELATORIOS } from '../config/relatorioConfigs';

/** Lista de relatórios disponíveis para o usuário logado. */
export function relatoriosVisiveis(user, hasFeature) {
  return Object.entries(RELATORIOS).filter(([, r]) =>
    r.perfis.includes(user?.perfil) && (!r.feature || hasFeature(r.feature)));
}

export default function Reports() {
  const { user, hasFeature } = useApp();
  const navigate = useNavigate();
  const lista = relatoriosVisiveis(user, hasFeature);

  return (
    <Layout fullWidth>
      <div className="page-header">
        <h1 className="page-title">Relatórios</h1>
        <p className="page-subtitle">Relatórios gerenciais calculados pelo LabShare a partir dos dados do cliente.</p>
      </div>
      <div className="report-grid">
        {lista.map(([tipo, r]) => (
          <button key={tipo} type="button" className="report-card" onClick={() => navigate(`/relatorios/${tipo}`)}>
            <BarChart3 size={22} color="var(--color-primary)" />
            <h3>{r.titulo}</h3>
            <p>{r.descricao}</p>
            <p className="report-meta">{r.periodo ? 'Filtro por período' : 'Situação atual'} · Responsável: {r.autora}</p>
          </button>
        ))}
      </div>
    </Layout>
  );
}
