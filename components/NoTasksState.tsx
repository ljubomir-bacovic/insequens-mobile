import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface NoTasksStateProps {
  message?: string;
}

const NoTasksState: React.FC<NoTasksStateProps> = ({
  message = 'No tasks yet. Create your first task to get started!',
}) => {
  return (
    <View style={styles.container}>
      <Text variant="bodyLarge" style={styles.message}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 16,
  },
  message: {
    textAlign: 'center',
    color: '#6b7280',
    lineHeight: 24,
  },
});

export default NoTasksState;
