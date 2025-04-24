import {View, Text, TouchableOpacity} from 'react-native';
import {StyleSheet} from 'react-native';

export default function VerifyEmail() {
  return (
    <>
      <View>
        <Text style={styles.heading}>Verify Email </Text>
        <TouchableOpacity style={styles.btn}>
          <Text style={styles.btnText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 32,
    fontWeight: 600,
  },
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 282,
    height: 50,
    borderRadius: 30,
    backgroundColor: '#FB923C',
    marginTop: 40,
  },
  btnText: {
    color: 'white',
    fontWeight: 700,
    fontSize: 16,
  },
});
