import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import FormField from '../components/ui/form-field';

describe('FormField', () => {
  it('renders the label and fires onChangeText', () => {
    const onChangeText = jest.fn();
    const { getByLabelText } = render(
      <FormField label="Company" value="" onChangeText={onChangeText} />
    );

    const input = getByLabelText('Company');
    expect(input).toBeTruthy();

    fireEvent(input, 'changeText', 'Google');
    expect(onChangeText).toHaveBeenCalledWith('Google');
  });

  it('renders with a custom placeholder', () => {
    const { getByLabelText } = render(
      <FormField label="Role" value="" onChangeText={jest.fn()} placeholder="e.g. Software Engineer" />
    );

    const input = getByLabelText('Role');
    expect(input).toBeTruthy();
  });
});