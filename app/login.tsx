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

  const { setUser } = context;

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.brandBlock}>
          <Text style={styles.brandName}>ByeUnemployment 👋</Text>
          <Text style={styles.brandTagline}>Make your parents proud. Get a job</Text>
        </View>

        <Text style={styles.formTitle}>
          {isRegistering ? 'Create your account' : 'Welcome back'}
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.field}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            accessibilityLabel="Username"
            placeholder="Enter your username"
            placeholderTextColor="#94A3B8"
            value={username}
            onChangeText={(text) => { setUsername(text); setError(''); }}
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            accessibilityLabel="Password"
            placeholder="Enter your password"
            placeholderTextColor="#94A3B8"
            value={password}
            onChangeText={(text) => { setPassword(text); setError(''); }}
            secureTextEntry
            style={styles.input}
          />
        </View>

        <Pressable
          accessibilityLabel={isRegistering ? 'Register' : 'Login'}
          accessibilityRole="button"
          onPress={isRegistering ? handleRegister : handleLogin}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>
            {isRegistering ? 'Create Account' : 'Sign In'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityLabel="Switch between login and register"
          accessibilityRole="button"
          onPress={() => { setIsRegistering(!isRegistering); setError(''); }}
          style={styles.switchButton}
        >
          <Text style={styles.switchButtonText}>
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
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandBlock: {
    backgroundColor: '#1E3A5F',
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
    color: '#1A1A2E',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 18,
  },
  error: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderRadius: 4,
    borderWidth: 1,
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
    padding: 12,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#9CA3AF',
    borderRadius: 4,
    borderWidth: 1.5,
    color: '#1A1A2E',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#1E3A5F',
    borderRadius: 4,
    marginTop: 8,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
  },
  switchButtonText: {
    color: '#1E3A5F',
    fontSize: 14,
    fontWeight: '500',
  },
});