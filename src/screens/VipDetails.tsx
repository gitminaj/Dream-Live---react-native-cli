import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const VipDetails = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#151C30" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>VIP</Text>

        <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={() => navigation.navigate('VipRules')} >
        <Text style={styles.headerSubtitle}>Rules</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* VIP1 Banner */}
        <View style={styles.vipBanner}>
          <Text style={styles.vipTitle}>VIP 1</Text>
          <Text style={styles.vipUnlockText}>5000 points to unlock VIP1</Text>
        </View>

        {/* VIP1 Room pk */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VIP1 Room pk</Text>
          <View style={styles.featureItem}>
            <MaterialIcons name="checkbox-marked-circle" size={16} color="#8A8D98" style={styles.bulletIcon} />
            <Text style={styles.featureText}>Send pictures in room</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="checkbox-marked-circle" size={16} color="#8A8D98" style={styles.bulletIcon} />
            <Text style={styles.featureText}>Send broadcasts in the room</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="checkbox-marked-circle" size={16} color="#8A8D98" style={styles.bulletIcon} />
            <Text style={styles.featureText}>View visitor Record</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="checkbox-marked-circle" size={16} color="#8A8D98" style={styles.bulletIcon} />
            <Text style={styles.featureText}>Open/close visitor typing message and VIP broadcast</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="checkbox-marked-circle" size={16} color="#8A8D98" style={styles.bulletIcon} />
            <Text style={styles.featureText}>Enter the room which is full</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="checkbox-marked-circle" size={16} color="#8A8D98" style={styles.bulletIcon} />
            <Text style={styles.featureText}>Exclusive Emoji</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="checkbox-marked-circle" size={16} color="#8A8D98" style={styles.bulletIcon} />
            <Text style={styles.featureText}>Dynamic Avatar</Text>
          </View>
        </View>

        {/* VIP1 Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VIP1 Tags</Text>
          <View style={styles.featureItem}>
            <MaterialIcons name="checkbox-marked-circle" size={16} color="#8A8D98" style={styles.bulletIcon} />
            <Text style={styles.featureText}>Unique Nickname Style</Text>
          </View>
        </View>

        {/* VIP1 Privileges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VIP1 Privileges</Text>
          <View style={styles.featureItem}>
            <MaterialIcons name="checkbox-marked-circle" size={16} color="#8A8D98" style={styles.bulletIcon} />
            <Text style={styles.featureText}>Exclusive Tools</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="checkbox-marked-circle" size={16} color="#8A8D98" style={styles.bulletIcon} />
            <Text style={styles.featureText}>Exclusive Gift</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="checkbox-marked-circle" size={16} color="#8A8D98" style={styles.bulletIcon} />
            <Text style={styles.featureText}>More followers</Text>
          </View>
        </View>

        {/* Bottom padding for scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>
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
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  headerSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'normal',
    marginLeft: 'auto',
    marginRight: 16,
  },
  scrollView: {
    flex: 1,
  },
  vipBanner: {
    margin: 16,
    padding: 16,
    backgroundColor: '#1E2846',
    borderRadius: 12,
    alignItems: 'center'
  },
  vipTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  vipUnlockText: {
    color: '#8A8D98',
    fontSize: 14,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  featureText: {
    color: '#8A8D98',
    fontSize: 14,
    flex: 1,
  },
  bottomPadding: {
    height: 40,
  },
});

export default VipDetails;