import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getToDoItems,
  addToDoItem,
  deleteToDoItem,
  TaskSubmitData,
  updateCompletionStatus as updateCompletionStatusAPI,
} from '@/api';
import { parseDate } from '@/utils/dateUtils';
import { TasksContext, ToDoItem } from '@/contexts/TasksContext';

export type { ToDoItem } from '@/contexts/TasksContext';
export { TasksContext } from '@/contexts/TasksContext';

const normalizeTask = (item: any): ToDoItem => ({
  id: String(item.id ?? item.Id ?? ''),
  name: item.name ?? item.Name ?? '',
  description: item.description ?? item.Description,
  dueDate: item.dueDate ?? item.DueDate,
  isCompleted: item.isCompleted ?? item.IsCompleted ?? false,
  priority: item.priority ?? item.Priority,
});

const TASK_ARRAY_KEYS = [
  'data',
  'items',
  'value',
  'result',
  'results',
  'toDoItems',
  'todoItems',
  '$values',
];
const MAX_TASK_ARRAY_SEARCH_DEPTH = 5;

const hasValidTaskId = (item: any): boolean =>
  typeof item?.id === 'string' ||
  typeof item?.id === 'number' ||
  typeof item?.Id === 'string' ||
  typeof item?.Id === 'number';

const hasValidTaskName = (item: any): boolean =>
  typeof item?.name === 'string' || typeof item?.Name === 'string';

const isTaskLike = (item: any): boolean =>
  Boolean(
    item &&
      typeof item === 'object' &&
      hasValidTaskId(item) &&
      hasValidTaskName(item)
  );

const getTaskIdentifier = (item: {
  id?: string | number;
  Id?: string | number;
}) =>
  typeof item.id === 'string' || typeof item.id === 'number'
    ? item.id
    : typeof item.Id === 'string' || typeof item.Id === 'number'
      ? item.Id
      : null;

const deduplicateTasks = (items: unknown[]): unknown[] => {
  const seenIds = new Set<string>();

  return items.filter((item) => {
    if (!isTaskLike(item)) {
      return false;
    }

    const task = item as { id?: string | number; Id?: string | number };
    const rawId = getTaskIdentifier(task);

    if (rawId === null) {
      return false;
    }

    const taskId = String(rawId);

    if (seenIds.has(taskId)) {
      return false;
    }

    seenIds.add(taskId);
    return true;
  });
};

const findTaskArray = (data: any, currentDepth = 0): unknown[] => {
  if (Array.isArray(data)) {
    return data.flatMap((value) =>
      isTaskLike(value) ? [value] : findTaskArray(value, currentDepth + 1)
    );
  }

  if (
    !data ||
    typeof data !== 'object' ||
    currentDepth >= MAX_TASK_ARRAY_SEARCH_DEPTH
  ) {
    return [];
  }

  const keyMatches = TASK_ARRAY_KEYS.flatMap((key) =>
    findTaskArray(data[key], currentDepth + 1)
  );

  if (keyMatches.length > 0) {
    return keyMatches;
  }

  return Object.values(data).flatMap((value) =>
    findTaskArray(value, currentDepth + 1)
  );
};

const extractTasksArray = (data: unknown): ToDoItem[] => {
  const raw = deduplicateTasks(findTaskArray(data));
  const tasks = raw.map(normalizeTask);
  // Fallback: handle a direct single-task response (e.g. from addToDoItem)
  if (tasks.length === 0 && isTaskLike(data)) return [normalizeTask(data)];
  return tasks;
};

// Merge task arrays by ID. By default, incoming items overwrite existing ones to
// keep the most recent copy and avoid duplicate keys. When `existingWins` is
// true, existing items win to prevent overwriting local updates with potentially
// stale server data (useful for pagination).
const mergeUniqueTasks = (
  existing: ToDoItem[],
  incoming: ToDoItem[],
  existingWins = false,
  context = 'mergeUniqueTasks'
): ToDoItem[] => {
  const merged = new Map<string, ToDoItem>();

  const addToMerged = (task: ToDoItem) => {
    if (!task?.id) {
      console.error(`${context}: Skipping task without id`, task);
      return;
    }
    if (typeof task.id === 'number') {
      console.warn(`${context}: Normalizing numeric task id`, task);
    }
    // API responses sometimes return numeric IDs; normalize to string to match
    // ToDoItem.id (string) and deduplicate reliably across types.
    merged.set(String(task.id), task);
  };

  const orderedLists = existingWins ? [incoming, existing] : [existing, incoming];
  orderedLists.forEach((list) => list.forEach(addToMerged));
  return Array.from(merged.values());
};

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [allTasks, setAllTasks] = useState<ToDoItem[]>([]);
  const [completedPage, setCompletedPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMoreCompleted, setHasMoreCompleted] = useState(true);
  const [search, setSearch] = useState('');

  const ITEMS_PER_PAGE = 20;

  const sortTasks = useCallback((items: ToDoItem[]): ToDoItem[] => {
    return [...items].sort((a, b) => {
      const dateA = a.dueDate ? parseDate(a.dueDate).getTime() : Infinity;
      const dateB = b.dueDate ? parseDate(b.dueDate).getTime() : Infinity;

      if (dateA !== dateB) return dateA - dateB;

      const priorityA = a.priority ?? Infinity;
      const priorityB = b.priority ?? Infinity;

      return priorityA - priorityB;
    });
  }, []);

  const applySearchFilter = useCallback(
    (data: ToDoItem[], query: string): ToDoItem[] => {
      if (!query) return data;
      return data.filter((task) =>
        task.name.toLowerCase().includes(query.toLowerCase())
      );
    },
    []
  );

  const tasks = useMemo(
    () => applySearchFilter(sortTasks(allTasks), search),
    [allTasks, search, sortTasks, applySearchFilter]
  );

  useEffect(() => {
    const fetchInitialTasks = async () => {
      try {
        const [incomplete, complete] = await Promise.allSettled([
          getToDoItems(false, 1, 1000),
          getToDoItems(true, 1, ITEMS_PER_PAGE),
        ]);

        if (incomplete.status === 'rejected') {
          console.error('Failed to fetch incomplete tasks', incomplete.reason);
        }

        if (complete.status === 'rejected') {
          console.error('Failed to fetch completed tasks', complete.reason);
        }

        const incompleteTasks =
          incomplete.status === 'fulfilled'
            ? extractTasksArray(incomplete.value.data)
            : [];
        const completeTasks =
          complete.status === 'fulfilled'
            ? extractTasksArray(complete.value.data)
            : [];
        setAllTasks(mergeUniqueTasks(incompleteTasks, completeTasks, false, 'initialLoad'));
        setHasMoreCompleted(
          complete.status === 'fulfilled' &&
            completeTasks.length === ITEMS_PER_PAGE
        );
      } catch (err) {
        console.error('Failed to fetch initial tasks', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialTasks();
  }, []);

  const addTask = useCallback(
    async (data: TaskSubmitData): Promise<ToDoItem | null> => {
      try {
        const response = await addToDoItem(data);
        const extracted = extractTasksArray(response.data);
        if (extracted.length === 0) return null;
        const newItem = extracted[0];
        setAllTasks((prev) => mergeUniqueTasks(prev, [newItem], false, 'addTask'));
        return newItem;
      } catch (err) {
        console.error('Failed to add task', err);
        return null;
      }
    },
    []
  );

  const loadMoreCompleted = useCallback(async () => {
    try {
      const nextPage = completedPage + 1;
      const response = await getToDoItems(true, nextPage, ITEMS_PER_PAGE);
      const newItems = extractTasksArray(response.data);
      if (newItems.length < ITEMS_PER_PAGE) {
        setHasMoreCompleted(false);
      }
      setAllTasks((prev) => mergeUniqueTasks(prev, newItems, true, 'pagination'));
      setCompletedPage(nextPage);
    } catch (err) {
      console.error('Failed to load more completed tasks', err);
    }
  }, [completedPage]);

  const toggleTaskCompletion = useCallback(async (id: string) => {
    try {
      await updateCompletionStatusAPI(id);
      setAllTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
        )
      );
    } catch (err) {
      console.error('Failed to toggle task status', err);
    }
  }, []);

  const updateTask = useCallback(
    async (id: string, partial: Partial<ToDoItem>) => {
      setAllTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, ...partial } : task))
      );
    },
    []
  );

  const deleteTask = useCallback(async (id: string) => {
    try {
      await deleteToDoItem(id);
      setAllTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  }, []);

  const value = useMemo(
    () => ({
      tasks,
      addTask,
      loadMoreCompleted,
      toggleTaskCompletion,
      deleteTask,
      isLoading,
      hasMoreCompleted,
      setSearch,
      updateTask,
    }),
    [
      tasks,
      addTask,
      loadMoreCompleted,
      toggleTaskCompletion,
      deleteTask,
      isLoading,
      hasMoreCompleted,
      setSearch,
      updateTask,
    ]
  );

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
};
