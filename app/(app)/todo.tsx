import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Checkbox, Button, ActivityIndicator } from 'react-native-paper';
import { useTasks } from '@/hooks/useTasks';
import { useAddTask } from '@/hooks/useAddTask';
import TaskList from '@/components/TaskList';
import AddTaskSection from '@/components/AddTaskSection';
import NoTasksState from '@/components/NoTasksState';

export default function TodoScreen() {
  const {
    tasks,
    loadMoreCompleted,
    toggleTaskCompletion,
    isLoading,
    deleteTask,
    hasMoreCompleted,
  } = useTasks();

  const [showCompleted, setShowCompleted] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { handleAddTask, error } = useAddTask();

  const incompleteItems = useMemo(
    () => tasks.filter((t) => !t.isCompleted),
    [tasks]
  );

  const completeItems = useMemo(
    () => tasks.filter((t) => t.isCompleted),
    [tasks]
  );

  const handleShowMore = async () => {
    setIsLoadingMore(true);
    await loadMoreCompleted();
    setIsLoadingMore(false);
  };

  if (isLoading) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text variant="titleLarge" style={styles.title}>
          ToDo List
        </Text>
        <View style={styles.checkboxRow}>
          <Checkbox
            status={showCompleted ? 'checked' : 'unchecked'}
            onPress={() => setShowCompleted((p) => !p)}
          />
          <Text variant="bodySmall" onPress={() => setShowCompleted((p) => !p)}>
            Show completed
          </Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {incompleteItems.length > 0 ? (
        <TaskList
          tasks={incompleteItems}
          onUpdateStatus={toggleTaskCompletion}
          onDeleteTask={deleteTask}
        />
      ) : tasks.length === 0 ? (
        <NoTasksState />
      ) : null}

      <AddTaskSection onAddTask={handleAddTask} defaultDueDate={new Date()} />

      {showCompleted && (
        <View style={styles.completedSection}>
          <TaskList
            tasks={completeItems}
            onUpdateStatus={toggleTaskCompletion}
            onDeleteTask={deleteTask}
          />
          {hasMoreCompleted && (
            <Button
              mode="text"
              icon="chevron-down"
              onPress={handleShowMore}
              disabled={isLoadingMore}
              style={styles.showMoreBtn}
            >
              {isLoadingMore ? (
                <ActivityIndicator size="small" />
              ) : (
                'Show More'
              )}
            </Button>
          )}
        </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: '700',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  completedSection: {
    marginTop: 16,
  },
  showMoreBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
});
