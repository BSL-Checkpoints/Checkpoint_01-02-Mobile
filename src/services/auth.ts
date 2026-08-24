/**
 * Serviço de AUTENTICAÇÃO do cliente final (comprador da loja).
 * Login/registro devolvem { token, customer }. Guardar o token é responsabilidade
 * da sessão (src/session/session.ts), não deste arquivo.
 */
import { http } from './http';
import type { AuthResponse } from '@/types/api';

/** POST /auth/login */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

/** POST /auth/register */
export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>('/auth/register', { name, email, password });
  return data;
}

/** POST /auth/forgot-password — pede um código de redefinição (chega no e-mail). */
export async function forgotPassword(email: string): Promise<void> {
  await http.post('/auth/forgot-password', { email });
}

/** POST /auth/reset-password — redefine a senha com o código. */
export async function resetPassword(email: string, code: string, newPassword: string): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>('/auth/reset-password', { email, code, newPassword });
  return data;
}
