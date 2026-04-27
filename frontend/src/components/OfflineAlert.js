import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';

export default function OfflineAlert({ isConnected }) {
  if (isConnected) return null;
  return (
    <View style={s.bar}>
      <Icon name="wifi-off" size={16} color="#fff" />
      <Text style={s.text}>No internet connection — working offline</Text>
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 999,
    backgroundColor: '#FF4D6D', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8, gap: 8,
  },
  text: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
