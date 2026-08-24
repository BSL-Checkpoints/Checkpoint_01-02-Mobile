# Loja da Turma — (Semana 3: Checkout e Pedidos)

App fio-condutor com o **fluxo de compra completo**. Semana 1 = serviços Axios;
Semana 2 = TanStack Query + carrinho otimista; **Semana 3 = fechar o pedido**:
checkout → pagamento (simulado) → pedido → histórico. Roda no **Expo Go** (sem Firebase,
sem dev build).

## Rodar

```bash
npm install
cp .env.example .env      # API Key e RM do grupo (URL já é a nuvem)
npm start                 # leia o QR no Expo Go
```

## Autenticação (base, já pronta)

O app abre no **Login** (guarda de rotas). Auth é pelo **backend** (`/auth/login`,
`/auth/register`) — `session.tsx` guarda o `customerToken` e alimenta `isLoggedIn`.
Isso é a base; o foco da semana é o checkout.

## O fluxo da semana

```
Carrinho ──"Finalizar compra"──▶ Checkout ──POST /orders/checkout──▶ Pedido (PENDING)
                                                                        │
                              ┌── Pagar (PIX/Cartão/Boleto, simular ────┤
                              │   aprovar/recusar) POST /orders/:id/pay  │
                              ▼                                          ▼
                         Pedido PAID  ◀──────────────────────  (recusado: segue PENDING)
```

Histórico em **Pedidos** (`GET /orders`), detalhe + **linha do tempo**
(`GET /orders/:id/timeline`), e **cancelar** um pendente (`POST /orders/:id/cancel`).

## Mapa (novo da Semana 3 em **negrito**)

```
src/
  services/orders.ts       # **checkout / list / get / pay / cancel / timeline**
  lib/orders.ts            # **statusLabel / statusColor**
  hooks/
    useOrders.ts           # **useOrders / useOrder / useOrderTimeline (queries)**
    useOrderActions.ts     # **useCheckout / usePayOrder / useCancelOrder (mutations)**
  screens/
    CheckoutScreen.tsx     # **revisão + criar pedido**
    OrderScreen.tsx        # **status + pagamento simulado + timeline**
    OrdersScreen.tsx       # **histórico**
  ...                      # produtos/carrinho/auth = Semanas 1–2
```
