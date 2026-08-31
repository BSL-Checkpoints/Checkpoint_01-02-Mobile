/**
 * Tela de LOGIN. Usa o BACKEND (session.signIn -> /auth/login). Ao entrar, o
 * `isLoggedIn` da sessão vira true e a guarda de rotas (App.tsx) troca para o app —
 * a tela não navega na mão.
 */
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSession } from '@/session/session';
import { Button, TextField } from '@/components/ui';
import type { AuthStackParamList } from '@/navigation';
import type { ApiError } from '@/types/api';
import { BACKGROUND, COLORS } from '@/styles/style';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

export function SignInScreen({ navigation }: Props) {
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handle() {
    setBusy(true);
    setErro(null);
    try {
      await signIn(email.trim(), password);
      // Não navegamos: a guarda de rotas troca o stack sozinha ao logar.
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
        <Text style={styles.title}>Tech Lab</Text>
        <Text style={styles.subtitle}>Entre para continuar</Text>

        <View style={styles.card}>
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
            <TextField placeholder="sua senha" secureTextEntry value={password} onChangeText={setPassword} />
          </View>

          {erro && (
            <View style={styles.erroBox}>
              <Text style={styles.erro}>{erro}</Text>
            </View>
          )}

          <Button label={busy ? 'Entrando…' : 'Entrar'} onPress={handle} disabled={busy || !email || !password} />
          <Button label="Esqueci minha senha" variant="ghost" onPress={() => navigation.navigate('ForgotPassword')} />
        </View>

        <Button label="Criar uma conta" variant="ghost" onPress={() => navigation.navigate('SignUp')} />
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
  title: { fontSize: 26, fontWeight: '800', color: COLORS.black, textAlign: 'center' },
  subtitle: { fontSize: 14, color: COLORS.gray, textAlign: 'center', marginBottom: 12 },
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