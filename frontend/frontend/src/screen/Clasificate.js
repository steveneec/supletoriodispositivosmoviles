import axios from "axios";
import { useState } from "react";
import { StyleSheet, TextInput, View, Text, Pressable } from "react-native";

export default function Classificate() {
  const [textValue, setTextValue] = useState("");
  const [result, setResult] = useState();

  async function getClassification() {
    setResult(undefined);
    const response = await axios.post(
      "http://192.168.2.54:3000/clasificate-text",
      {
        text: textValue,
      }
    );
    setResult(response.data[0]);
  }

  return (
    <View style={styles.layout}>
      <Text style={{ fontSize: 18 }}>
        Ingresa el texto que deseas clasificar
      </Text>
      <TextInput
        value={textValue}
        onChangeText={setTextValue}
        multiline
        style={styles.input}
      />
      <Text style={{ textAlign: "center" }}>
        El texto sera clasificado con las siguientes categorias: [Politica,
        Deportes, Religion]
      </Text>
      <Pressable
        android_ripple={{ color: "#378CE7" }}
        style={
          textValue === ""
            ? [styles.button, styles.buttonDisabled]
            : [styles.button]
        }
        disabled={textValue === ""}
        onPress={getClassification}
      >
        <Text style={{ fontWeight: "800", color: "white" }}>Clasificar</Text>
      </Pressable>
      {result && (
        <View style={styles.classification}>
          <Text>Resultados</Text>
          {result.labels.map((label, key) => (
            <Text key={key}>
              En {label}, se encontro un {(result.scores[key] * 100).toFixed(2)}
              %
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    padding: 20,
    gap: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e2e2e2",
    padding: 10,
    minHeight: 100,
    borderRadius: 10,
    textAlignVertical: "top",
    backgroundColor: "white",
    width: "100%",
    maxWidth: 500,
  },
  button: {
    maxWidth: 200,
    backgroundColor: "#378CE7",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#a5a5a5",
  },
  classification: {
    marginTop: 20,
  },
});
