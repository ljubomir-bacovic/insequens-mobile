import React, { useState, useEffect } from 'react';
import { Platform, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  Text,
  Button,
  TextInput,
  SegmentedButtons,
  IconButton,
  Divider,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  updateToDoItemPriority,
  updateToDoItemName,
  updateToDoItemDescription,
  updateToDoItemDueDate,
} from '@/api';
import { useTasks } from '@/hooks/useTasks';
import PriorityCheckbox from '@/components/PriorityCheckbox';
import { formatDate, parseDate } from '@/utils/dateUtils';

interface ToDoItemDetailsProps {
  itemId: string | null;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const ToDoItemDetails: React.FC<ToDoItemDetailsProps> = ({
  itemId,
  onDelete,
  onClose,
}) => {
  const { tasks, updateTask, toggleTaskCompletion } = useTasks();
  const details = tasks.find((t) => t.id === itemId);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingPriority, setIsEditingPriority] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [priorityValue, setPriorityValue] = useState<string>('');
  const [editedDueDate, setEditedDueDate] = useState<Date | null>(null);

  useEffect(() => {
    if (details) {
      setEditedName(details.name ?? '');
      setEditedDescription(details.description ?? '');
      setEditedDueDate(details.dueDate ? parseDate(details.dueDate) : null);
      setPriorityValue(details.priority?.toString() ?? '');
    }
  }, [details]);

  if (!itemId || !details) return null;

  const handleToggleCompletion = async () => {
    try {
      await toggleTaskCompletion(details.id);
    } catch (err) {
      console.error('Error toggling task completion:', err);
    }
  };

  const handleNameUpdate = () => {
    if (!editedName.trim()) return;
    updateTask(details.id, { name: editedName });
    updateToDoItemName(details.id, editedName).catch(console.error);
    setIsEditingName(false);
  };

  const handleDescriptionUpdate = () => {
    updateTask(details.id, { description: editedDescription });
    updateToDoItemDescription(details.id, editedDescription).catch(console.error);
    setIsEditingDescription(false);
  };

  const handlePriorityUpdate = (newVal: string) => {
    const newPriority = Number(newVal);
    setPriorityValue(newVal);
    updateTask(details.id, { priority: newPriority });
    updateToDoItemPriority(details.id, newPriority).catch(console.error);
    setIsEditingPriority(false);
  };

  const handleDueDateUpdate = (date: Date | null) => {
    setEditedDueDate(date);
    const dueDate = date?.toLocaleDateString('sv-SE') ?? '';
    updateTask(details.id, { dueDate });
    if (date) {
      updateToDoItemDueDate(details.id, dueDate).catch(console.error);
    }
    setShowDatePicker(false);
  };

  const getPriorityLabel = (p?: number) => {
    switch (p) {
      case 1: return 'High';
      case 2: return 'Medium';
      case 3: return 'Low';
      default: return 'None';
    }
  };

  const formattedDueDate = formatDate(details.dueDate, {
    format: 'long',
    useWords: true,
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Completion + Name */}
      <View style={styles.row}>
        <PriorityCheckbox
          checked={details.isCompleted}
          onChange={handleToggleCompletion}
          priority={details.priority}
          isCompleted={details.isCompleted}
        />
        {isEditingName ? (
          <View style={styles.editRow}>
            <TextInput
              value={editedName}
              onChangeText={setEditedName}
              mode="outlined"
              style={styles.editInput}
              autoFocus
              dense
            />
            <IconButton icon="check" size={20} onPress={handleNameUpdate} />
            <IconButton icon="close" size={20} onPress={() => setIsEditingName(false)} />
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => {
              setEditedName(details.name ?? '');
              setIsEditingName(true);
            }}
            style={styles.flex}
          >
            <Text
              variant="titleMedium"
              style={[
                styles.taskName,
                { textDecorationLine: details.isCompleted ? 'line-through' : 'none' },
              ]}
            >
              {details.name}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Divider style={styles.divider} />

      {/* Description */}
      <View style={styles.fieldSection}>
        <Text variant="labelMedium" style={styles.fieldLabel}>Description</Text>
        {isEditingDescription ? (
          <View>
            <TextInput
              value={editedDescription}
              onChangeText={setEditedDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
              autoFocus
            />
            <View style={styles.editActions}>
              <Button mode="text" onPress={handleDescriptionUpdate}>Save</Button>
              <Button mode="text" onPress={() => setIsEditingDescription(false)}>Cancel</Button>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => {
              setEditedDescription(details.description ?? '');
              setIsEditingDescription(true);
            }}
          >
            <Text variant="bodyMedium" style={styles.fieldValue}>
              {details.description || 'Tap to add description'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Divider style={styles.divider} />

      {/* Priority */}
      <View style={styles.fieldSection}>
        <Text variant="labelMedium" style={styles.fieldLabel}>Priority</Text>
        {isEditingPriority ? (
          <View>
            <SegmentedButtons
              value={priorityValue}
              onValueChange={handlePriorityUpdate}
              buttons={[
                { value: '1', label: 'High' },
                { value: '2', label: 'Medium' },
                { value: '3', label: 'Low' },
              ]}
            />
            <Button
              mode="text"
              onPress={() => setIsEditingPriority(false)}
              style={styles.cancelBtn}
            >
              Cancel
            </Button>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setIsEditingPriority(true)}>
            <Text variant="bodyMedium" style={styles.fieldValue}>
              {getPriorityLabel(details.priority)}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Divider style={styles.divider} />

      {/* Due Date */}
      <View style={styles.fieldSection}>
        <Text variant="labelMedium" style={styles.fieldLabel}>Due Date</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text variant="bodyMedium" style={styles.fieldValue}>
            {details.dueDate ? formattedDueDate : 'Tap to set due date'}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={editedDueDate ?? new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, selectedDate) => {
              if (Platform.OS === 'android') {
                handleDueDateUpdate(selectedDate ?? null);
              } else {
                setEditedDueDate(selectedDate ?? null);
              }
            }}
          />
        )}
        {Platform.OS === 'ios' && showDatePicker && (
          <View style={styles.editActions}>
            <Button mode="text" onPress={() => handleDueDateUpdate(editedDueDate)}>
              Confirm
            </Button>
            <Button mode="text" onPress={() => setShowDatePicker(false)}>
              Cancel
            </Button>
          </View>
        )}
      </View>

      <Divider style={styles.divider} />

      {/* Delete */}
      <Button
        mode="contained"
        buttonColor="#ef4444"
        onPress={() => onDelete(details.id)}
        style={styles.deleteButton}
      >
        Delete Task
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 500,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  editRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  taskName: {
    fontWeight: '600',
  },
  divider: {
    marginVertical: 8,
  },
  fieldSection: {
    marginBottom: 4,
  },
  fieldLabel: {
    color: '#6b7280',
    marginBottom: 4,
  },
  fieldValue: {
    color: '#111827',
    paddingVertical: 4,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  cancelBtn: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  deleteButton: {
    marginTop: 8,
    marginBottom: 8,
  },
});

export default ToDoItemDetails;
