import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Surface } from 'react-native-paper';
import AddTaskForm, { TaskFormSubmitData } from '@/components/AddTaskForm';

interface AddTaskSectionProps {
  onAddTask: (data: TaskFormSubmitData) => Promise<void>;
  defaultDueDate?: Date;
}

const AddTaskSection: React.FC<AddTaskSectionProps> = ({
  onAddTask,
  defaultDueDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = async (data: TaskFormSubmitData) => {
    await onAddTask(data);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      {!isOpen ? (
        <Button
          mode="text"
          icon="plus"
          onPress={() => setIsOpen(true)}
          style={styles.addButton}
        >
          Add task
        </Button>
      ) : (
        <Surface style={styles.formSurface} elevation={2}>
          <AddTaskForm
            onAdd={handleAdd}
            onCancel={() => setIsOpen(false)}
            defaultDueDate={defaultDueDate}
          />
        </Surface>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 8,
  },
  addButton: {
    alignSelf: 'flex-start',
  },
  formSurface: {
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
});

export default AddTaskSection;
