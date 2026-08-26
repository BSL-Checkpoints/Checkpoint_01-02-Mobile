import { http } from './http'; 
import type { ShippingOption, ShippingQuoteRequest } from '@/types/api';

export async function getShippingQuote(data: ShippingQuoteRequest): Promise<ShippingOption[]> {
  const response = await http.post<ShippingOption[]>('/sandbox/shipping/quote', data);
  return response.data;
}