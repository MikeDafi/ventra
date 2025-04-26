import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 20, marginBottom: 20 }}>Choose a subapp:</Text>
            <Link href="/subapps/transit-pass/main" asChild>
                <Pressable>
                    <Text style={{ fontSize: 25, color: 'blue' }}>🚌 Transit Pass</Text>
                </Pressable>
            </Link>
            <Link href="/subapps/ticket-maker" asChild>
                <Pressable>
                    <Text style={{ fontSize: 25, color: 'blue' }}>🎫 Ticket Maker</Text>
                </Pressable>
            </Link>
        </View>
    );
}