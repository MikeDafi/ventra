import React, {useEffect, useRef, useState} from 'react';
import {
    View, Text, TextInput, StyleSheet, ScrollView, Platform, Pressable, Alert, KeyboardAvoidingView,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as FileSystem from 'expo-file-system';
import {TICKET_FOLDER, COMMON_FIELDS} from "@/app/subapps/ticket-maker/constants";


const TICKET_SOURCES: Record<string, { specificFields: Field[] }> = {
    Ticketmaster: {
        specificFields: [
            { label: 'Entry Info*', key: 'entryInfo', required: true },
            { label: 'Ticket Type Name', key: 'ticketTypeName', default: "TICKET TYPE" },
            { label: 'Ticket Type Value', key: 'ticketTypeValue' },
        ],
    },
};

const generateEmptyFormValues = (): Record<string, string> => {
    const values: Record<string, string> = {};
    COMMON_FIELDS.concat(...Object.values(TICKET_SOURCES).flatMap(s => s.specificFields)).forEach(
        ({ key, default: def }) => {
            values[key] = def || '';
        }
    );
    return values;
};

export default function TicketForm() {
    const router = useRouter();
    const routeParams = useLocalSearchParams();
    const [ticketPayload, setTicketPayload] = useState(routeParams.ticketPayload ? JSON.parse(routeParams.ticketPayload as string) : {});
    const [open, setOpen] = useState(false);
    const [ticketSource, setTicketSource] = useState(
        (ticketPayload.ticketSource as string) || Object.keys(TICKET_SOURCES)[0] // Ticketmaster
    );
    const [ticketSourceItems, setTicketSourceItems] = useState(
        Object.keys(TICKET_SOURCES).map(source => ({
            label: source,
            value: source,
        }))
    );

    const [formValues, setFormValues] = useState<Record<string, string>>({
                                                                             ...generateEmptyFormValues(),
                                                                             ticketSource,
                                                                             ...ticketPayload,
                                                                         });
    const sourceFields = TICKET_SOURCES[ticketSource]?.specificFields || [];
    const inputRefs: Record<string, React.RefObject<TextInput>> = {};
    [...COMMON_FIELDS, ...sourceFields].forEach(({ key }) => {
        inputRefs[key] = useRef<TextInput>(null);
    });
    useEffect(() => {
        if (routeParams.ticketSource) {
            setTicketSource(routeParams.ticketSource as string);
        }
    }, [routeParams]);


    const handleChange = (key: string, value: string) => {
        setFormValues(prev => {
            const updated = { ...prev, [key]: value };

            // Update fileName if sectionName, rowName, or seatNames changes
            if (['sectionName', 'rowName', 'seatNames'].includes(key)) {
                const { sectionName, rowName, seatNames, dateOfEvent } = updated;
                if (sectionName && rowName && seatNames) {
                    const autoFilename = `${dateOfEvent || ''}__${sectionName}-${rowName}-Seat${seatNames.replaceAll(',', '_')}`;
                    updated.fileName = autoFilename;
                }
            }
            console.log('Updated form values:', updated);
            return updated;
        });
    };

    const isFieldValid = (key: string) => {
        const field = [...COMMON_FIELDS, ...sourceFields].find(f => f.key === key);
        if (field?.required) {
            return formValues[key]?.trim() !== '';
        }
        return true; // Non-required fields are always valid
    };

    const handleSave = async () => {
        const requiredFields = [...COMMON_FIELDS, ...sourceFields].filter(f => f.required);
        const missingFields = requiredFields.filter(f => !formValues[f.key]?.trim());

        if (missingFields.length > 0) {
            Alert.alert(
                'Missing Required Fields',
                `Please fill out: ${missingFields.map(f => f.label.replace('*', '')).join(', ')}`
            );
            return;
        }

        if (!formValues.fileName?.trim()) {
            Alert.alert('Error', 'File name cannot be empty');
            return;
        }

        // Sanitize fileName: remove spaces
        const sanitizedFileName = formValues.fileName.replace(/\s+/g, '_');
        const fileUri = `${TICKET_FOLDER}${sanitizedFileName}.json`;

        const folderInfo = await FileSystem.getInfoAsync(TICKET_FOLDER);
        if (!folderInfo.exists) {
            await FileSystem.makeDirectoryAsync(TICKET_FOLDER, { intermediates: true });
        }

        const fileExists = (await FileSystem.getInfoAsync(fileUri)).exists;
        const currentPayloadString = JSON.stringify(formValues, null, 2);

        if (fileExists) {
            const existingContent = await FileSystem.readAsStringAsync(fileUri);
            if (existingContent === currentPayloadString) {
                Alert.alert('No Changes', 'There are no differences from the existing saved ticket.');
                router.back(); // ✅ Go back if no changes
                return;
            }
        }

        try {
            await FileSystem.writeAsStringAsync(fileUri, currentPayloadString);
            Alert.alert('Saved!', `Ticket saved as ${sanitizedFileName}.json`);
            router.back(); // ✅ Go back after save
        } catch (err) {
            Alert.alert('Error', 'Could not save ticket: ' + err);
        }
    };

    return (
        <View style={{ flex: 1, paddingTop: 100 }}>
            <View style={styles.headerRow}>
                <Pressable
                    style={styles.button}
                    onPress={() => {
                        router.push({
                                        pathname: '/subapps/ticket-maker/preview',
                                        params: {
                                            ticketPayload: JSON.stringify(formValues),
                                        },
                                    });
                    }}
                >
                    <Text style={styles.buttonText}>👁 Preview</Text>
                </Pressable>
                <Pressable style={styles.button} onPress={handleSave}>
                    <Text style={styles.buttonText}>💾 Save</Text>
                </Pressable>
            </View>

            {/* Move this above the ScrollView */}
            <View style={{ paddingHorizontal: 20, zIndex: 1000 }}>
                <Text style={styles.label}>Ticket Source*</Text>
                <DropDownPicker
                    open={open}
                    value={ticketSource}
                    items={ticketSourceItems}
                    setOpen={setOpen}
                    setValue={(cb) => {
                        const selected = cb(ticketSource);
                        setTicketSource(selected);
                        handleChange('ticketSource', selected);
                    }}
                    setItems={setTicketSourceItems}
                    placeholder="Select a ticket source"
                    dropDownDirection="AUTO"
                    zIndex={1000}
                />
            </View>

            <KeyboardAwareScrollView
                contentContainerStyle={styles.container}
                extraScrollHeight={300}
                enableOnAndroid={true}
            >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <Text style={styles.header}>🎫 Create a New Ticket</Text>

                {[...COMMON_FIELDS, ...sourceFields].map(({ label, key, example }) => (
                    <View key={key} style={styles.inputGroup}>
                        <Text style={styles.label}>{label}</Text>
                        <TextInput
                            ref={inputRefs[key]}
                            returnKeyType="next"
                            onSubmitEditing={() => {
                                const fieldKeys = [...COMMON_FIELDS, ...sourceFields].map(f => f.key);
                                const currentIndex = fieldKeys.indexOf(key);
                                const nextKey = fieldKeys[currentIndex + 1];
                                if (nextKey && inputRefs[nextKey]) {
                                    inputRefs[nextKey].current?.focus();
                                }
                            }}
                            style={[
                                styles.input,
                                !isFieldValid(key) && styles.inputInvalid, // Add red border if not valid
                            ]}
                            value={formValues[key] || ''}
                            onChangeText={text => handleChange(key, text)}
                            placeholder={example || label.replace('*', '')}
                        />
                    </View>
                ))}
            </ScrollView>
            </KeyboardAwareScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
                                     container: {
                                         padding: 20,
                                         paddingBottom: 100,
                                     },
                                     header: {
                                         fontSize: 24,
                                         fontWeight: 'bold',
                                         marginVertical: 20,
                                     },
                                     inputGroup: {
                                         marginBottom: 16,
                                     },
                                     label: {
                                         fontWeight: '600',
                                         marginBottom: 4,
                                     },
                                     input: {
                                         borderWidth: 1,
                                         borderColor: '#ccc',
                                         paddingHorizontal: 10,
                                         paddingVertical: Platform.OS === 'ios' ? 12 : 8,
                                         borderRadius: 6,
                                     },
                                     pickerContainer: {
                                         marginBottom: 20,
                                     },
                                     pickerWrapper: {
                                         borderWidth: 1,
                                         borderColor: '#ccc',
                                         borderRadius: 6,
                                         overflow: 'hidden',
                                         height: 44, // ensures no overlap
                                         justifyContent: 'center',
                                     },
                                     picker: {
                                         height: 44,
                                         width: '100%',
                                     },
                                     headerRow: {
                                         flexDirection: 'row',
                                         justifyContent: 'space-between',
                                         paddingHorizontal: 20,
                                         paddingTop: 10,
                                     },
                                     footerRow: {
                                         flexDirection: 'row',
                                         justifyContent: 'space-around',
                                         marginTop: 40,
                                     },
                                     button: {
                                         backgroundColor: '#3366FF',
                                         padding: 12,
                                         borderRadius: 8,
                                         marginVertical: 8,
                                         paddingHorizontal: 20,
                                     },
                                     buttonText: {
                                         color: 'white',
                                         fontWeight: '600',
                                     },
                                     inputInvalid: {
                                         borderColor: 'red',
                                     },
                                 });
