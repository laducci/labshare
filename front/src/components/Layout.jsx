/*
 * ============================================================
 *  Layout.jsx  |  Camada: Front-end (componente de estrutura da página)
 *  Responsável na apresentação: Todos  |  Atividade: Q3 (reuso: moldura comum a todas as telas internas)
 * ------------------------------------------------------------
 *  O que faz: moldura usada por todas as telas depois do login: cabeçalho (nome do cliente e
 *  perfil do usuário, sino de notificações com contador de não lidas, avatar), menu lateral (Sidebar) e a área
 *  principal onde entra o conteúdo de cada tela (props.children).
 *  Quem chama: praticamente todas as páginas internas (<Layout> ... </Layout>).
 *  Chama: Sidebar, AppContext (useApp), api.js -> GET /api/notificacoes/minhas.
 * ============================================================
 */
import { useEffect, useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import Sidebar from './Sidebar';
import { rotuloPerfil } from '../utils/format';

// Props: children = conteúdo da tela.
//  - por padrão o conteúdo ocupa toda a largura disponível (listas, tabelas, painéis);
//  - estreito = true centraliza uma coluna de leitura confortável (telas de uma tarefa só:
//    confirmar reserva, registrar retirada/devolução, formulário de equipamento...).
//  - fullWidth é aceito por compatibilidade com as telas antigas (hoje é o comportamento padrão).
// eslint-disable-next-line no-unused-vars
export default function Layout({ children, fullWidth = false, estreito = false }) {
  const { user, tenant } = useApp();
  // Estado da tela: menu aberto no celular e quantidade de notificações não lidas (número no sino).
  const [menuOpen, setMenuOpen] = useState(false);
  const [naoLidas, setNaoLidas] = useState(0);
  const navigate = useNavigate();

  // useEffect roda depois que a tela aparece e sempre que o usuário muda.
  // GET /api/notificacoes/minhas -> NotificacaoController.minhas; conta só as que têm lida = false.
  useEffect(() => {
    if (!user) return;
    api.get('/notificacoes/minhas')
      .then((lista) => setNaoLidas(lista.filter((n) => !n.lida).length))
      .catch(() => setNaoLidas(0));
  }, [user]);

  // Estrutura: header (cliente + sino + avatar) e corpo (Sidebar + <main> com a tela).
  // O botão do sino usa navigate (troca de tela sem recarregar a página) para /notificacoes.
  return (
    <div className="app-layout">
      <header className="app-header">
        {/* Botão do menu: só aparece no celular (abre a gaveta do Sidebar). */}
        <button type="button" className="app-header__menu-btn app-sidebar--mobile-only"
          onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
          <Menu size={22} />
        </button>
        {/* Cliente (instituição) em que o usuário está + perfil dele: deixa claro "onde estou" e "quem sou". */}
        <div className="app-header__context">
          <span className="app-header__tenant">{tenant?.nome || 'LabShare'}</span>
          {user && <span className="app-header__role">{rotuloPerfil(user.perfil, tenant)}</span>}
        </div>
        <div className="app-header__actions">
          <button
            type="button"
            className="app-header__icon-btn"
            aria-label="Notificações"
            onClick={() => navigate('/notificacoes')}
          >
            <Bell size={19} />
            {naoLidas > 0 && <span className="header-badge">{naoLidas}</span>}
          </button>
          {user && (
            <div className="app-header__profile" title={user.nome}>
              {user.primeiroNome?.charAt(0)}
            </div>
          )}
        </div>
      </header>
      <div className="app-body">
        <Sidebar mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className={`app-main ${estreito ? 'app-main--estreito' : ''}`}>{children}</main>
      </div>
    </div>
  );
}
