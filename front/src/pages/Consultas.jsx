/*
 * ============================================================
 *  Consultas.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Laura, João e Camilla  |  Disciplina: Medição (Consultas Externas - CE)
 * ------------------------------------------------------------
 *  O que faz: central de consultas. Mostra um card para cada consulta (CE) que o perfil logado
 *  pode usar; clicar abre /consultas/{tipo} (ConsultaView).
 *  Quem chama: App.jsx, rota /consultas (menu "Consultas").
 *  Chama: config/consultaConfigs.jsx (CONSULTAS), AppContext (user). Não chama a API.
 * ============================================================
 */
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { CONSULTAS } from '../config/consultaConfigs';

export default function Consultas() {
  const { user } = useApp();
  const navigate = useNavigate();
  // Só as consultas liberadas para o perfil logado (RNF05).
  const lista = Object.entries(CONSULTAS)
    .filter(([, c]) => c.perfis.includes(user?.perfil))
    .sort(([, a], [, b]) => a.id.localeCompare(b.id)); // CE01, CE02... em ordem

  return (
    <Layout fullWidth>
      <div className="page-header">
        <h1 className="page-title">Consultas</h1>
        <p className="page-subtitle">Informe um filtro e veja os dados do LabShare e dos sistemas da instituição.</p>
      </div>
      <div className="report-grid">
        {lista.map(([tipo, c]) => (
          <button key={tipo} type="button" className="report-card" onClick={() => navigate(`/consultas/${tipo}`)}>
            <Search size={22} />
            <h3>{c.titulo}</h3>
            <p>{c.descricao}</p>
            <p className="report-meta">{c.id} · Responsável: {c.autora}</p>
          </button>
        ))}
      </div>
    </Layout>
  );
}
