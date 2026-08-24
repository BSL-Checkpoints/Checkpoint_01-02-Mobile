/**
 * Queries de PEDIDOS (SEMANA 3). Mesmo padrão da Semana 2: useQuery + query keys.
 */
import { useQuery } from '@tanstack/react-query';
import { getOrder, getOrderTimeline, listOrders } from '@/services/orders';
import { queryKeys } from '@/lib/queryKeys';
import { useSession } from '@/session/session';

/** Histórico de pedidos do cliente logado. */
export function useOrders() {
  const { isLoggedIn } = useSession();
  return useQuery({
    queryKey: queryKeys.orders.list(),
    queryFn: listOrders,
    enabled: isLoggedIn,
  });
}

/** Detalhe de um pedido. */
export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => getOrder(id),
    enabled: Boolean(id),
  });
}

/** Linha do tempo (transições de status) do pedido. */
export function useOrderTimeline(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.timeline(id),
    queryFn: () => getOrderTimeline(id),
    enabled: Boolean(id),
  });
}
