import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function IMessageHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>💬 iMessage Maker</Text>

      <Link href="/subapps/imessage/chatList" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>💾 View Saved Chats</Text>
        </Pressable>
      </Link>

      <Link href="/subapps/imessage/form" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>➕ Create New Chat</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 40, textAlign: 'center' },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, marginBottom: 20 },
  buttonText: { color: 'white', fontSize: 18, textAlign: 'center' },
});
