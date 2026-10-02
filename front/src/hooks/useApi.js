import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

/**
 * Hook reutilizável para carregar dados do backend (GET).
 * Uso: const { dados, carregando, erro, recarregar } = useApi('/equipamentos');
 * Passe null como caminho para não carregar nada (ex.: enquanto falta um id).
 */
export function useApi(caminho) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(Boolean(caminho));
  const [erro, setErro] = useState(null);

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

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return { dados, setDados, carregando, erro, recarregar };
}
