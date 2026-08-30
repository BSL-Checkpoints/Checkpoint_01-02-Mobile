/**
 * Tela de CADASTRO. Usa o BACKEND (session.signUp -> /auth/register). Ao cadastrar,
 * a guarda de rotas leva para o app automaticamente.
 */
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSession } from '@/session/session';
import { Button, TextField } from '@/components/ui';
import type { AuthStackParamList } from '@/navigation';
import type { ApiError } from '@/types/api';
import { BACKGROUND, COLORS } from '@/styles/style';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export function SignUpScreen({ navigation }: Props) {
  const { signUp } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handle() {
    setBusy(true);
    setErro(null);
    try {
      await signUp(name.trim(), email.trim(), password);
    } catch (e) {
      setErro((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <View style={styles.container}>
        <View style={styles.logoBubble}>
          <Text style={styles.logoText}>TL</Text>
        </View>
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>Leva menos de um minuto</Text>

        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>Nome</Text>
            <TextField placeholder="Seu nome completo" autoCapitalize="words" value={name} onChangeText={setName} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>E-mail</Text>
            <TextField
              placeholder="voce@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>
            <TextField
              placeholder="mín. 6 caracteres"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {erro && (
            <View style={styles.erroBox}>
              <Text style={styles.erro}>{erro}</Text>
            </View>
          )}

          <Button
            label={busy ? 'Criando…' : 'Cadastrar'}
            onPress={handle}
            disabled={busy || !name || !email || password.length < 6}
          />
        </View>

        <Button label="Já tenho conta" variant="ghost" onPress={() => navigation.navigate('SignIn')} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: BACKGROUND.backgorundMain },
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 10 },
  logoBubble: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  logoText: { color: COLORS.white, fontSize: 18, fontWeight: '800' },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.black, textAlign: 'center' },
  subtitle: { fontSize: 13, color: COLORS.gray, textAlign: 'center', marginBottom: 12 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 6,
  },
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: '600', color: COLORS.gray },
  erroBox: { backgroundColor: '#fee2e2', borderRadius: 10, padding: 10 },
  erro: { color: '#b91c1c', fontSize: 13, textAlign: 'center' },
});