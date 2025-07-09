import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';


import Icon from 'react-native-vector-icons/Ionicons';
import HomeFooter from '../../components/HomeFooter';

const HostStreaming = ({navigation}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('daily');

  const timeframes = ['daily', 'Weekly', 'monthly']; 
  
  const hosts = [
    {
      id: '1',
      name: 'Michael Chen',
      role: 'Top performer',
      hours: '24hrs',
      avatar: '🎮',
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'Top performer',
      hours: '24hrs',
      avatar: '🎮',
    },
    {
      id: '3',
      name: 'Michael Chen',
      role: 'Top performer',
      hours: '24hrs',
      avatar: '🎮',
    },
    {
      id: '4',
      name: 'Michael Chen',
      role: 'Top performer',
      hours: '24hrs',
      avatar: '🎮',
    },
  ];

  const renderHost = ({ item }) => (
    <View style={styles.hostCard}>
      <View style={styles.hostAvatar}>
        <Text style={styles.avatarText}>{item.avatar}</Text>
      </View>
      <View style={styles.hostInfo}>
        <Text style={styles.hostName}>{item.name}</Text>
        <Text style={styles.hostRole}>{item.role}</Text>
      </View>
      <Text style={styles.hostHours}>{item.hours}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1b2e" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
                          style={styles.backButton} 
                          onPress={() => navigation.goBack()}
                        >
                          <Icon name="chevron-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
        <Text style={styles.headerTitle}>Host Streaming</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Time Filter */}
      <View style={styles.timeFilterContainer}>
        {timeframes.map((timeframe, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.timeFilterButton,
              selectedTimeframe === timeframe && index === 0 && styles.selectedTimeFilter
            ]}
            onPress={() => setSelectedTimeframe(timeframe)}
          >
            <Text style={[
              styles.timeFilterText,
              selectedTimeframe === timeframe && index === 0 && styles.selectedTimeFilterText
            ]}>
              {timeframe}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Streaming Hours</Text>
          <Text style={styles.statValue}>456</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Active Hosts</Text>
          <Text style={styles.statValue}>24</Text>
        </View>
      </View>

      {/* Hosts List */}
      <FlatList
        data={hosts}
        renderItem={renderHost}
        keyExtractor={(item) => item.id}
        style={styles.hostsList}
        showsVerticalScrollIndicator={false}
      />
      <HomeFooter/>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 36,
  },
  timeFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  timeFilterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  selectedTimeFilter: {
    backgroundColor: '#D4ACFB',
  },
  timeFilterText: {
    color: '#8b9dc3',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTimeFilterText: {
    color: '#ffffff',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2a2b3e',
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
    alignItems: 'center',
  },
  statLabel: {
    color: '#8b9dc3',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  hostsList: {
    paddingHorizontal: 16,
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2b3e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  hostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3730a3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  hostRole: {
    color: '#8b9dc3',
    fontSize: 14,
  },
  hostHours: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default HostStreaming;