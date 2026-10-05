/*
 * ============================================================
 *  useApi.js  |  Camada: Front-end (hook React reutilizável)
 *  Responsável na apresentação: Todos  |  Atividade: Q3 (compactação/reuso), Q2 (telas com banco)
 * ------------------------------------------------------------
 *  O que faz: faz o GET automático de uma URL da API quando a tela abre e devolve
 *  { dados, carregando, erro, recarregar, setDados }. Evita repetir em cada tela o mesmo
 *  trio useState + useEffect + try/catch.
 *  Quem chama: quase todas as páginas, CrudPage e EquipmentForm.   Chama: services/api.js (api.get).
 * ============================================================
 */
import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

/**
 * Hook reutilizável para carregar dados do backend (GET).
 * Uso: const { dados, carregando, erro, recarregar } = useApi('/equipamentos');
 * Passe null como caminho para não carregar nada (ex.: enquanto falta um id).
 */
export function useApi(caminho) {
  // useState = estado da tela. Quando muda, o React redesenha o componente que usa o hook.
  const [dados, setDados] = useState(null);
  // Começa "carregando" só se existe caminho (com null não há nada para buscar).
  const [carregando, setCarregando] = useState(Boolean(caminho));
  const [erro, setErro] = useState(null);

  // Função que faz o GET. useCallback guarda a mesma função entre renderizações e só cria uma
  // nova quando o "caminho" muda (dependência [caminho]). Também é devolvida como "recarregar",
  // para a tela buscar de novo depois de salvar/excluir algo.
  const recarregar = useCallback(async () => {
    if (!caminho) return;
    setCarregando(true);
    try {
      setDados(await api.get(caminho));
      setErro(null);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [caminho]);

  // useEffect roda DEPOIS que a tela aparece e toda vez que "recarregar" muda (ou seja, quando o
  // caminho muda, ex.: /equipamentos/1 -> /equipamentos/2). É isso que faz o GET ser automático.
  useEffect(() => {
    recarregar();
  }, [recarregar]);

  // setDados também é exposto para a tela atualizar a lista localmente (ex.: após marcar notificação como lida).
  return { dados, setDados, carregando, erro, recarregar };
}
