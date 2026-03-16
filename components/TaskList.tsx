import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Surface, Text } from 'react-native-paper';
import TaskCard from '@/components/TaskCard';
import ToDoItemDetails from '@/components/ToDoItemDetails';
import { ToDoItem } from '@/contexts/TasksContext';

interface TaskListProps {
  tasks: ToDoItem[];
  onUpdateStatus: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onUpdateStatus,
  onDeleteTask,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const handleItemClick = (id: string) => {
    setSelectedItemId(id);
  };

  const handleCloseDetails = () => {
    setSelectedItemId(null);
  };

  return (
    <>
      <View style={styles.list}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onItemClick={handleItemClick}
            onUpdateStatus={onUpdateStatus}
          />
        ))}
      </View>

      <Portal>
        <Modal
          visible={Boolean(selectedItemId)}
          onDismiss={handleCloseDetails}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalContent} elevation={4}>
            <Text variant="titleMedium" style={styles.modalTitle}>
              Task Details
            </Text>
            {selectedItemId && (
              <ToDoItemDetails
                itemId={selectedItemId}
                onDelete={async (id) => {
                  await onDeleteTask(id);
                  setSelectedItemId(null);
                }}
                onClose={handleCloseDetails}
              />
            )}
          </Surface>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: 4,
  },
  modalContainer: {
    margin: 16,
  },
  modalContent: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
  },
  modalTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
});

export default TaskList;
