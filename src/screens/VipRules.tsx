import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const VipRules = ({ navigation }) => {
  // VIP level data
  const vipLevels = [
    { level: 'VIP 1', wealth: 0 },
    { level: 'VIP 2', wealth: 30000 },
    { level: 'VIP 3', wealth: 100000 },
    { level: 'VIP 4', wealth: 220000 },
    { level: 'VIP 5', wealth: 450000 },
    { level: 'VIP 6', wealth: 800000 },
    { level: 'VIP 7', wealth: 1600000 },
    { level: 'VIP 8', wealth: 3000000 },
    { level: 'VIP 9', wealth: 6500000 },
    { level: 'VIP 10', wealth: 15250000 },
    { level: 'VIP 11', wealth: 22000000 },
    { level: 'VIP 12', wealth: 37000000 },
  ];

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
        <Text style={styles.headerTitle}>VIP Rules</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* VIP Price Chart Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activate VIP price chart</Text>
          <Text style={styles.description}>
            The VIP level will be determined based on your accumulated wealth value.{'\n'}
            1 coins = 1 wealth{'\n'}
            The VIP level is recalculated on a monthly basis. Wealth value will be reset 
            to 0 on the very first day of each month.
          </Text>
        </View>

        {/* Rule Section 1 */}
        <View style={styles.section}>
          <Text style={styles.ruleTitle}>1. Upgrade Rules</Text>
          <Text style={styles.description}>
            VIP level will be updated instantly after meeting the level up requirements.
            Your current VIP level will be kept until the end of next month.{'\n'}{'\n'}
            For example, When you reach VIP5 on June 5th and your VIP5 will be kept 
            until July 31st
          </Text>
        </View>

        {/* Rule Section 2 */}
        <View style={styles.section}>
          <Text style={styles.ruleTitle}>2. Maintain Level/Level Downgrading Rules</Text>
          <Text style={styles.description}>
            If your current month wealth value meets the requirement for your current VIP 
            level then your VIP level will be kept until the end of next month otherwise 
            your VIP level might be downgraded according to your current wealth value{'\n\n'}
            For example: you are a VIP6 user in my but your wealth value in may only 
            reaches the requirement for VIP3 then your VIP level might be replaced
          </Text>
        </View>

        {/* Rule Section 3 */}
        <View style={styles.section}>
          <Text style={styles.ruleTitle}>3. Cancel VIP rules</Text>
          <Text style={styles.description}>
            After the user unsubscribes the VIP, the system will automatically cancel 
            the level and corresponding Privileges after non-VIP users settle VIP 
            the system will update the user's wealth value this month to obtain a 
            corresponding Level.
          </Text>
        </View>

        {/* VIP Level Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>VIP Level</Text>
            <Text style={[styles.tableHeaderText, { textAlign: 'center' }]}>Wealth level</Text>
          </View>

          {vipLevels.map((item, index) => (
            <View 
              key={index} 
              style={[
                styles.tableRow, 
                index === vipLevels.length - 1 ? styles.lastRow : null
              ]}
            >
              <Text style={styles.levelText}>{item.level}</Text>
              <Text style={styles.wealthText}>
                {item.wealth.toLocaleString()}
              </Text>
            </View>
          ))}
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
    justifyContent: 'space-between',
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
  },
  placeholder: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#293452',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ruleTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: '#B4B9C6',
    fontSize: 14,
    lineHeight: 20,
  },
  highlightText: {
    color: '#3E8BFF',
    fontWeight: '500',
  },
  tableContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#293452',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1C2642',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableHeaderText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#293452',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  levelText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    // textAlign: 'center',
  },
  wealthText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});

export default VipRules;