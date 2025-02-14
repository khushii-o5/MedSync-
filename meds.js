import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import Checkbox from "expo-checkbox";
import { SafeAreaView } from "react-native-safe-area-context";


const GEMINI_API_KEY = "GEMINI_API_KEY"; // Replace with your API Key


const PrescriptionChecklist = () => {
  const [medications, setMedications] = useState({
    morning: [],
    afternoon: [],
    evening: [],
  });


  const [checkedItems, setCheckedItems] = useState({});


  const pickImage = async () => {
    console.log("📸 Button clicked");


    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "You need to grant gallery access!");
      return;
    }


    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });


    if (result.cancelled) return;


    if (result.assets.length > 0) {
      const imageBase64 = result.assets[0].base64;
      if (!imageBase64) {
        console.error("❌ Error: Image base64 data is missing.");
        return;
      }


      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
          {
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: "Extract medicine name, dosage, and timing from this prescription and categorize them into morning, afternoon, and evening. Return only in strict JSON format. Don't include any extra text or symbols.",
                  },
                ],
              },
              { role: "user", parts: [{ inlineData: { mimeType: "image/jpeg", data: imageBase64 } }] },
            ],
          }
        );


        console.log("✅ Full API Response:", response.data);


        const botReply = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!botReply) {
          console.error("⚠️ No bot reply received.");
          Alert.alert("Error", "No valid response from AI.");
          return;
        }


        console.log("💬 Bot Reply (Raw):", botReply);


        // ✅ Ensure the response is strictly JSON
        let jsonStart = botReply.indexOf("{");
        let jsonEnd = botReply.lastIndexOf("}");
        if (jsonStart !== -1 && jsonEnd !== -1) {
          let cleanedReply = botReply.substring(jsonStart, jsonEnd + 1);
          console.log("📜 Cleaned JSON:", cleanedReply);


          try {
            const parsedData = JSON.parse(cleanedReply);
            setMedications(parsedData);
            setCheckedItems({});
            Alert.alert("✅ Success", "Medicines extracted and categorized.");
          } catch (error) {
            console.error("JSON Parsing Error:", error);
            Alert.alert("Error", "Failed to parse JSON. Please check the API response.");
          }
        } else {
          console.error("❌ Invalid JSON format received.");
          Alert.alert("Error", "Invalid JSON format from API.");
        }
      } catch (error) {
        console.error("🚨 API Error:", error.response?.data || error.message);
        Alert.alert("API Error", "Failed to process the prescription.");
      }
    }
  };


  const toggleCheck = (time, index) => {
    setCheckedItems((prev) => ({
      ...prev,
      [`${time}-${index}`]: !prev[`${time}-${index}`],
    }));
  };


  return (
    <SafeAreaView style={styles.container}>
          <Text style={styles.mainHeader}> MediScan</Text>

      <TouchableOpacity onPress={pickImage} style={styles.button}>
        <Text style={styles.buttonText}>Upload Prescription 📷</Text>
      </TouchableOpacity>


      <Text style={styles.header}>Morning Medications ☀️</Text>
      <FlatList
        data={medications.morning}
        keyExtractor={(item, index) => `morning-${index}`}
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <Checkbox value={checkedItems[`morning-${index}`]} onValueChange={() => toggleCheck("morning", index)} />
            <Text style={styles.text}>{item.medicine} - {item.dosage} ({item.timing})</Text>
          </View>
        )}
      />


      <Text style={styles.header}>Afternoon Medications 🌤️</Text>
      <FlatList
        data={medications.afternoon}
        keyExtractor={(item, index) => `afternoon-${index}`}
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <Checkbox value={checkedItems[`afternoon-${index}`]} onValueChange={() => toggleCheck("afternoon", index)} />
            <Text style={styles.text}>{item.medicine} - {item.dosage} ({item.timing})</Text>
          </View>
        )}
      />


      <Text style={styles.header}>Evening Medications 🌙</Text>
      <FlatList
        data={medications.evening}
        keyExtractor={(item, index) => `evening-${index}`}
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <Checkbox value={checkedItems[`evening-${index}`]} onValueChange={() => toggleCheck("evening", index)} />
            <Text style={styles.text}>{item.medicine} - {item.dosage} ({item.timing})</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  mainHeader: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#0D47A1", // Deep blue color
    marginBottom:20
  },
  container: { flex: 1,
     padding: 20, 
     backgroundColor: "#E8F5E9"
     },
  button: { backgroundColor: "#0D47A1",
     padding: 15,
      borderRadius: 10,
       alignItems: "center", 
       marginBottom: 20 
      },
  buttonText: { color: "#fff",
     fontSize: 16,
      fontWeight: "bold"
     },
  header: { fontSize: 20,
     fontWeight: "bold", 
     marginTop: 10, 
     color: "#1B5E20" 
    },
  item: { flexDirection: "row", alignItems: "center", marginVertical: 5 },
  text: { marginLeft: 10, fontSize: 16 },
});


export default PrescriptionChecklist;
