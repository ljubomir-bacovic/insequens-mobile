import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Portal, Modal } from 'react-native-paper';

interface SpinnerOverlayProps {
  visible: boolean;
}

const SpinnerOverlay: React.FC<SpinnerOverlayProps> = ({ visible }) => {
  return (
    <Portal>
      <Modal
        visible={visible}
        dismissable={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.inner}>
          <ActivityIndicator size="large" color="#0a7ea4" />
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  inner: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
});

export default SpinnerOverlay;
