/**
 * Serviço de PRODUTOS (SEMANA 1). Funções puras que só falam com a API.
 * Nada de React aqui — os hooks da Semana 2 (useProducts/useProduct) chamam isto.
 */
import { http } from './http';
import type { Paginated, Product, ProductSummary } from '@/types/api';

export interface ListProductsParams {
  search?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
}

/** GET /products -> envelope paginado de resumos. */
export async function listProducts(params: ListProductsParams = {}): Promise<Paginated<ProductSummary>> {
  const { data } = await http.get<Paginated<ProductSummary>>('/products', { params });
  return data;
}

/** GET /products/:id -> produto detalhado (traz as variantes). */
export async function getProduct(id: string): Promise<Product> {
  const { data } = await http.get<Product>(`/products/${id}`);
  return data;
}
