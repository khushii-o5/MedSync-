import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Keyboard,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

const GEMINI_API_KEY = "GEMINI_API_KEY"; // 🔹 Replace with your API key

// 🔹 Replace with your API key

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const flatListRef = useRef(null);
  const [recording, setRecording] = useState(null);
  const [isrecording, setIsRecording] = useState(false);

  // Function to send text message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        { contents: [{ role: "user", parts: [{ text: input }] }] }
      );

      const botReply = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't process that.";
      const botMessage = { id: Date.now() + 1, text: botReply, sender: "bot" };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prevMessages) => [...prevMessages, { id: Date.now(), text: "Failed to get response.", sender: "bot" }]);
    }
  };

  // Function to request permissions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log(`Permission status: ${status}`);
    if (status !== "granted") {
      alert("Permission required to access the gallery.");
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  // Function to pick an image
  const pickImage = async () => {
    console.log("button clicked");
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log(`Permission status after button click: ${status}`);
    if (status !== "granted") {
      alert("Permission to access gallery is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    console.log(`ImagePicker result: ${JSON.stringify(result)}`);

    if (!result.canceled && result.assets.length > 0) {
      const userImage = { id: Date.now(), image: result.assets[0].uri, sender: "user" };
      console.log(`Selected image: ${JSON.stringify(userImage)}`);
      setMessages((prevMessages) => [...prevMessages, userImage]);

      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
          {
            contents: [
              { role: "user", parts: [{ text: "Analyze this image for medical concerns." }] },
              { role: "user", parts: [{ inlineData: { mimeType: "image/jpeg", data: result.assets[0].base64 } }] },
            ],
          }
        );

        const botReply = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't analyze this image.";
        const botMessage = { id: Date.now() + 1, text: botReply, sender: "bot" };
        console.log(`Bot reply: ${botReply}`);
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } catch (error) {
        console.error("Error fetching response:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: Date.now(), text: "Failed to process image.", sender: "bot" },
        ]);
      }
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.header}> {/* Add the header View */}
          <Text style={styles.headerText}>MediBuddy</Text> 
        </View>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[styles.messageContainer, item.sender === "user" ? styles.userMessage : styles.botMessage]}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.image} />
              ) : (
                <Text style={styles.messageText}>
  {                 typeof item.text === "string" ? item.text : JSON.stringify(item.text)}
                </Text>
              )}
            </View>
          )}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
  <Text style={styles.imageButtonText}>📷</Text>
</TouchableOpacity>


 
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerText:{
    fontSize: 30, 
    fontWeight: 'bold', 
    color: '#0D47A1' ,
    margin:10
  },
  safeArea: { 
    flex: 1, 
    backgroundColor: "#E8F5E9",// Light pastel mint green
  },
  container: { 
    flex: 1,
    backgroundColor: "#E8F5E9" ,//Match safe area or leave out if you want it to fill the entire screen
    
  },
  messageContainer: { 
    padding: 15, 
    borderRadius: 10, 
    marginVertical: 5, 
    maxWidth: "80%" 
  },
  userMessage: { 
    backgroundColor: "#1B5E20", // Deep green
    alignSelf: "flex-end" ,
    margin:20
  },
  botMessage: { 
    backgroundColor: "#0D47A1", // Dark gray
    alignSelf: "flex-start" ,
    margin:20
  },
  messageText: { 
    color: "#fff", 
    fontSize: 16 
  },
  inputContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 10, 
    backgroundColor: "#FFFFFF", // White
    borderTopWidth: 1, 
    borderColor: "#F5F5F5" // Light gray
  },
  input: { 
    flex: 1, 
    padding: 10, 
    fontSize: 16, 
    borderWidth: 1, 
    borderColor: "#F5F5F5", // Light gray
    borderRadius: 5,
    backgroundColor: "#FFFFFF", // White
    color: "#424242" // Dark gray for text

  },
  sendButton: { 
    backgroundColor: "#1B5E20", // Deep green
    padding: 10, 
    borderRadius: 5, 
    marginLeft: 10 
  },
  sendButtonText: { 
    color: "#fff", 
    fontWeight: "bold" 
  },
  imageButton: { 
    padding: 10, 
    borderRadius: 5, 
    backgroundColor: "#F5F5F5", // Light gray
    marginRight: 10 
  },
  imageButtonText: { 
    fontSize: 18,
    color: "#424242" // Dark gray
   },
  micButton: { 
    padding: 10, 
    borderRadius: 5, 
    backgroundColor: "#F5F5F5", // Light gray
    marginHorizontal: 10 
  },
  micButtonText: { 
    fontSize: 18,
    color: "#424242" // Dark gray
   },
  image: { 
    width: 200, 
    height: 200, 
    borderRadius: 10, 
    marginTop: 5 
  },
});
  
export default Chatbot;