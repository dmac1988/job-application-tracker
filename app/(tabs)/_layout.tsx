import { Tabs, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerRight: () => (
          <Pressable
            accessibilityLabel="Open settings"
            accessibilityRole="button"
            onPress={() => router.push('/settings')}
            style={styles.settingsButton}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Applications' }}
      />
      <Tabs.Screen
        name="insights"
        options={{ title: 'Insights' }}
      />
      <Tabs.Screen
        name="targets"
        options={{ title: 'Targets' }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  settingsButton: {
    marginRight: 14,
    padding: 4,
  },
  settingsIcon: {
    fontSize: 22,
  },
});