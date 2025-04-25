import React from "react";
import { View, TextInput, StyleSheet } from "react-native";

export const InputWithIcon = ({
  placeholder,
  value,
  onChangeText,
  icon,
  keyboardType = "default",
}) => {
  return (
    <>
      <View style={styles.inputContainer}>
        {icon}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#8C8C8C"
          value={value}
          onChangeText={onChangeText}
          // secureTextEntry={secureTextEntry}
          underlineColorAndroid="transparent"
          keyboardType={keyboardType}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E2533",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 10,
    width: '100%',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    marginLeft: 10,
    flex: 1,
    color: "white",
    fontSize: 16,
    outlineStyle: "none",
  },

});
