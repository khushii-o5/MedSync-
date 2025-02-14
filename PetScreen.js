import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
import axios from "axios";

const BACKEND_URL = "http://IP_ADDRESS:5001";

const activityOptions = {
  feeding: ["1 meal", "2 meals", "3 meals"],
  playing: ["15 min", "30 min", "1 hour"],
  walking: ["10 min", "20 min", "30 min"],
};

const PetActivityTracker = () => {
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(null);
  const [activity, setActivity] = useState(null);
  const [option, setOption] = useState(null);

  const [lastActivity, setLastActivity] = useState(null); // Added state for activity summary


  const fetchUserId = async () => {
    if (!username) {
      Alert.alert("Oops!", "Please enter a username.");
      return;
    }
    try {
      const response = await axios.get(`${BACKEND_URL}/users/get-id?username=${username}`);
      setUserId(response.data.userId);
      Alert.alert("Yay!", "User ID fetched successfully!");
    } catch (error) {
      Alert.alert("Oops!", "Failed to fetch user ID.");
    }
  };
  
  const submitLog = async () => {
    if (!userId) {
      Alert.alert("Oops!", "Please fetch user ID first.");
      return;
    }
    if (!activity || !option) {
      Alert.alert("Oops!", "Please select an activity and an option.");
      return;
    }
  
    const duration = parseInt(option.match(/\d+/)[0]);
  
    try {
      const response = await axios.post(`${BACKEND_URL}/api/activities`, { userId, type: activity, duration });
  
      if (response.status >= 200 && response.status < 300) {  // Ensure request success
        setLastActivity(`🐕 ${activity.charAt(0).toUpperCase() + activity.slice(1)} - ${option}`); // Update activity summary
        Alert.alert("Success!", "Activity logged successfully! 🐾");
      } else {
        Alert.alert("Oops!", "Something went wrong while logging activity.");
      }
    } catch (error) {
      console.error("Error logging activity:", error);
      Alert.alert("Oops!", "Failed to log activity. Please try again.");
    }
  };
  
  

  return (
    <View style={styles.container}>
      <Image source={require("../assets/paw2.png")} style={styles.logo} />
      <Text style={styles.title}>🐾 Pet Activity Tracker 🐾</Text>

      <Text style={styles.label}>Enter Username:</Text>
      <TextInput 
        style={styles.input}
        placeholder="Enter your username"
        value={username}
        onChangeText={setUsername}
      />
      <TouchableOpacity style={styles.actionButton} onPress={fetchUserId}>
        <Text style={styles.buttonText}>Fetch User ID</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Select Activity:</Text>
      <View style={styles.buttonContainer}>
        {Object.keys(activityOptions).map((act) => (
          <TouchableOpacity
            key={act}
            style={[styles.activityButton, activity === act && styles.selectedButton]}
            onPress={() => { setActivity(act); setOption(null); }}>
            <Text style={styles.buttonText}>{act.charAt(0).toUpperCase() + act.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activity && (
        <View>
          <Text style={styles.label}>Select Option:</Text>
          <View style={styles.buttonContainer}>
            {activityOptions[activity].map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.optionButton, option === opt && styles.selectedButton]}
                onPress={() => setOption(opt)}>
                <Text style={styles.buttonText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.logButton} onPress={submitLog}>
        <Text style={styles.buttonText}>Log Activity 🐶</Text>
      </TouchableOpacity>
      {lastActivity && (
  <View style={styles.summaryCard}>
    <Text style={styles.summaryHeading}>Last Activity </Text>
    <Text style={styles.summaryText}>{lastActivity}</Text>
  </View>
)}
 
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding:20,
    paddingTop: 60,
    backgroundColor: "#E8F5E9" // Light pastel mint green
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#0D47A1", // Deep green (heading)
    marginBottom: 20
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#424242" // Dark gray
  },
  input: {
    borderWidth: 1,
    borderColor: "#F5F5F5", // Light gray
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#FFFFFF" // White for input background
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 10
  },
  activityButton: {
    backgroundColor: "#90CAF9", // Light Orange/Amber
    padding: 12,
    margin: 5,
    borderRadius: 20,
  },
  optionButton: {
    backgroundColor: "#90CAF9", // Light Blue
    padding: 12,
    margin: 5,
    borderRadius: 20,
  },
  selectedButton: {
    backgroundColor: "#5C6BC0", // Darker Blue/Purple (for Selected)
  },
  actionButton: {
    backgroundColor: "#0D47A1", // Light Purple/Thistle
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 10,
  },
  logButton: {
    backgroundColor: "#0D47A1", // Light Cyan/Blue
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 10
  },
  summaryContainer: {
    alignItems: "center",
    marginTop: 25
  },
  summaryCard: {
    backgroundColor: "#FFFFFF", // White
    padding: 15,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#F5F5F5", // Light gray
    elevation: 5, // For Android
    alignItems: "center",
    marginTop: 25,
    width: "85%",
    alignSelf: "center"
  },
  summaryHeading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0D47A1", // Deep green (heading)
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#424242", // Dark gray
  }
});

export default PetActivityTracker;




