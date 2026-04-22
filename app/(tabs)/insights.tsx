import { useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../_layout';

export default function InsightsScreen() {
  const context = useContext(AppContext);

  if (!context) return null;

  const { applications } = context;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.title}>Insights</Text>
      <Text style={styles.subtitle}>{applications.length} applications tracked</Text>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Charts coming next...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F8FAFC',
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 4,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  placeholderText: {
    color: '#6B7280',
    fontSize: 16,
  },
});