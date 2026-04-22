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
      setError('User not found. Register first.');
      return;
    }

    if (results[0].password !== password) {
      setError('Incorrect password.');
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
      setError('Username already taken.');
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
        <Text style={styles.title}>Job Tracker</Text>
        <Text style={styles.subtitle}>
          {isRegistering ? 'Create your account' : 'Sign in to continue'}
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.field}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            accessibilityLabel="Username"
            placeholder="Enter username"
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
            placeholder="Enter password"
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
            {isRegistering ? 'Register' : 'Login'}
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
              ? 'Already have an account? Login'
              : "Don't have an account? Register"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F8FAFC',
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#0F766E',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 30,
    textAlign: 'center',
  },
  error: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderRadius: 10,
    borderWidth: 1,
    color: '#7F1D1D',
    fontSize: 14,
    marginBottom: 16,
    padding: 10,
    textAlign: 'center',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#0F766E',
    borderRadius: 10,
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
    color: '#0F766E',
    fontSize: 14,
    fontWeight: '500',
  },
});