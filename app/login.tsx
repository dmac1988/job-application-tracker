import { db } from '@/db/client';
import { users as usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from './_layout';

export default function LoginScreen() {
  const router = useRouter();
  const context = useContext(AppContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  if (!context) return null;

  const { setUser, colors } = context;

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please fill in both fields.');
      return;
    }

    const results = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username.trim()));

    if (results.length === 0) {
      setError('No account with that username. Try registering instead.');
      return;
    }

    if (results[0].password !== password) {
      setError('Incorrect password. Please try again.');
      return;
    }

    setUser(results[0]);
    router.replace('/(tabs)');
  };

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please fill in both fields.');
      return;
    }

    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username.trim()));

    if (existing.length > 0) {
      setError('That username is taken. Pick another one.');
      return;
    }

    await db.insert(usersTable).values({
      username: username.trim(),
      password,
    });

    const results = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username.trim()));

    setUser(results[0]);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={[styles.brandBlock, { backgroundColor: colors.primary }]}>
          <Text style={styles.brandName}>ByeUnemployment 👋</Text>
          <Text style={styles.brandTagline}>Your job search, sorted.</Text>
        </View>

        <Text style={[styles.formTitle, { color: colors.text }]}>
          {isRegistering ? 'Create your account' : 'Welcome back'}
        </Text>

        {error ? <Text style={[styles.error, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder, color: colors.danger }]}>{error}</Text> : null}

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Username</Text>
          <TextInput
            accessibilityLabel="Username"
            placeholder="Enter your username"
            placeholderTextColor={colors.textSecondary}
            value={username}
            onChangeText={(text) => { setUsername(text); setError(''); }}
            autoCapitalize="none"
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Password</Text>
          <TextInput
            accessibilityLabel="Password"
            placeholder="Enter your password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={(text) => { setPassword(text); setError(''); }}
            secureTextEntry
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
          />
        </View>

        <Pressable
          accessibilityLabel={isRegistering ? 'Register' : 'Login'}
          accessibilityRole="button"
          onPress={isRegistering ? handleRegister : handleLogin}
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>
            {isRegistering ? 'Create Account' : 'Sign In'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityLabel="Switch between login and register"
          accessibilityRole="button"
          onPress={() => { setIsRegistering(!isRegistering); setError(''); }}
          style={styles.switchButton}
        >
          <Text style={[styles.switchButtonText, { color: colors.primary }]}>
            {isRegistering
              ? 'Already have an account? Sign in'
              : "New here? Create an account"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandBlock: {
    borderRadius: 4,
    marginBottom: 28,
    padding: 24,
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  brandTagline: {
    color: '#94B8DB',
    fontSize: 14,
    marginTop: 6,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 18,
  },
  error: {
    borderRadius: 4,
    borderWidth: 1,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
    padding: 12,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderRadius: 4,
    borderWidth: 1.5,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 4,
    marginTop: 8,
    paddingVertical: 14,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
  },
  switchButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});