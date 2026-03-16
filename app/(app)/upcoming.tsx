import React, { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useTasks } from '@/hooks/useTasks';
import { useAddTask } from '@/hooks/useAddTask';
import TaskList from '@/components/TaskList';
import AddTaskSection from '@/components/AddTaskSection';
import NoTasksState from '@/components/NoTasksState';
import { ToDoItem } from '@/contexts/TasksContext';
import { parseDate } from '@/utils/dateUtils';

function isUpcoming(dueDate?: string) {
  if (!dueDate) return false;
  const date = parseDate(dueDate);
  const now = new Date();
  return date > now;
}

export default function UpcomingScreen() {
  const { tasks, toggleTaskCompletion, deleteTask, isLoading } = useTasks();
  const { handleAddTask } = useAddTask();

  const upcoming = useMemo(
    () => tasks.filter((t: ToDoItem) => t.dueDate && !t.isCompleted && isUpcoming(t.dueDate)),
    [tasks]
  );

  if (isLoading) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {upcoming.length > 0 ? (
        <TaskList
          tasks={upcoming}
          onUpdateStatus={toggleTaskCompletion}
          onDeleteTask={deleteTask}
        />
      ) : (
        <NoTasksState
          message="You have no upcoming tasks! Start making plans by creating some tasks!"
          image={require('@/assets/images/organize.jpg')}
        />
      )}
      <AddTaskSection defaultDueDate={new Date()} onAddTask={handleAddTask} />
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
