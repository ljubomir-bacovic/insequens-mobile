import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, Modal, Portal, Surface, Text } from 'react-native-paper';
import TaskCard from '@/components/TaskCard';
import ToDoItemDetails from '@/components/ToDoItemDetails';
import { ToDoItem } from '@/contexts/TasksContext';
import { useTasks } from '@/hooks/useTasks';

// Keep details mounted through the paper modal exit transition before cleanup.
const MODAL_EXIT_CLEANUP_DELAY_MS = 250;

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
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const { tasks: contextTasks, updateTask, toggleTaskCompletion } = useTasks();

  // Look up the selected item from the full context task list rather than the
  // filtered `tasks` prop so the modal stays populated even when the task is
  // updated and filtered out of the current view (e.g. due date changed).
  const selectedItem = selectedItemId
    ? (contextTasks.find((t) => t.id === selectedItemId) ?? null)
    : null;

  const handleItemClick = (id: string) => {
    setSelectedItemId(id);
    setIsDetailsVisible(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsVisible(false);
  };

  useEffect(() => {
    if (isDetailsVisible) return;

    const timeoutId = setTimeout(() => {
      setSelectedItemId(null);
    }, MODAL_EXIT_CLEANUP_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [isDetailsVisible]);

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
          visible={isDetailsVisible}
          onDismiss={handleCloseDetails}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalContent} elevation={4}>
            <View style={styles.modalHeader}>
              <Text variant="titleMedium" style={styles.modalTitle}>
                Task Details
              </Text>
              <IconButton
                icon="close"
                size={20}
                onPress={handleCloseDetails}
                style={styles.closeButton}
              />
            </View>
            {selectedItem && (
              <ToDoItemDetails
                item={selectedItem}
                onDelete={async (id) => {
                  await onDeleteTask(id);
                  setIsDetailsVisible(false);
                }}
                onClose={handleCloseDetails}
                updateTask={updateTask}
                toggleTaskCompletion={toggleTaskCompletion}
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontWeight: '600',
  },
  closeButton: {
    margin: 0,
  },
});

export default TaskList;
