/*
 * ============================================================
 *  ActiveLoan.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Laura  |  Atividade: Q2 (fluxo de retirada/devolução), Q1 (Template Method de notificação)
 * ------------------------------------------------------------
 *  O que faz: tela de "empréstimo ativo", mostrada logo depois que o técnico confirma a
 *  retirada (RN06: equipamento agora está "Em uso"). Daqui o técnico pode disparar os
 *  lembretes de devolução (RN12) ou ir para a tela de devolução.
 *  Quem chama: App.jsx, rota /tecnico/emprestimo-ativo/:reservaId (navigate feito pelo RegisterPickup).
 *  Chama: GET /api/reservas/{id}, POST /api/notificacoes/lembretes, rota /tecnico/devolucao/:reservaId.
 * ============================================================
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { ErrorState, LoadingState, SuccessMessage } from '../components/States';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatDateBR, formatDateTimeBR } from '../utils/format';

/**
 * Componente da tela. Recebe o id da reserva pela URL (useParams).
 */
export default function ActiveLoan() {
  // useParams: lê o ":reservaId" da rota /tecnico/emprestimo-ativo/:reservaId.
  const { reservaId } = useParams();
  // navigate: função do React Router para trocar de tela sem recarregar a página.
  const navigate = useNavigate();
  // useApi faz o GET automaticamente quando a tela abre:
  //   GET /api/reservas/{id} -> ReservaController.buscar (herdado de CrudController)
  //   -> ReservaService.buscar (CrudService) -> ReservaDao.buscarPorId
  //   -> SELECT t.*, u.nome AS usuario_nome, e.nome AS equipamento_nome, ... FROM reserva t
  //      JOIN usuario u ... JOIN equipamento e ... WHERE t.id = ? AND t.tenant_id = ?
  // "dados: r" só renomeia o resultado para r (a reserva).
  const { dados: r, carregando, erro } = useApi(`/reservas/${reservaId}`);
  // useState: estado da tela. mensagem = texto verde exibido após enviar os lembretes.
  const [mensagem, setMensagem] = useState(null);

  // Enquanto o GET não termina mostra "carregando"; se deu erro, mostra a mensagem do backend.
  if (carregando) return <Layout estreito><LoadingState /></Layout>;
  if (erro) return <Layout estreito><ErrorState mensagem={erro} /></Layout>;

  /**
   * Botão "Enviar lembretes de devolução" (RN12):
   *   POST /api/notificacoes/lembretes -> NotificacaoController.enviarLembretes
   *   -> NotificacaoService.enviarLembretesDeDevolucao
   *   -> SELECT ... FROM reserva t WHERE t.tenant_id = ? AND t.ativo = TRUE AND t.status IN ('EM_USO')
   *   -> para cada reserva que vence até amanhã: LembreteDevolucao.enviar (Template Method)
   *   -> INSERT INTO notificacao (tenant_id, ativo, usuario_id, titulo, mensagem, lida, data_criacao) VALUES (?, ...)
   * O backend devolve { enviados: N } e a tela mostra quantos lembretes saíram.
   */
  const enviarLembrete = async () => {
    const resp = await api.post('/notificacoes/lembretes');
    setMensagem(resp.enviados > 0
      ? `${resp.enviados} lembrete(s) enviado(s) para quem devolve até amanhã.`
      : 'Nenhuma devolução vence até amanhã, então nenhum lembrete foi enviado.');
  };

  // JSX da tela: resumo do empréstimo + botões. "Registrar devolução" navega para
  // /tecnico/devolucao/:reservaId (tela RegisterReturn).
  return (
    <Layout estreito>
      <div className="alert alert-success">Retirada registrada com sucesso.</div>
      <SuccessMessage mensagem={mensagem} />

      <div className="card">
        <div className="reservation-card__equipment">{r.equipamentoNome}</div>
        <div style={{ margin: '1rem 0' }}>
          <span className="badge badge-warning">Em uso por {r.usuarioNome?.split(' ')[0]}</span>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
          Retirado em {formatDateTimeBR(r.dataRetirada)} · devolução até {formatDateBR(r.dataFim)} às 18:00
        </p>

        <div className="button-group" style={{ marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={enviarLembrete}>Enviar lembretes de devolução</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate(`/tecnico/devolucao/${reservaId}`)}>Registrar devolução</button>
        </div>
      </div>
    </Layout>
  );
}
