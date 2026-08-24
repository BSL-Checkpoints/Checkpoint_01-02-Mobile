/**
 * useProducts — lista de produtos via useQuery.
 *
 * Compare com a Semana 1: lá você faria useState(loading) + useState(data) +
 * useState(error) + useEffect(fetch). Aqui uma linha entrega os três estados,
 * cache, dedupe de requests e revalidação. É esse o ganho da Semana 2.
 */
import { useQuery } from '@tanstack/react-query';
import { listProducts, type ListProductsParams } from '@/services/products';
import { queryKeys } from '@/lib/queryKeys';

export function useProducts(params: ListProductsParams = {}) {
  return useQuery({
    // A key inclui os params: buscar "camisa" e "tênis" viram caches separados.
    queryKey: queryKeys.products.list(params),
    queryFn: () => listProducts(params),
    // Mantém a lista anterior na tela enquanto uma nova busca carrega
    // (sem "piscar" para tela vazia ao digitar no campo de busca).
    placeholderData: (previous) => previous,
  });
}
