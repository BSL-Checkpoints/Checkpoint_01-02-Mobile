/**
 * Tela de CHECKOUT (SEMANA 3) — revisão + criar o pedido.
 * Confirma o carrinho, chama POST /orders/checkout (pedido vira PENDING) e leva
 * para a tela do pedido, onde o pagamento acontece.
 */
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useOrderActions';
import { money } from '@/lib/format';
import { Button, ErrorState, Loading } from '@/components/ui';
import type { RootStackParamList } from '@/navigation';
import type { ApiError } from '@/types/api';
import { BACKGROUND, COLORS } from '@/styles/style';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export function CheckoutScreen({ navigation }: Props) {
  const { data: cart, isLoading, isError, error, refetch } = useCart();
  const checkout = useCheckout();

  if (isLoading) return <Loading label="Carregando carrinho…" />;
  if (isError) return <ErrorState message={(error as ApiError).message} onRetry={() => refetch()} />;

  const items = cart?.items ?? [];
  const vazio = items.length === 0;

  function confirmar() {
    checkout.mutate(undefined, {
      // Ao criar o pedido, substituímos a tela de checkout pela do pedido
      // (replace: não dá pra "voltar" para um carrinho que já virou pedido).
      onSuccess: (order) => navigation.replace('Order', { id: order.id }),
    });
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.variantId}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <Text style={styles.h}>Revise seu pedido</Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>Seu carrinho está vazio.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.qtyBadge}>
              <Text style={styles.qtyBadgeText}>{item.quantity}×</Text>
            </View>
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.sub}>{money(item.subtotal)}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.total}>{money(cart?.total ?? 0)}</Text>
        </View>
        {checkout.isError && (
          <Text style={styles.erro}>{(checkout.error as ApiError).message}</Text>
        )}
        <Button
          label={checkout.isPending ? 'Criando pedido…' : 'Confirmar pedido'}
          onPress={confirmar}
          disabled={vazio || checkout.isPending}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BACKGROUND.backgorundMain },
  list: { padding: 16, paddingBottom: 8, gap: 10 },
  headerBlock: { marginBottom: 4 },
  eyebrow: { fontSize: 12, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 1 },
  h: { fontSize: 22, fontWeight: '800', color: COLORS.black, marginTop: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  qtyBadge: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  qtyBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  name: { flex: 1, fontSize: 14, color: COLORS.black },
  sub: { fontSize: 14, fontWeight: '700', color: COLORS.black },
  empty: { color: COLORS.gray, textAlign: 'center', marginTop: 24 },
  footer: {
    padding: 20,
    gap: 10,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, color: COLORS.gray },
  total: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  erro: { color: '#b91c1c', fontSize: 13 },
});