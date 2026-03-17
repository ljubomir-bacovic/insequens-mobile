import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Tabs } from 'expo-router';
import { Appbar, IconButton, Portal, Modal, Surface, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TasksProvider } from '@/components/TasksContext';
import { useTasks } from '@/hooks/useTasks';
import useLogout from '@/hooks/useLogout';
import AddTaskForm, { TaskFormSubmitData } from '@/components/AddTaskForm';

function AddTaskModal({
  visible,
  onDismiss,
}: {
  visible: boolean;
  onDismiss: () => void;
}) {
  const { addTask } = useTasks();

  const handleAdd = async (data: TaskFormSubmitData) => {
    await addTask(data);
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalContent} elevation={4}>
          <Text variant="titleLarge" style={styles.modalTitle}>
            Add Task
          </Text>
          <AddTaskForm
            onAdd={handleAdd}
            onCancel={onDismiss}
            defaultDueDate={new Date()}
          />
        </Surface>
      </Modal>
    </Portal>
  );
}

function AppHeader({
  title,
  onAddTask,
  searchValue,
  onSearchChange,
  onLogout,
}: {
  title: string;
  onAddTask: () => void;
  searchValue: string;
  onSearchChange: (v: string) => void;
  onLogout: () => void;
}) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <Appbar.Header style={styles.header}>
      {showSearch ? (
        <View style={styles.searchContainer}>
          <TextInput
            value={searchValue}
            onChangeText={onSearchChange}
            placeholder="Search tasks..."
            style={styles.searchInput}
            autoFocus
          />
          <IconButton
            icon="close"
            size={20}
            onPress={() => {
              setShowSearch(false);
              onSearchChange('');
            }}
          />
        </View>
      ) : (
        <>
          <Appbar.Content title={title} />
          <Appbar.Action icon="magnify" onPress={() => setShowSearch(true)} />
          <Appbar.Action icon="plus" onPress={onAddTask} />
          <Appbar.Action icon="logout" onPress={onLogout} />
        </>
      )}
    </Appbar.Header>
  );
}

function AppContent() {
  const [addTaskVisible, setAddTaskVisible] = useState(false);
  const { setSearch } = useTasks();
  const [searchValue, setSearchValue] = useState('');
  const handleLogout = useLogout();

  const handleSearchChange = (v: string) => {
    setSearchValue(v);
    setSearch(v);
  };

  return (
    <>
      <Tabs
        screenOptions={{
          header: ({ route }) => {
            const titles: Record<string, string> = {
              today: 'Today',
              todo: 'All Tasks',
              upcoming: 'Upcoming',
              overdue: 'Overdue',
            };
            return (
              <AppHeader
                title={titles[route.name] ?? 'Insequens'}
                onAddTask={() => setAddTaskVisible(true)}
                searchValue={searchValue}
                onSearchChange={handleSearchChange}
                onLogout={handleLogout}
              />
            );
          },
          tabBarActiveTintColor: '#0a7ea4',
        }}
      >
        <Tabs.Screen
          name="today"
          options={{
            title: 'Today',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="calendar-today" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="todo"
          options={{
            title: 'All Tasks',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="format-list-bulleted" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="upcoming"
          options={{
            title: 'Upcoming',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="calendar-clock" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="overdue"
          options={{
            title: 'Overdue',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="clock-alert" color={color} size={size} />
            ),
          }}
        />
      </Tabs>

      <AddTaskModal
        visible={addTaskVisible}
        onDismiss={() => setAddTaskVisible(false)}
      />
    </>
  );
}

export default function AppLayout() {
  return (
    <TasksProvider>
      <AppContent />
    </TasksProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    elevation: 2,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    fontSize: 14,
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
    marginBottom: 16,
    fontWeight: '700',
  },
});
