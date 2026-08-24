/**
 * Serviço de CARRINHO (SEMANA 1). Todas as rotas exigem cliente logado
 * (o interceptor já injeta o Authorization). Sempre devolvem o Cart inteiro.
 */
import { http } from './http';
import type { Cart } from '@/types/api';

/** GET /cart */
export async function getCart(): Promise<Cart> {
  const { data } = await http.get<Cart>('/cart');
  return data;
}

/** POST /cart/items — adiciona por VARIANTE. */
export async function addCartItem(variantId: string, quantity: number): Promise<Cart> {
  const { data } = await http.post<Cart>('/cart/items', { variantId, quantity });
  return data;
}

/** PATCH /cart/items/:variantId — quantity 0 remove o item. */
export async function updateCartItem(variantId: string, quantity: number): Promise<Cart> {
  const { data } = await http.patch<Cart>(`/cart/items/${variantId}`, { quantity });
  return data;
}

/** DELETE /cart/items/:variantId */
export async function removeCartItem(variantId: string): Promise<Cart> {
  const { data } = await http.delete<Cart>(`/cart/items/${variantId}`);
  return data;
}
