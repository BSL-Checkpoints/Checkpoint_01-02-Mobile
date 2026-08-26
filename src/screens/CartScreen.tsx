/**
 * Tela do CARRINHO (SEMANA 3).
 * O login é GLOBAL (guarda de rotas). O botão "Finalizar" agora leva ao CHECKOUT.
 * useCart + mutations otimistas seguem iguais à Semana 2.
 */
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View, TextInput, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCart } from '@/hooks/useCart';
import { useCartMutations } from '@/hooks/useCartMutations';
import { useSession } from '@/session/session';
import { money } from '@/lib/format';
import { Button, ErrorState, Loading } from '@/components/ui';
import type { RootStackParamList } from '@/navigation';

// Importando os tipos e o serviço criado para não violar os requisitos RNF-01 e RF-02 do CP4
import type { ApiError, ShippingOption } from '@/types/api';
import { getShippingQuote } from '@/services/shipping'; 

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export function CartScreen({ navigation }: Props) {
  const { data: cart, isLoading, isError, error, refetch } = useCart();
  const { setQuantity, removeItem } = useCartMutations();
  const { customer, signOut } = useSession();

  // Estados do frete com tipagem estrita
  const [cep, setCep] = useState('');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[] | null>(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);

  // Função para chamar a cotação
  const handleQuoteShipping = async () => {
    if (!cep || cep.length < 8) {
      Alert.alert('Atenção', 'Por favor, digite um CEP válido.');
      return;
    }

    setIsLoadingShipping(true);
    setShippingOptions(null);

    try {
      // Retiramos o orderId para testar se a API aceita cotar direto no carrinho
      const payload = {
        cepDestino: cep,
        items: (cart?.items ?? []).map((item) => ({
          weightGr: 500, // Peso fictício, caso a API exija e o backend não retorne
          quantity: item.quantity,
        })),
      };

      // Chamada usando o serviço centralizado (RF-02)
      const options = await getShippingQuote(payload);
      setShippingOptions(options);
    } catch (err) {
      // Tipagem do erro capturado (RNF-01)
      const apiError = err as ApiError;
      Alert.alert('Erro ao cotar frete', apiError.message || 'Verifique o CEP digitado.');
    } finally {
      setIsLoadingShipping(false);
    }
  };

  if (isLoading) return <Loading label="Carregando carrinho…" />;
  if (isError) return <ErrorState message={(error as ApiError).message} onRetry={() => refetch()} />;

  const items = cart?.items ?? [];

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.variantId}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.hi}>
            Olá, {customer?.name}. {items.length ? '' : 'Seu carrinho está vazio.'}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.sub}>
                {money(item.unitPrice)} · subtotal {money(item.subtotal)}
              </Text>
            </View>
            <View style={styles.qtyBox}>
              <Text
                style={styles.qtyBtn}
                onPress={() => setQuantity.mutate({ variantId: item.variantId, quantity: item.quantity - 1 })}
              >
                −
              </Text>
              <Text style={styles.qty}>{item.quantity}</Text>
              <Text
                style={styles.qtyBtn}
                onPress={() => setQuantity.mutate({ variantId: item.variantId, quantity: item.quantity + 1 })}
              >
                +
              </Text>
            </View>
            <Text style={styles.remove} onPress={() => removeItem.mutate(item.variantId)}>
              remover
            </Text>
          </View>
        )}
        ListFooterComponent={
          items.length ? (
            <View style={styles.footer}>
              {/* --- INÍCIO DA SEÇÃO DE FRETE --- */}
              <View style={styles.shippingContainer}>
                <Text style={styles.shippingTitle}>Calcular Frete</Text>
                <View style={styles.shippingRow}>
                  <TextInput
                    style={styles.cepInput}
                    placeholder="00000-000"
                    value={cep}
                    onChangeText={setCep}
                    keyboardType="numeric"
                    maxLength={9}
                  />
                  <Button
                    label={isLoadingShipping ? '...' : 'Cotar'}
                    onPress={handleQuoteShipping}
                  />
                </View>

                {/* Exibição dos resultados */}
                {shippingOptions && shippingOptions.length > 0 && (
                  <View style={styles.shippingResultBox}>
                    {shippingOptions.map((opcao: ShippingOption, index: number) => (
                      <View key={index} style={styles.shippingOptionRow}>
                        <Text style={styles.shippingName}>
                          {opcao.name} ({opcao.deliveryDays} dias)
                        </Text>
                        <Text style={styles.shippingPrice}>{money(opcao.price)}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              {/* --- FIM DA SEÇÃO DE FRETE --- */}

              <Text style={styles.total}>Total: {money(cart?.total ?? 0)}</Text>
              <Button label="Finalizar compra" onPress={() => navigation.navigate('Checkout')} />
            </View>
          ) : null
        }
      />
      <View style={styles.signout}>
        <Button label="Sair" variant="ghost" onPress={signOut} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 12, gap: 10 },
  hi: { fontSize: 14, color: '#374151', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f9fafb', borderRadius: 12, padding: 10 },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  sub: { fontSize: 12, color: '#6b7280' },
  qtyBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: { fontSize: 20, fontWeight: '700', color: '#111827', paddingHorizontal: 6 },
  qty: { fontSize: 15, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  remove: { fontSize: 12, color: '#b91c1c', marginLeft: 6 },
  footer: { marginTop: 16, gap: 10 },
  total: { fontSize: 18, fontWeight: '800', color: '#111827', textAlign: 'right', marginTop: 10 },
  signout: { padding: 12 },
  
  // Estilos da área de frete
  shippingContainer: { backgroundColor: '#f3f4f6', padding: 12, borderRadius: 12, marginBottom: 10 },
  shippingTitle: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  shippingRow: { flexDirection: 'row', gap: 8 },
  cepInput: { flex: 1, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#d1d5db', height: 44 },
  shippingResultBox: { marginTop: 12, gap: 6, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 10 },
  shippingOptionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shippingName: { fontSize: 14, color: '#4b5563' },
  shippingPrice: { fontSize: 14, fontWeight: '700', color: '#111827' },
});