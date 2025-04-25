import { useState } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  StyleSheet,
} from "react-native";
// import CheckBox from "react-native-check-box";
// import CheckBox from '@react-native-community/checkbox';
import IconPassword from "react-native-vector-icons/Feather";
import IconEmail from "react-native-vector-icons/Fontisto";
import { useNavigation } from '@react-navigation/native';
import { loginSchema } from "../../utils/schema/login";

import { InputWithIcon } from "../../components/InputWithIcon";

export default function Login() {
    const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  const handleSubmit = () =>{
    // const result = loginSchema.safeParse(form)
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.elementContainer}>
          <Text style={styles.text}>Login</Text>

          <InputWithIcon
            placeholder="Enter your Email"
            value={email}
            onChangeText={setEmail}
            icon={
              <IconEmail
                name="email"
                size={20}
                color="#8C8C8C"
                style={styles.icon}
              />
            }
            keyboardType="email-address"
          />

          <InputWithIcon
            placeholder="Enter your Password"
            value={password}
            onChangeText={setPassword}
            icon={
              <IconPassword
                name="lock"
                size={20}
                color="#8C8C8C"
                style={styles.icon}
              />
            }
          />
          <View style={styles.remembernpassword}>
            <View style={styles.checkboxContainer}>
              {/* <CheckBox
                // value={isChecked}
                // onValueChange={(newVal) => setIsChecked(newVal)}
                style={[styles.checkbox, { transform: [{ scale: 0.8 }] }]}
                tintColors={{true: "#94A3B8", false: "#94A3B8"}}
              /> */}
              <Text style={{ color: "#94A3B8", marginBottom: 2 }}>
                Remember me
              </Text>
            </View>

            <View>
              <Text style={{ color: "#94A3B8" }}>Forgot Password?</Text>
            </View>
          </View>

          <View style={styles.btn}>
            <Text style={styles.btnText}>Sign in</Text>
          </View>

          <View style={styles.lineContainer}>
            <View style={styles.line} />
            <View>
              <Text style={styles.lineText}>or login with</Text>
            </View>
            <View style={styles.line} />
          </View>

          <View style={styles.socialIconsContainer}>
            <TouchableOpacity>
              <Image
                style={styles.socialIcon}
                resizeMode="contain"
                source={require("../../assets/google.png")}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image
                style={styles.socialIcon}
                resizeMode="contain"
                source={require("../../assets/facebook.png")}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image
                style={styles.socialIcon}
                resizeMode="contain"
                source={require("../../assets/instagram.png")}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image
                style={styles.socialIcon}
                resizeMode="contain"
                source={require("../../assets/snapchat.png")}
              />
            </TouchableOpacity>
          </View>
          <View >
            <TouchableOpacity onPress={ () => navigation.navigate("Register")} >
              <Text style={styles.bottomText}>not a member?register now</Text>
            </TouchableOpacity>
          </View>
          <View >
          <TouchableOpacity onPress={ () => navigation.navigate("Home")} >
              <Text style={styles.bottomText}>Home</Text>
              </TouchableOpacity>
            <TouchableOpacity onPress={ () => navigation.navigate("Discover")} >
              <Text style={styles.bottomText}>discover</Text>
              </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  bottomText:{
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 15,
    marginTop: 30
  },
  socialIconsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    marginTop: 30,
    marginBottom: 30,
  },
  socialIcon: {
    width: 40,
    height: 40,
  },
  lineContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 30,
  },
  line: {
    // flex: 1,
    height: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    width: "30%",
  },
  lineText: {
    // width: 100,
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 15,
  },
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
  },
  elementContainer: {
    width: "80%",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontWeight: 700,
    fontSize: 32,
    marginBottom: 20,
  },
  btn: {
    justifyContent: "center",
    alignItems: "center",
    width: 282,
    height: 50,
    borderRadius: 40,
    backgroundColor: "#D4ACFB",
    marginTop: 40,
  },
  btnText: {
    color: "white",
    fontWeight: 700,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  remembernpassword: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 5,
  },
  checkbox: {
    color: "#94A3B8",
    borderColor: "#94A3B8",
  },
});
