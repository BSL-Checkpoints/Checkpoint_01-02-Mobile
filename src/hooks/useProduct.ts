/**
 * useProduct — detalhe de UM produto via useQuery.
 * O detalhe traz as variantes (onde vivem preço e estoque).
 */
import { useQuery } from '@tanstack/react-query';
import { getProduct } from '@/services/products';
import { queryKeys } from '@/lib/queryKeys';

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => getProduct(id),
    // Só dispara se houver um id (evita request com id vazio).
    enabled: Boolean(id),
  });
}
