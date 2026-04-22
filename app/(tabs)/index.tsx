import ApplicationCard from '@/components/ApplicationCard';
import { Redirect, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext, Application } from '../_layout';

export default function IndexScreen() {
  const router = useRouter();
  const context = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  if (!context) return null;

  if (!context.user) {
    return <Redirect href="/login" />;
  }

  const { applications, categories } = context;
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const categoryOptions = [
    'All',
    ...categories.map((c) => c.name),
  ];

  const filteredApplications = applications.filter((app: Application) => {
    const matchesSearch =
      normalizedQuery.length === 0 ||
      app.company.toLowerCase().includes(normalizedQuery) ||
      app.role.toLowerCase().includes(normalizedQuery);

    const category = categories.find((c) => c.id === app.categoryId);
    const matchesCategory =
      selectedCategory === 'All' || category?.name === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Applications</Text>
        <Text style={styles.subtitle}>{applications.length} tracked</Text>
      </View>

      <Pressable
        accessibilityLabel="Add application"
        accessibilityRole="button"
        onPress={() => router.push('/add')}
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>Add Application</Text>
      </Pressable>

      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by company or role"
        style={styles.searchInput}
        accessibilityLabel="Search applications"
      />

      <View style={styles.filterRow}>
        {categoryOptions.map((name) => {
          const isSelected = selectedCategory === name;
          return (
            <Pressable
              key={name}
              accessibilityLabel={`Filter by ${name}`}
              accessibilityRole="button"
              onPress={() => setSelectedCategory(name)}
              style={[
                styles.filterButton,
                isSelected && styles.filterButtonSelected,
              ]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  isSelected && styles.filterButtonTextSelected,
                ]}
              >
                {name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredApplications.length === 0 ? (
          <Text style={styles.emptyText}>No applications match your filters</Text>
        ) : (
          filteredApplications.map((app: Application) => (
            <ApplicationCard key={app.id} application={app} />
          ))
        )}
      </ScrollView>
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
  header: {
    marginBottom: 16,
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
  addButton: {
    alignItems: 'center',
    backgroundColor: '#0F766E',
    borderRadius: 10,
    marginBottom: 14,
    paddingVertical: 11,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#94A3B8',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#94A3B8',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterButtonSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextSelected: {
    color: '#FFFFFF',
  },
  emptyText: {
    color: '#475569',
    fontSize: 16,
    paddingTop: 8,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 14,
  },
});