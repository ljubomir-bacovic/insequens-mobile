import React, { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useTasks } from '@/hooks/useTasks';
import TaskList from '@/components/TaskList';
import NoTasksState from '@/components/NoTasksState';
import { ToDoItem } from '@/contexts/TasksContext';

function isOverdue(dueDate?: string) {
  if (!dueDate) return false;
  const today = new Date().toLocaleDateString('sv-SE');
  return dueDate < today;
}

export default function OverdueScreen() {
  const { tasks, toggleTaskCompletion, deleteTask, isLoading } = useTasks();

  const overdue = useMemo(
    () => tasks.filter((t: ToDoItem) => t.dueDate && !t.isCompleted && isOverdue(t.dueDate)),
    [tasks]
  );

  if (isLoading) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {overdue.length > 0 ? (
        <TaskList
          tasks={overdue}
          onUpdateStatus={toggleTaskCompletion}
          onDeleteTask={deleteTask}
        />
      ) : (
        <NoTasksState message="Congratulations! You have no overdue tasks. You are really achieving peace of mind!" />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
});
