import { StyleSheet, Text, TextInput, View } from 'react-native';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export default function FormField({ label, value, onChangeText, placeholder }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholder={placeholder ?? label}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
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
});