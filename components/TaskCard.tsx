import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import PriorityCheckbox from '@/components/PriorityCheckbox';
import { formatDate } from '@/utils/dateUtils';
import { ToDoItem } from '@/contexts/TasksContext';

interface TaskCardProps {
  task: ToDoItem;
  onItemClick: (id: string) => void;
  onUpdateStatus: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onItemClick, onUpdateStatus }) => {
  const isCompleted = Boolean(task.isCompleted);

  const formattedDueDate = formatDate(task.dueDate, {
    format: 'short',
    useWords: true,
  });

  return (
    <TouchableOpacity
      onPress={() => onItemClick(task.id)}
      activeOpacity={0.7}
    >
      <Surface
        style={[
          styles.surface,
          { backgroundColor: isCompleted ? '#f9fafb' : '#fff' },
        ]}
        elevation={1}
      >
        <View style={styles.row}>
          <PriorityCheckbox
            checked={task.isCompleted}
            onChange={() => onUpdateStatus(task.id)}
            priority={task.priority}
            isCompleted={task.isCompleted}
          />

          <View style={styles.textContainer}>
            <Text
              variant="bodyMedium"
              numberOfLines={1}
              style={[
                styles.taskName,
                {
                  textDecorationLine: isCompleted ? 'line-through' : 'none',
                  color: isCompleted ? '#9CA3AF' : '#111827',
                },
              ]}
            >
              {task.name}
            </Text>

            <Text variant="bodySmall" style={styles.dueDate}>
              {task.dueDate ? formattedDueDate : 'No due date'}
            </Text>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  surface: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textContainer: {
    flex: 1,
  },
  taskName: {
    fontWeight: '600',
  },
  dueDate: {
    color: '#6b7280',
    marginTop: 2,
  },
});

export default TaskCard;
