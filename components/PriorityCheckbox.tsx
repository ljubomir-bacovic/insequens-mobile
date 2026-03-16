import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Checkbox } from 'react-native-paper';

interface PriorityCheckboxProps {
  checked?: boolean;
  onChange: () => void;
  priority?: number | null;
  isCompleted?: boolean;
}

const getPriorityColor = (priority: number | null | undefined): string => {
  switch (priority) {
    case 1:
      return '#ef4444'; // red
    case 2:
      return '#6b7280'; // grey
    case 3:
      return '#3b82f6'; // blue
    default:
      return '#9ca3af'; // gray
  }
};

const PriorityCheckbox: React.FC<PriorityCheckboxProps> = ({
  checked,
  onChange,
  priority,
  isCompleted,
}) => {
  const color = getPriorityColor(priority);

  return (
    <TouchableOpacity onPress={onChange} style={styles.container}>
      <View style={[styles.checkboxWrapper, { borderColor: color }]}>
        <Checkbox
          status={checked || isCompleted ? 'checked' : 'unchecked'}
          onPress={onChange}
          color={color}
          uncheckedColor={color}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0,
  },
});

export default PriorityCheckbox;
