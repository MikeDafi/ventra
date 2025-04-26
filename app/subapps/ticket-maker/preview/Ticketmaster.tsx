import React, {useState} from 'react';
import {View, Text, StyleSheet, Dimensions, Image, ScrollView, Pressable} from 'react-native';
import { Video } from 'expo-av';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const TICKET_PADDING_RIGHT = 8;
const TICKET_MARGIN_LEFT = 8;
const TICKET_WIDTH = screenWidth - 35;

export default function TicketPreview({ data }) {
    const [videoHeight, setVideoHeight] = useState(200);
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <View style={styles.container}>
            <View style={styles.ticketWrapper}>
                <ScrollView
                    horizontal
                    style={{ height: screenHeight * .47 }}
                    scrollEnabled={data.seatNames?.split(',').length > 1}
                    snapToInterval={TICKET_WIDTH + TICKET_PADDING_RIGHT}
                    snapToAlignment="start"
                    decelerationRate="fast"
                    bounces={false}
                    scrollEventThrottle={16}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: TICKET_PADDING_RIGHT }}
                    onScroll={(event) => {
                        const index = Math.round(event.nativeEvent.contentOffset.x / (TICKET_WIDTH + TICKET_PADDING_RIGHT));
                        setActiveIndex(index);
                    }}
                >
                    {(data.seatNames?.split(',') || ['1']).map((seat, index) => (
                        <Pressable key={index} onPressIn={() => {}}>
                        <View  style={[styles.ticket, index === 0 ? {marginLeft: 15} : index === data.seatNames.split(',').length - 1 ? {marginRight: 5, marginLeft: TICKET_MARGIN_LEFT} : {marginLeft: TICKET_MARGIN_LEFT}]}>
                            {/* Background */}
                            {/* Half-circle notch */}
                            <View style={styles.notchContainer}>
                                <View style={styles.notch} />
                            </View>

                            {/* Top row aligned with notch */}
                            <View style={styles.headerBar}>
                                <Text style={styles.headerLogo}>ticketmaster</Text>
                                <View style={styles.dateTime}>
                                    <Text style={styles.time}>{data.timeOfEvent}</Text>
                                    <Text style={styles.date}>{data.dateOfEvent}</Text>
                                </View>
                            </View>

                            {/* Blue bar */}
                            <View style={styles.middleBar}>
                                <Image
                                    source={require('../../../../assets/ticketmaster_logo.jpeg')}
                                    style={{ width: 82, height: 82 }}
                                    resizeMode="contain"
                                />
                            </View>

                            {/* Ticket details */}
                            <View style={styles.details}>
                                <Text style={styles.venue}>{data.locationFieldName}</Text>
                                <Text style={styles.event} numberOfLines={1} adjustsFontSizeToFit>
                                    {data.eventName || 'Golden State Warriors vs. Orlando Magic'}
                                </Text>

                                <View style={styles.row}>
                                    <View style={styles.sectioncolumn}>
                                        <Text style={styles.label}>SECTION</Text>
                                        <Text style={styles.value}>{data.sectionName}</Text>
                                    </View>
                                    <View style={styles.rowNamecolumn}>
                                        <Text style={styles.label}>ROW</Text>
                                        <Text style={styles.value}>{data.rowName}</Text>
                                    </View>
                                    <View style={styles.seatNamecolumn}>
                                        <Text style={styles.label}>SEAT</Text>
                                        <Text style={styles.value}>{seat.trim()}</Text>
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <View style={styles.entryInfocolumn}>
                                        <Text style={styles.label}>ENTRY INFO</Text>
                                        <Text style={styles.value}>{data.entryInfo}</Text>
                                    </View>
                                    {data.ticketTypeName && data.ticketType && (
                                    <View style={styles.ticketTypeNamecolumn}>
                                        <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>{data.ticketTypeName}</Text>
                                        <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>{data.ticketTypeValue}</Text>
                                    </View>)}
                                </View>
                            </View>

                            <View style={styles.nfcIconContainer}>
                                <Image
                                    source={require('../../../../assets/nfc_icon.jpg')}
                                    style={styles.nfcIcon}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>
                        </Pressable>
                    ))}
                </ScrollView>
                {data.seatNames?.split(',').length > 1 && (
                    <View style={styles.dotsOverlay}>
                        {data.seatNames.split(',').map((_, index) => (
                            <Text
                                key={index}
                                style={[
                                    styles.dot,
                                    activeIndex === index ? styles.activeDot : styles.inactiveDot
                                ]}
                            >
                                •
                            </Text>
                        ))}
                    </View>
                )}
                {/* Fixed Video Below */}
                <View style={styles.videoWrapper}>
                    <Video
                        source={require('../../../../assets/video/hold_near_reader.mov')}
                        onLoad={({ naturalSize, size }) => {
                            const width = naturalSize?.width || size?.width;
                            const height = naturalSize?.height || size?.height;
                            if (width && height) {
                                const aspectRatio = width / height;
                                setVideoHeight(screenWidth / aspectRatio);
                            }
                        }}
                        style={{ width: screenWidth - 80, height: videoHeight }}
                        resizeMode="cover"
                        isLooping
                        shouldPlay
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
                                     container: {
                                         width: Dimensions.get('window').width,
                                         flex: 1,
                                         backgroundColor: '#f3f2f9',
                                         alignItems: 'center',
                                         justifyContent: 'flex-start',
                                         paddingTop: 40,
                                     },
                                     ticketWrapper: {
                                         marginTop: 35,
                                         width: '100%',
                                         alignItems: 'center',
                                     },
                                     ticket: {
                                         width: TICKET_WIDTH,
                                         height: screenHeight * 0.47,
                                         backgroundColor: '#20262e',
                                         borderRadius: 0,
                                         position: 'relative',
                                     },
                                     notchContainer: {
                                         alignItems: 'center',
                                         position: 'absolute',
                                         top: -7,
                                         width: '100%',
                                         zIndex: 10,
                                     },
                                     notch: {
                                         width: 60,
                                         height: 30,
                                         backgroundColor: '#f1f1f5',
                                         borderBottomLeftRadius:10000,
                                         borderBottomRightRadius: 10000,
                                         transform: [{ scaleY: 0.7 }],
                                     },
                                     headerBar: {
                                         marginTop: 20,
                                         paddingHorizontal: 15,
                                         flexDirection: 'row',
                                         justifyContent: 'space-between',
                                         alignItems: 'flex-start',
                                     },
                                     headerLogo: {
                                         color: 'white',
                                         fontSize: 20,
                                         fontStyle: 'italic',
                                         fontWeight: 'bold',
                                     },
                                     dateTime: {
                                         alignItems: 'flex-start',
                                     },
                                     time: {
                                         color: '#4788cd',
                                         fontSize: 12,
                                         fontWeight: '600',
                                         fontFamily: 'Helvetica',
                                     },
                                     date: {
                                         color: 'white',
                                         fontSize: 20,
                                         fontFamily: 'Helvetica',
                                     },
                                     middleBar: {
                                         backgroundColor: '#026CDF',
                                         height: 103,
                                         alignItems: 'center',
                                         justifyContent: 'center',
                                         marginTop: 12,
                                     },
                                     details: {
                                         paddingHorizontal: 15,
                                         paddingTop: 7
                                     },
                                     venue: {
                                         color: '#4788cd',
                                         fontSize: 11,
                                         fontWeight: '600',
                                         textTransform: 'uppercase',
                                         fontFamily: 'Helvetica',
                                     },
                                     event: {
                                         color: 'white',
                                         fontWeight: '400',
                                         fontSize: 25,
                                         fontFamily: 'Helvetica',
                                     },
                                     row: {
                                         flexDirection: 'row',
                                         justifyContent: 'space-between',
                                         marginTop: 13,
                                     },
                                     sectioncolumn: {
                                         alignItems: 'flex-start',
                                     },
                                     rowNamecolumn: {
                                         alignItems: 'flex-start',
                                     },
                                     seatNamecolumn: {
                                        alignItems: 'flex-end',
                                     },
                                     entryInfocolumn: {
                                         alignItems: 'flex-start',
                                     },
                                     ticketTypeNamecolumn: {
                                         alignItems: 'flex-start',
                                     },
                                     label: {
                                         color: '#4788cd',
                                         fontSize: 11,
                                         fontWeight: '600',
                                         marginBottom: 1,
                                         fontFamily: 'Helvetica'
                                     },
                                     value: {
                                         color: 'white',
                                         fontSize: 20,
                                         fontWeight: '400',
                                         fontFamily: 'Helvetica'
                                     },
                                     nfcIconContainer: {
                                         position: 'absolute',
                                         bottom: 0,
                                         right: 0,
                                     },
                                     nfcIcon: {
                                         width: 32,
                                         height: 32,
                                     },
                                     video: {
                                         width: Dimensions.get('window').width,
                                         height: 100,
                                         marginTop: 20,
                                     },
                                     videoWrapper: {
                                         width: screenWidth,
                                         alignItems: 'center',
                                         marginTop: 2,
                                     },
                                     dotsOverlay: {
                                         position: 'absolute',
                                         top: screenHeight * 0.47 + 3,
                                         width: '100%',
                                         flexDirection: 'row',
                                         justifyContent: 'center',
                                         alignItems: 'center',
                                         zIndex: 10,
                                     },
                                     dot: {
                                         fontSize: 28,  // Increased size for better visibility
                                         marginHorizontal: 2,
                                     },
                                     activeDot: {
                                         color: '#222',
                                         fontWeight: 'bold',
                                     },
                                     inactiveDot: {
                                         color: '#aaa',
                                     },
                                 });
