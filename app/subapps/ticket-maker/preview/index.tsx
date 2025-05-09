import React, { useLayoutEffect, useState, useRef } from 'react';
import {View, Pressable, Alert} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import TicketmasterPreview from './Ticketmaster';

const TIME_TO_ENABLE_GESTURE = 3000; // 3 seconds

export default function PreviewScreen() {
    const { ticketPayload = '{}', mode = 'preview' } = useLocalSearchParams();
    const ticket = JSON.parse(ticketPayload);
    const navigation = useNavigation();

    const [gestureEnabled, setGestureEnabled] = useState(mode === 'preview');
    const holdTimeout = useRef(null);

    useLayoutEffect(() => {
        navigation.setOptions({
                                  headerShown: false,
                                  gestureEnabled: gestureEnabled
                              });
    }, [navigation, gestureEnabled]);

    const handlePressIn = () => {
        holdTimeout.current = setTimeout(() => {
            if (gestureEnabled) {
                Alert.alert('Gesture Already Enabled', 'You can swipe to go back');
            } else {
                Alert.alert('Gesture Enabled', 'You can now swipe to go back');
                setGestureEnabled(true);
            }
        }, TIME_TO_ENABLE_GESTURE); // 5 seconds
    };

    const handlePressOut = () => {
        if (holdTimeout.current) {
            clearTimeout(holdTimeout.current);
        }
    };

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={{ flex: 1, backgroundColor: 'black' }}
        >
            <TicketmasterPreview data={ticket} />
        </Pressable>
    );
}