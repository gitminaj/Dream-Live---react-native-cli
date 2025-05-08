import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DefaultAvatar({ name = 'User', size = 40 }) {
  // Extract first letter of first and last name
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
    
  // Generate random color based on name
  const getColorFromName = (name) => {
    const colors = [
      '#F87171', '#FB923C', '#FBBF24', '#A3E635', 
      '#34D399', '#22D3EE', '#60A5FA', '#A78BFA', 
      '#C084FC', '#F472B6'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const avatarColor = getColorFromName(name);

  return (
    <View 
      style={[
        styles.avatar, 
        { 
          backgroundColor: avatarColor,
          width: size,
          height: size,
          borderRadius: size / 2
        }
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: 'white',
    fontWeight: 'bold',
  }
});