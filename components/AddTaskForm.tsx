import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

export interface TaskFormSubmitData {
  name: string;
  description: string | null;
  priority: string | null;
  dueDate: string | null;
}

interface TaskFormData {
  name: string;
  description: string;
  priority: string;
  dueDate: Date | null;
}

interface AddTaskFormProps {
  onAdd: (payload: TaskFormSubmitData) => void;
  onCancel: () => void;
  defaultDueDate?: Date;
}

function roundUpToNextHour(date?: Date): Date {
  const d = date ? new Date(date) : new Date();
  if (d.getMinutes() > 0 || d.getSeconds() > 0 || d.getMilliseconds() > 0) {
    d.setHours(d.getHours() + 1);
  }
  d.setMinutes(0, 0, 0);
  return d;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({
  onAdd,
  onCancel,
  defaultDueDate,
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    name: '',
    description: '',
    priority: '2',
    dueDate: roundUpToNextHour(defaultDueDate),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const updateField = <K extends keyof TaskFormData>(
    key: K,
    value: TaskFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const formatDateDisplay = (date: Date | null): string => {
    if (!date) return 'No date selected';
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    const payload: TaskFormSubmitData = {
      name: formData.name,
      description: formData.description || null,
      priority: formData.priority || null,
      dueDate: formData.dueDate
        ? formData.dueDate.toLocaleDateString('sv-SE')
        : null,
    };

    onAdd(payload);
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Name *"
        value={formData.name}
        onChangeText={(v) => updateField('name', v)}
        mode="outlined"
        style={styles.input}
        autoFocus
      />

      <TextInput
        label="Description"
        value={formData.description}
        onChangeText={(v) => updateField('description', v)}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      <Text variant="labelLarge" style={styles.label}>
        Priority
      </Text>
      <SegmentedButtons
        value={formData.priority}
        onValueChange={(v) => updateField('priority', v)}
        buttons={[
          { value: '1', label: 'High' },
          { value: '2', label: 'Medium' },
          { value: '3', label: 'Low' },
        ]}
        style={styles.segmented}
      />

      <Text variant="labelLarge" style={styles.label}>
        Due Date
      </Text>
      <Button
        mode="outlined"
        onPress={() => setShowDatePicker(true)}
        style={styles.dateButton}
        icon="calendar"
      >
        {formatDateDisplay(formData.dueDate)}
      </Button>

      {showDatePicker && (
        <DateTimePicker
          value={formData.dueDate ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selectedDate) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (selectedDate) {
              updateField('dueDate', selectedDate);
            }
            if (Platform.OS === 'android') {
              setShowDatePicker(false);
            }
          }}
          minimumDate={new Date()}
        />
      )}

      <View style={styles.buttons}>
        <Button mode="outlined" onPress={onCancel} style={styles.button}>
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
          disabled={!formData.name.trim()}
        >
          Add Task
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  input: {
    marginBottom: 4,
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
    color: '#374151',
  },
  segmented: {
    marginBottom: 4,
  },
  dateButton: {
    marginBottom: 4,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  button: {
    minWidth: 100,
  },
});

export default AddTaskForm;
