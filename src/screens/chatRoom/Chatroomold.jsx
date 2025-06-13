import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const ChatRoom = () => {
  // Sample data for users wanting to join
  const joinRequests = [
    { id: 1, name: 'jimmyjoe', action: 'join the room' },
    { id: 2, name: 'princess', action: 'join the room' },
    { id: 3, name: 'karmalotloz', action: 'join the room' },
    { id: 4, name: 'Samuel', action: 'join the room' },
    { id: 5, name: 'luvfaice', action: 'join the room' },
    { id: 6, name: 'Sunny', action: 'join the room' },
  ];

  const renderPlusIcon = (index) => (
    <TouchableOpacity key={index} style={styles.plusIconContainer}>
      <Icon name="add" size={24} color="#8B5CF6" />
    </TouchableOpacity>
  );

  const renderJoinRequest = (item) => (
    <View key={item.id} style={styles.joinRequestItem}>
      <Text style={styles.joinRequestText}>
        <Text style={styles.username}>{item.name}</Text>
        <Text style={styles.actionText}> {item.action}</Text>
      </Text>
    </View>
  );

  return (
  <>
     <SafeAreaView style={styles.container}>
      {/* <StatusBar backgroundColor="#7C3AED" barStyle="light-content" /> */}
      <LinearGradient
              colors={['#471069', '#0F172A']}
              locations={[0, 0.6]}
              style={styles.linearGradient}
            >
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.userAvatar}>
            <Text style={styles.avatarText}>Z</Text>
          </View>
          <View>
            <Text style={styles.roomTitle}>Zara joe</Text>
            <Text style={styles.onlineStatus}>• online 3572</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.participantAvatars}>
            <View style={[styles.smallAvatar, { backgroundColor: '#FF6B6B' }]}>
              <Text style={styles.smallAvatarText}>A</Text>
            </View>
            <View style={[styles.smallAvatar, { backgroundColor: '#4ECDC4' }]}>
              <Text style={styles.smallAvatarText}>B</Text>
            </View>
            <View style={[styles.smallAvatar, { backgroundColor: '#45B7D1' }]}>
              <Text style={styles.smallAvatarText}>C</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Icon name="more-horiz" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* User Avatar */}
        <View style={styles.centerAvatar}>
          <View style={styles.mainUserAvatar}>
            <Text style={styles.mainAvatarText}>👤</Text>
          </View>
        </View>

        {/* Plus Icons Grid */}
        <View style={styles.plusIconsGrid}>
          {Array.from({ length: 8 }, (_, index) => renderPlusIcon(index))}
        </View>

        {/* Join Requests */}
        <ScrollView style={styles.joinRequestsContainer} showsVerticalScrollIndicator={false}>
          {joinRequests.map(renderJoinRequest)}
        </ScrollView>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Text style={styles.bottomNavText}>White...</Text>
        </TouchableOpacity>
        
        <View style={styles.bottomNavIcons}>
          <TouchableOpacity style={styles.bottomNavIcon}>
            <Ionicons name="happy-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomNavIcon}>
            <MaterialCommunityIcons name="note-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomNavIcon}>
            <MaterialCommunityIcons name="email-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomNavIcon}>
            <MaterialCommunityIcons name="gift-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.joinButtonText}>Join</Text>
        </TouchableOpacity>
      </View>
      </LinearGradient>
    </SafeAreaView>
  </>
   
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  linearGradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  roomTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  onlineStatus: {
    color: '#E0E7FF',
    fontSize: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatars: {
    flexDirection: 'row',
    marginRight: 12,
  },
  smallAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -4,
  },
  smallAvatarText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  moreButton: {
    padding: 4,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centerAvatar: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  mainUserAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainAvatarText: {
    fontSize: 24,
  },
  plusIconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    // justifyContent: 'space-between',
    marginBottom: 30,
  },
  plusIconContainer: {
    // width: '22%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    padding: 5, 
    borderWidth: 1,
    borderColor: '#8B5CF6',
    borderStyle: 'dashed',
    marginHorizontal: 15
  },
  joinRequestsContainer: {
    flex: 1,
  },
  joinRequestItem: {
    paddingVertical: 4,
  },
  joinRequestText: {
    color: 'white',
    fontSize: 14,
  },
  username: {
    color: '#FCD34D',
    fontWeight: 'bold',
  },
  actionText: {
    color: '#E0E7FF',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  bottomNavItem: {
    flex: 1,
  },
  bottomNavText: {
    color: 'white',
    fontSize: 14,
  },
  bottomNavIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  bottomNavIcon: {
    marginHorizontal: 12,
  },
  joinButton: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ChatRoom;