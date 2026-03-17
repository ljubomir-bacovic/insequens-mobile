import React from 'react';
import { View, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { Text } from 'react-native-paper';

interface NoTasksStateProps {
  message?: string;
  image?: ImageSourcePropType;
}

const NoTasksState: React.FC<NoTasksStateProps> = ({
  message = 'No tasks yet. Create your first task to get started!',
  image = require('@/assets/images/start.jpg'),
}) => {
  return (
    <View style={styles.container}>
      <Image source={image} style={styles.image} resizeMode="contain" />
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
  image: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    color: '#6b7280',
    lineHeight: 24,
  },
});

export default NoTasksState;
