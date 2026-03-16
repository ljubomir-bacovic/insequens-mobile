import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useTasks } from '@/hooks/useTasks';
import { useAddTask } from '@/hooks/useAddTask';
import TaskList from '@/components/TaskList';
import AddTaskSection from '@/components/AddTaskSection';
import NoTasksState from '@/components/NoTasksState';
import { ToDoItem } from '@/contexts/TasksContext';
import { parseDate, formatDate } from '@/utils/dateUtils';

function isToday(dateString?: string) {
  if (!dateString) return false;
  const date = parseDate(dateString);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function isOverdue(dueDate?: string) {
  if (!dueDate) return false;
  const today = new Date().toLocaleDateString('sv-SE');
  return dueDate < today;
}

export default function TodayScreen() {
  const { tasks, toggleTaskCompletion, deleteTask, isLoading } = useTasks();
  const { handleAddTask, error } = useAddTask();
  const [showOverdue, setShowOverdue] = useState(true);
  const today = new Date();

  const overdueTasks = useMemo(
    () => tasks.filter((t: ToDoItem) => t.dueDate && !t.isCompleted && isOverdue(t.dueDate)),
    [tasks]
  );

  const todayTasks = useMemo(
    () => tasks.filter((t: ToDoItem) => isToday(t.dueDate) && !t.isCompleted),
    [tasks]
  );

  const todayDoneTasks = useMemo(
    () => tasks.filter((t: ToDoItem) => isToday(t.dueDate) && t.isCompleted),
    [tasks]
  );

  if (isLoading) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {overdueTasks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Button
              mode="text"
              icon={showOverdue ? 'chevron-up' : 'chevron-down'}
              onPress={() => setShowOverdue((p) => !p)}
              compact
            >
              Overdue
            </Button>
          </View>
          {showOverdue && (
            <TaskList
              tasks={overdueTasks}
              onUpdateStatus={toggleTaskCompletion}
              onDeleteTask={deleteTask}
            />
          )}
        </View>
      )}

      <Text variant="titleMedium" style={styles.dateHeader}>
        {formatDate(today.toLocaleDateString('sv-SE'))} — Today
      </Text>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {todayTasks.length > 0 ? (
        <TaskList
          tasks={todayTasks}
          onUpdateStatus={toggleTaskCompletion}
          onDeleteTask={deleteTask}
        />
      ) : todayDoneTasks.length > 0 && overdueTasks.length === 0 ? (
        <NoTasksState message="Looks like you're done with all your tasks for today!" />
      ) : overdueTasks.length === 0 ? (
        <NoTasksState message="No tasks for today. Add a new task to start planning your day!" />
      ) : null}

      <AddTaskSection onAddTask={handleAddTask} defaultDueDate={today} />
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
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateHeader: {
    marginBottom: 12,
    color: '#374151',
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#dc2626',
  },
});
