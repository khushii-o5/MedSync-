import React, { useState, useEffect } from 'react';
import { View,Image,Modal,FlatList, SafeAreaView, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, TextInput, Button } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as ImagePicker from "expo-image-picker";
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";

const Tab = createBottomTabNavigator();

const affirmationsList = [
  "My body is strong, my spirit is light, I embrace wellness with all my might.",
  "I focus on health, I set my intent, on well-being, my energy is spent.",
  "I release all worries, I let go of fear, my mind is clear, my path is near.",
];

const HomeScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [affirmation, setAffirmation] = useState('');
  const [reportName, setReportName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    setAffirmation(affirmationsList[Math.floor(Math.random() * affirmationsList.length)]);
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const savedReports = await AsyncStorage.getItem("reports");
      if (savedReports) {
        setReports(JSON.parse(savedReports));
      }
    } catch (error) {
      console.error("Error loading reports:", error);
    }
  };

  const saveReports = async (newReports) => {
    try {
      await AsyncStorage.setItem("reports", JSON.stringify(newReports));
      setReports(newReports);
    } catch (error) {
      console.error("Error saving reports:", error);
    }
  };

  const pickReport = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
      aspect: [5, 6]
    });

    if (!result.canceled) {
      const newReport = { uri: result.assets[0].uri, name: reportName };
      saveReports([...reports, newReport]);
      setReportName('');
    }
  };

  const captureReport = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
      aspect: [5, 6]
    });

    if (!result.canceled) {
      const newReport = { uri: result.assets[0].uri, name: reportName };
      saveReports([...reports, newReport]);
      setReportName('');
    }
  };

  const deleteReport = (index) => {
    const updatedReports = reports.filter((_, i) => i !== index);
    saveReports(updatedReports);
  };

  const openPreview = (uri) => {
    setSelectedImage(uri);
    setModalVisible(true);
  };

  return (
    
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>MedSync+</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Ionicons name="person-circle-outline" size={30} color="#1565C0" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.affirmationCard}>
      <Text style={styles.greeting}>Good Morning!</Text>
        <Text style={styles.affirmationText}>{affirmation}</Text>
      </View >
      <View style={styles.affirmationCard}>
      <Text style={styles.greeting}>Medical Reports</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter report name"
        value={reportName}
        onChangeText={setReportName}
      />
      <TouchableOpacity onPress={pickReport} style={styles.button}>
        <Text style={styles.buttonText}>Select Report</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={captureReport} style={styles.button}>
        <Text style={styles.buttonText}>Capture Report</Text>
      </TouchableOpacity>
      <FlatList
        data={reports}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            <Image source={{ uri: item.uri }} style={{ width: 100, height: 120, marginRight: 10 }} />
            <View>
              <Text style={styles.reportText}>{item.name || 'Unnamed Report'}</Text>
              <TouchableOpacity onPress={() => deleteReport(index)} style={styles.button}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openPreview(item.uri)} style={styles.button}>
                <Text style={styles.buttonText}>Preview Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      </View>
      
      {/* Modal for image preview */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.fullImage} />
        </View>
      </Modal>

    </SafeAreaView>
  );
};




const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState({});
  const userName = "Khushi"; // Change dynamically as needed

  useEffect(() => {
    if (userName) {
      fetch(`http://IP_ADDRESS:8081/get-user/${userName}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setUserData(data);
            setUpdatedData({
              age: data.age,
              height: data.height,
              weight: data.weight,
              contact: data.contact,
              address: data.address,
            });
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [userName]);

  const handleUpdate = () => {
    fetch(`http://IP_ADDRESS:8081/update-user/${userName}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setUserData({ ...userData, ...updatedData });
          setEditing(false);
        }
      })
      .catch((err) => setError(err.message));
  };

  if (loading) return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
  if (error) return <Text style={styles.errorText}>{error}</Text>;

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 20 }}>
    <ScrollView style={styles.container}>
  
  <Text style={styles.profileHeader}>Profile</Text>
      {userData && (
        <View style={styles.profileCard}>
          {/* Non-editable fields */}
          <Text style={styles.profileText}><Text style={styles.boldText}>Name:</Text> {userData.name}</Text>
          <Text style={styles.profileText}><Text style={styles.boldText}>Blood Group:</Text> {userData.bloodType}</Text>

          {editing ? (
            <>
              <TextInput style={styles.input} value={updatedData.age} onChangeText={(text) => setUpdatedData({ ...updatedData, age: text })} placeholder="Age" />
              <TextInput style={styles.input} value={updatedData.height} onChangeText={(text) => setUpdatedData({ ...updatedData, height: text })} placeholder="Height" />
              <TextInput style={styles.input} value={updatedData.weight} onChangeText={(text) => setUpdatedData({ ...updatedData, weight: text })} placeholder="Weight" />
              <TextInput style={styles.input} value={updatedData.contact} onChangeText={(text) => setUpdatedData({ ...updatedData, contact: text })} placeholder="Contact" />
              <TextInput style={styles.input} value={updatedData.address} onChangeText={(text) => setUpdatedData({ ...updatedData, address: text })} placeholder="Address" />
              <Button title="Save Changes" onPress={handleUpdate} />
            </>
          ) : (
            <>
              <Text style={styles.profileText}><Text style={styles.boldText}>Age:</Text> {userData.age}</Text>
              <Text style={styles.profileText}><Text style={styles.boldText}>Height:</Text> {userData.height}</Text>
              <Text style={styles.profileText}><Text style={styles.boldText}>Weight:</Text> {userData.weight}</Text>
              <Text style={styles.profileText}><Text style={styles.boldText}>Contact:</Text> {userData.contact}</Text>
              <Text style={styles.profileText}><Text style={styles.boldText}>Address:</Text> {userData.address}</Text>
              <Button title="Edit" onPress={() => setEditing(true)} />
            </>
          )}
        </View>
      )}
      </ScrollView>

<TouchableOpacity
      onPress={() => navigation.goBack()}
      style={{
        position: "absolute",
        bottom: 30, // Keeps it visible
        left: "50%",
        transform: [{ translateX: -50 }], // Centers it
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: "#007AFF",
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#005BBB",
        elevation: 5, // Android shadow
        shadowColor: "#000", // iOS shadow
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      }}
    >
      <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>Go Back</Text>
    </TouchableOpacity>

    </SafeAreaView>
      
    
  );
};
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function App() {
  return (
    
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    
  );
}


const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#E8F5E9'
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    margin: 20 
  },
  appTitle: { 
    fontSize: 30, 
    fontWeight: 'bold', 
    color: '#0D47A1' 
  },
  greeting: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    // margin: 8, 
    marginBottom:30,
    color: '#1B5E20' 
  },
  affirmationCard: { 
    backgroundColor: '#F5F5F5', 
    padding: 15, 
    borderRadius: 12, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 6, 
    shadowOffset: { width: 0, height: 3 }, 
    // alignItems: 'center',
    margin: 20
  },
  affirmationText: { 
    fontSize: 20, 
    // fontStyle: 'italic', 
    color: '#333333', 
    textAlign: 'center' ,
    margin:15,
  },
  button: { 
    backgroundColor: '#1E88E5', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    margin: 10 
  },
  buttonText: { 
    color: '#ffffff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  profileHeader: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    margin: 15, 
    color: '#0D47A1' 
  },

  profileCard: { 
    backgroundColor: '#ffffff', 
    padding: 20, 
    borderRadius: 12, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 6, 
    shadowOffset: { width: 0, height: 3 } 
  },

  profileText: { 
    fontSize: 16, 
    marginBottom: 5, 
    color: '#424242' 
  },

  boldText: { 
    fontWeight: 'bold', 
    color: '#0D47A1' 
  },

  input: { 
    borderWidth: 1, 
    borderColor: '#90CAF9', 
    padding: 10, 
    margin:10,
    marginVertical: 8, 
    borderRadius: 8, 
    backgroundColor: '#fff' 
  },

  backButton: { 
    marginBottom: 10 
  },

  button: { 
    backgroundColor: '#0D47A1', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    margin: 10 
  },

  buttonText: { 
    color: '#ffffff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '90%',
    height: '80%',
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#FF4C4C', // Red for visibility (change if needed)
    padding: 10,
    borderRadius: 20,
  },
  buttonText: {
    color: 'white', // Ensure text is white
    fontWeight: 'bold',
    textAlign: 'center',
  }
});


