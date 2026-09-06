import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, Dimensions, TextInput, TouchableWithoutFeedback} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Asset } from 'expo-asset';
import BlueBoxes  from './blue-box-grid';

// The bundled replay_video.mov's native pixel dimensions (portrait), used to compute
// the "contain" letterbox size below so the video can be shifted up by exactly that
// amount — hiding it behind the header instead of leaving a visible top bar.
const VIDEO_NATIVE_WIDTH = 886;
const VIDEO_NATIVE_HEIGHT = 1348;
const ZOOM_MULTIPLIER = 1.045; // ~0.44 -> ~0.46 effective scale, a small/precise bump

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const EFFECTIVE_SCALE = (SCREEN_WIDTH / VIDEO_NATIVE_WIDTH) * ZOOM_MULTIPLIER;
const CONTENT_HEIGHT = VIDEO_NATIVE_HEIGHT * EFFECTIVE_SCALE;
const TOP_LETTERBOX = (SCREEN_HEIGHT - CONTENT_HEIGHT) / 2;

const App = () => {
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const player = useVideoPlayer(videoUri, (player) => {
        player.loop = true;
        player.play();
    });
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const loadVideo = async () => {
            const asset = Asset.fromModule(require('../../../assets/video/replay_video.mov'));
            await asset.downloadAsync();
            setVideoUri(asset.localUri);
        };

        loadVideo();

        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatDate = (date: Date) => {
        const month = date.getMonth() + 1; // Months are zero-based
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString();
    };
    const [zlText, setZlText] = useState('ZL'); // Initialize with default text
    const [isBlueBoxesVisible, setIsBlueBoxesVisible] = useState(false); // Initialize with true
    const [typeOfPassText, settypeOfPassText] = useState('4-1'); // Initialize with default text
    const [dayPassText, setDayPassText] = useState('Day Pass'); // Initialize with default text

    return (
        <View style={styles.container}>
            {/* Blue Top Section */}
            <View style={styles.blueTop} />

            {/* Top Section with typeOfPass, ZL, and Date/Time */}
            <View style={styles.header}>
                <View style={styles.leftContainer}>
                    <TextInput
                        style={styles.typeOfPassText} // Style for input
                        value={typeOfPassText}
                        onChangeText={settypeOfPassText} // Update state on text change
                        maxLength={3} // Limit input length to 3 characters
                        keyboardType="default" // You can adjust based on your needs
                        textAlign="center" // Center the text in the input
                    />
                    <TextInput
                        style={styles.dayPassText}
                        value={dayPassText}
                        onChangeText={setDayPassText}
                        maxLength={20}
                        keyboardType="default"
                    />
                    <Text style={styles.dateText}>{formatDate(currentTime)}</Text>
                </View>

                <View style={styles.rightContainer}>
                    <View style={styles.circle}>
                        <TextInput
                            style={styles.zlText} // Style for input
                            value={zlText}
                            onChangeText={setZlText} // Update state on text change
                            maxLength={2} // Limit input length to 2 characters
                            keyboardType="default" // You can adjust based on your needs
                            textAlign="center" // Center the text in the input
                        />
                    </View>
                    <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                </View>
            </View>
            <TouchableWithoutFeedback onPress={() => setIsBlueBoxesVisible(!isBlueBoxesVisible)} >
            <View style={styles.videoContainer}>
                <VideoView
                    player={player}
                    style={styles.video} // Move the video up
                    contentFit="contain"
                    nativeControls
                    pointerEvents="none" // Disable touch events
                />
                <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}>
                    {isBlueBoxesVisible && <BlueBoxes />}
                </View>
            </View>
            </TouchableWithoutFeedback>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    blueTop: {
        height: 70,
        backgroundColor: '#213A78',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        height: 200,
    },
    leftContainer: {
        justifyContent: 'space-between'
    },
    typeOfPassText: {
        fontSize: 60,
        fontWeight: '800',
        color: '#3880ff',
    },
    dayPassText: {
        fontSize: 35,
        color: '#3880ff',
        fontWeight: '800',
    },
    dateText: {
        fontSize: 25,
        color: '#000',
        marginTop: 5,
        fontWeight:'700'
    },
    rightContainer: {
        justifyContent: 'space-between',
        alignItems: 'flex-end',

    },
    circle: {
        width: 130,
        height: 70,
        borderRadius: 50,
        backgroundColor: '#0e2969', // Change for visibility
        justifyContent: 'center',
        alignItems: 'center',
    },
    zlText: {
        color: '#fff',
        fontSize: 60,
        fontWeight: '600',
    },
    timeText: {
        fontSize: 25,
        color: '#000',
        fontWeight:'700'
    },
    videoContainer: {
        height: Dimensions.get('window').height, // Height of the visible video area
        overflow: 'hidden', // Hide the overflow
        width: Dimensions.get('window').width,
        backgroundColor: '#000',
    },
    video: {
        width: '100%',
        // contentFit="contain" gives a base scale of screenWidth/videoWidth (~0.44);
        // ZOOM_MULTIPLIER bumps that to ~0.46 (small, precise, per request). Shifting
        // up by exactly the resulting top letterbox hides it behind the header, so
        // only a bottom black bar remains rather than bars on both sides.
        height: SCREEN_HEIGHT,
        marginTop: -TOP_LETTERBOX,
        transform: [{ scale: ZOOM_MULTIPLIER }],
    },
});

export default App;