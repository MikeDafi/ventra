import React, {useCallback, useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Pressable,
    Alert,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import {Stack, useFocusEffect, useRouter} from 'expo-router';
import {TICKET_FOLDER} from "@/app/subapps/ticket-maker/constants";

export default function TicketList() {
    const [files, setFiles] = useState<{ name: string; modified: number }[]>([]);
    const router = useRouter();

    const loadTickets = async () => {
        const allFiles = await FileSystem.readDirectoryAsync(TICKET_FOLDER);
        const ticketFiles = allFiles.filter(f => f.endsWith('.json'));

        const filesWithStats = await Promise.all(
            ticketFiles.map(async (file) => {
                const info = await FileSystem.getInfoAsync(TICKET_FOLDER + file);
                const content = await FileSystem.readAsStringAsync(TICKET_FOLDER + file);
                const parsed = JSON.parse(content);
                return {
                    name: file,
                    modified: info.modificationTime || 0,
                    ticketData: parsed,
                };
            })
        );

        const sortedFiles = filesWithStats.sort((a, b) => b.modified - a.modified);
        setFiles(sortedFiles);
    };

    useFocusEffect(
        useCallback(() => {
            loadTickets();
        }, [])
    );

    const deleteTicket = async (fileName: string) => {
        try {
            await FileSystem.deleteAsync(TICKET_FOLDER + fileName);
            loadTickets();
        } catch (err) {
            Alert.alert('Error', 'Could not delete file');
        }
    };

    const handlePreview = async (item: string, mode: 'preview' | 'inGame') => {
        const content = await FileSystem.readAsStringAsync(TICKET_FOLDER + item);
        console.log(content);
        router.push({
                        pathname: '/subapps/ticket-maker/preview',
                        params: { ticketPayload: content, mode },
                    });
    };

    const renderItem = ({ item }: { item: { name: string; modified: number; ticketData: any } }) => {
        const lastModified = new Date(item.modified * 1000);

        const formattedTime = lastModified.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
        const ticketName = `Sec ${item.ticketData.sectionName || '-'} / Row ${item.ticketData.rowName || '-'} / Seats ${item.ticketData.seatNames || '-'}`;

        return (
            <View style={styles.ticketCard}>
                <View style={styles.ticketHeaderRow}>
                    <View>
                        <Text style={styles.ticketName}>{ticketName}</Text>
                        <Text style={styles.subtitle}>{item.ticketData.eventName}</Text>
                    </View>
                    <View style={styles.modifiedContainer}>
                        <Text style={styles.modifiedText}>Edited:</Text>
                        <Text style={styles.modifiedText}>{formattedTime}</Text>
                    </View>
                </View>
                <View style={styles.buttonRow}>
                    <Pressable
                        style={({pressed}) => [styles.previewButton, pressed && styles.buttonPressed]}
                        onPress={() => handlePreview(item.name, 'preview')}
                    >
                        <Text style={styles.buttonText}>👁 Preview</Text>
                    </Pressable>
                    <Pressable
                        style={({pressed}) => [styles.inGameButton, pressed && styles.buttonPressed]}
                        onPress={() => handlePreview(item.name, 'inGame')}
                    >
                        <Text style={styles.inGameButtonText}>🎮 In-Game</Text>
                    </Pressable>
                    <Pressable
                        style={({pressed}) => [styles.editButton, pressed && styles.buttonPressed]}
                        onPress={async () => {
                            const content = await FileSystem.readAsStringAsync(TICKET_FOLDER + item.name);
                            router.push({
                                            pathname: '/subapps/ticket-maker/form',
                                            params: {ticketPayload: content, editMode: 'true'},
                                        });
                        }}
                    >
                        <Text style={styles.editButtonText}>✏️ Edit</Text>
                    </Pressable>
                    <Pressable
                        style={({pressed}) => [styles.deleteButton, pressed && styles.buttonPressed]}
                        onPress={() => {
                            Alert.alert('Confirm Delete',
                                        `Are you sure you want to delete ${item.name}?`,
                                        [{text: 'Cancel', style: 'cancel'}, {
                                            text: 'Delete',
                                            style: 'destructive',
                                            onPress: () => deleteTicket(item.name)
                                        },]);
                        }}
                    >
                        <Text style={styles.deleteButtonText}>🗑 Delete</Text>
                    </Pressable>
                </View>
            </View>);
    }

    return (
        <>

            <Stack.Screen options={{ title: '🎟 Your Ticket Library' }} />
            <View style={styles.container}>
                <Text style={styles.header}>🎟 Saved Tickets</Text>
                {files.length === 0 ? (
                    <Text style={styles.noTickets}>No tickets found</Text>
                ) : (
                    <FlatList
                        data={files}
                        keyExtractor={(item) => item.name}
                        renderItem={renderItem}
                    />
                )}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
                                     container: { flex: 1, padding: 20, backgroundColor: '#f7f8fc' },
                                     header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
                                     ticketCard: {
                                         backgroundColor: '#fff',
                                         borderRadius: 12,
                                         padding: 16,
                                         marginBottom: 15,
                                         shadowColor: '#000',
                                         shadowOffset: { width: 0, height: 2 },
                                         shadowOpacity: 0.1,
                                         shadowRadius: 4,
                                         elevation: 4,
                                     },
                                     ticketInfo: {
                                         marginBottom: 12,
                                     },
                                     ticketName: {
                                         fontSize: 18,
                                         fontWeight: '600',
                                         color: '#222',
                                     },
                                     buttonRow: {
                                         flexDirection: 'row',
                                         flexWrap: 'wrap',
                                     },
                                     previewButton: {
                                         backgroundColor: '#3366FF',
                                         paddingVertical: 10,
                                         paddingHorizontal: 8,
                                         borderRadius: 8,
                                         marginRight: 10,
                                     },
                                     inGameButton: {
                                         backgroundColor: '#EFEFEF',
                                         paddingVertical: 10,
                                         paddingHorizontal: 8,
                                         borderRadius: 8,
                                         marginRight: 10,
                                     },
                                     deleteButton: {
                                         backgroundColor: '#FF4D4F',
                                         paddingVertical: 10,
                                         paddingHorizontal: 8,
                                         borderRadius: 8,
                                     },
                                     buttonText: {
                                         color: 'white',
                                         fontWeight: '600',
                                         fontSize: 12
                                     },
                                     inGameButtonText: {
                                         color: '#333',
                                         fontWeight: '600',
                                         fontSize: 12
                                     },
                                     deleteButtonText: {
                                         color: 'white',
                                         fontWeight: '600',
                                         fontSize: 12
                                     },
                                     buttonPressed: {
                                         opacity: 0.7,
                                     },
                                     noTickets: {
                                         fontStyle: 'italic',
                                         color: '#666',
                                     },
                                     editButton: {
                                         backgroundColor: '#FFD700',
                                         paddingVertical: 10,
                                         paddingHorizontal: 8,
                                         borderRadius: 8,
                                         marginRight: 10,
                                     },
                                     editButtonText: {
                                         color: '#333',
                                         fontWeight: '600',
                                         fontSize: 12
                                     },
                                     modifiedContainer: {
                                         alignItems: 'flex-end',
                                     },
                                     modifiedText: {
                                         fontSize: 12,
                                         color: '#777',
                                         marginTop: 4,
                                     },
                                     ticketHeaderRow: {
                                         flexDirection: 'row',
                                         justifyContent: 'space-between',
                                         alignItems: 'center',
                                         marginBottom: 4,
                                     },
                                     subtitle: {
                                         fontSize: 11,
                                         color: '#555',
                                         marginBottom: 13,
                                     },
                                 });
