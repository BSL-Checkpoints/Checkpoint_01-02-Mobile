/**
 * Tela de HISTÓRICO de pedidos (SEMANA 3). Lista via useQuery e navega ao detalhe.
 */
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useOrders } from '@/hooks/useOrders';
import { statusColor, statusLabel } from '@/lib/orders';
import { money } from '@/lib/format';
import { Badge, ErrorState, Loading } from '@/components/ui';
import type { RootStackParamList } from '@/navigation';
import type { ApiError } from '@/types/api';
import { BACKGROUND, COLORS } from '@/styles/style';

type Props = NativeStackScreenProps<RootStackParamList, 'Orders'>;

export function OrdersScreen({ navigation }: Props) {
  const { data, isLoading, isError, error, refetch, isFetching } = useOrders();

  if (isLoading) return <Loading label="Carregando pedidos…" />;
  if (isError) return <ErrorState message={(error as ApiError).message} onRetry={() => refetch()} />;

  return (
    <FlatList
      style={styles.container}
      data={data ?? []}
      keyExtractor={(o) => o.id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={() => refetch()} tintColor={COLORS.primary} />}
      ListHeaderComponent={
        <View style={styles.headerBlock}>
          <Text style={styles.h}>Meus pedidos</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>Você ainda não fez pedidos.</Text>}
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => navigation.navigate('Order', { id: item.id })}>
          <View style={styles.iconBubble}>
            <Text style={styles.iconBubbleText}>📦</Text>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.top}>
              <Text style={styles.pedido}>Pedido #{item.id.slice(-6)}</Text>
              <Badge label={statusLabel(item.status)} color={statusColor(item.status)} />
            </View>
            <Text style={styles.sub}>
              {item.items.length} {item.items.length === 1 ? 'item' : 'itens'} · {money(item.total)}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BACKGROUND.backgorundMain },
  list: { padding: 16, gap: 10 },
  headerBlock: { marginBottom: 4 },
  eyebrow: { fontSize: 12, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 1 },
  h: { fontSize: 22, fontWeight: '800', color: COLORS.black, marginTop: 2, marginBottom: 6 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBubbleText: { fontSize: 20 },
  cardBody: { flex: 1, gap: 4 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pedido: { fontSize: 15, fontWeight: '700', color: COLORS.black },
  sub: { fontSize: 13, color: COLORS.gray },
  chevron: { fontSize: 22, color: COLORS.gray },
  empty: { color: COLORS.gray, textAlign: 'center', marginTop: 40 },
});