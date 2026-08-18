import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addCartItem,
  removeCartItem,
  updateCartItem,
} from '@/services/cart';
import type { Cart } from '@/types/api';

const EMPTY_CART: Cart = {
  id: 'optimistic',
  items: [],
  total: 0,
  itemCount: 0,
};

function recompute(items: Cart['items']): Cart {
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: EMPTY_CART.id,
    items,
    total,
    itemCount,
  };
}

export function useCartMutations() {
  const queryClient = useQueryClient();
  const key = ['cart'];

  const addItem = useMutation({
    mutationFn: (value: {
      variantId: string;
      quantity: number;
      name: string;
      unitPrice: number;
    }) => addCartItem(value.variantId, value.quantity),

    async onMutate(value) {
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<Cart>(key);
      const base = previous ?? EMPTY_CART;

      const existing = base.items.find(
        (item) => item.variantId === value.variantId
      );

      const items = existing
        ? base.items.map((item) =>
            item.variantId === value.variantId
              ? {
                  ...item,
                  quantity: item.quantity + value.quantity,
                  subtotal:
                    item.unitPrice *
                    (item.quantity + value.quantity),
                }
              : item
          )
        : [
            ...base.items,
            {
              variantId: value.variantId,
              name: value.name,
              sku: '',
              unitPrice: value.unitPrice,
              quantity: value.quantity,
              subtotal: value.unitPrice * value.quantity,
            },
          ];

      queryClient.setQueryData<Cart>(
        key,
        recompute(items)
      );

      return { previous };
    },

    onError(_error, _value, context) {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },

    onSettled() {
      queryClient.invalidateQueries({
        queryKey: key,
      });
    },
  });

  const setQuantity = useMutation({
    mutationFn: (value: {
      variantId: string;
      quantity: number;
    }) =>
      updateCartItem(
        value.variantId,
        value.quantity
      ),

    async onMutate(value) {
      await queryClient.cancelQueries({
        queryKey: key,
      });

      const previous = queryClient.getQueryData<Cart>(key);
      const base = previous ?? EMPTY_CART;

      const items = base.items
        .map((item) =>
          item.variantId === value.variantId
            ? {
                ...item,
                quantity: value.quantity,
                subtotal:
                  item.unitPrice * value.quantity,
              }
            : item
        )
        .filter((item) => item.quantity > 0);

      queryClient.setQueryData<Cart>(
        key,
        recompute(items)
      );

      return { previous };
    },

    onError(_error, _value, context) {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },

    onSettled() {
      queryClient.invalidateQueries({
        queryKey: key,
      });
    },
  });

  const removeItem = useMutation({
    mutationFn: (variantId: string) =>
      removeCartItem(variantId),

    async onMutate(variantId) {
      await queryClient.cancelQueries({
        queryKey: key,
      });

      const previous = queryClient.getQueryData<Cart>(key);
      const base = previous ?? EMPTY_CART;

      const items = base.items.filter(
        (item) => item.variantId !== variantId
      );

      queryClient.setQueryData<Cart>(
        key,
        recompute(items)
      );

      return { previous };
    },

    onError(_error, _variantId, context) {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },

    onSettled() {
      queryClient.invalidateQueries({
        queryKey: key,
      });
    },
  });

  return {
    addItem,
    setQuantity,
    removeItem,
  };
}