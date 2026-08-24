/**
 * O QueryClient é o "cérebro" do TanStack Query: guarda o cache, controla
 * quando um dado está "stale" (velho) e quando refazer a busca.
 *
 * Estes defaults valem para o app inteiro (dá para sobrescrever por query).
 */
import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/types/api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Por quanto tempo o dado é considerado "fresco". Dentro desse tempo,
      // voltar para uma tela NÃO refaz a request — serve do cache, instantâneo.
      staleTime: 1000 * 30, // 30s

      // Quanto tempo um dado sem uso fica no cache antes de ser descartado.
      gcTime: 1000 * 60 * 5, // 5min

      // Não repetir em erros "de negócio" (401/404/422): retentar não resolve.
      // Só vale a pena reter em falha de rede/servidor.
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});
