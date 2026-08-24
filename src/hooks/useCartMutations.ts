/**
 * Mutations do carrinho com ATUALIZAÇÃO OTIMISTA — o coração da Semana 2.
 *
 * Ideia: em vez de "clicar -> esperar o servidor -> tela muda", a gente já
 * pinta o resultado esperado NA HORA (otimista) e, se o servidor recusar,
 * desfaz (rollback). O ciclo do TanStack Query para isso é:
 *
 *   onMutate  -> cancela buscas em voo, tira uma FOTO do cache e aplica o palpite
 *   onError   -> deu ruim: restaura a foto (rollback)
 *   onSettled -> terminou (ok ou erro): invalida pra bater com a verdade do servidor
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCartItem, removeCartItem, updateCartItem } from '@/services/cart';
import { queryKeys } from '@/lib/queryKeys';
import type { Cart } from '@/types/api';

const EMPTY_CART: Cart = { id: 'optimistic', items: [], total: 0, itemCount: 0 };

/** Recalcula total e itemCount a partir dos itens (mantém o Cart coerente). */
function recompute(items: Cart['items']): Cart {
  const total = items.reduce((sum, it) => sum + it.subtotal, 0);
  const itemCount = items.reduce((sum, it) => sum + it.quantity, 0);
  return { id: EMPTY_CART.id, items, total, itemCount };
}

export function useCartMutations() {
  const queryClient = useQueryClient();
  const key = queryKeys.cart.all;

  /** Bloco comum de rollback + reconciliação, reaproveitado pelas 3 mutations. */
  const rollbackOnError = (_e: unknown, _vars: unknown, ctx?: { previous?: Cart }) => {
    if (ctx?.previous) queryClient.setQueryData(key, ctx.previous);
  };
  const settle = () => {
    queryClient.invalidateQueries({ queryKey: key });
  };

  // --- Adicionar item -----------------------------------------------------
  // Precisa de `name` e `unitPrice` para conseguir DESENHAR o item otimista
  // (o servidor tem esses dados, mas a gente ainda não recebeu a resposta).
  const addItem = useMutation({
    mutationFn: (v: { variantId: string; quantity: number; name: string; unitPrice: number }) =>
      addCartItem(v.variantId, v.quantity),
    async onMutate(v) {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Cart>(key);
      const base = previous ?? EMPTY_CART;

      const existing = base.items.find((it) => it.variantId === v.variantId);
      const items = existing
        ? base.items.map((it) =>
          it.variantId === v.variantId
            ? { ...it, quantity: it.quantity + v.quantity, subtotal: it.unitPrice * (it.quantity + v.quantity) }
            : it,
        )
        : [
          ...base.items,
          {
            variantId: v.variantId,
            name: v.name,
            sku: '',
            unitPrice: v.unitPrice,
            quantity: v.quantity,
            subtotal: v.unitPrice * v.quantity,
          },
        ];

      queryClient.setQueryData<Cart>(key, recompute(items));
      return { previous };
    },
    onError: rollbackOnError,
    onSettled: settle,
  });

  // --- Alterar quantidade (0 remove) --------------------------------------
  const setQuantity = useMutation({
    mutationFn: (v: { variantId: string; quantity: number }) => updateCartItem(v.variantId, v.quantity),
    async onMutate(v) {
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<Cart>(key);

      const base = previous ?? EMPTY_CART;

      const items = base.items
        .map((it) =>
          it.variantId === v.variantId ? { ...it, quantity: v.quantity, subtotal: it.unitPrice * v.quantity } : it,
        )
        .filter((it) => it.quantity > 0);

      queryClient.setQueryData<Cart>(key, recompute(items));

      return { previous };
    },
    onError: rollbackOnError,
    onSettled: settle,
  });

  // --- Remover item -------------------------------------------------------
  const removeItem = useMutation({
    mutationFn: (variantId: string) => removeCartItem(variantId),
    async onMutate(variantId) {
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<Cart>(key);

      const base = previous ?? EMPTY_CART;

      const items = base.items.filter((it) => it.variantId !== variantId);

      queryClient.setQueryData<Cart>(key, recompute(items));

      return { previous };
    },
    onError: rollbackOnError,
    onSettled: settle,
  });

  return { addItem, setQuantity, removeItem };
}
