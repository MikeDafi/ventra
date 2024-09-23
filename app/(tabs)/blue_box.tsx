import React, { useState } from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';

const BlueBox = ({ transparent }) => {
    return (
        <View style={[styles.blueBox, transparent && styles.transparent]}>
            <Text style={styles.text}></Text>
        </View>
    );
};

// Use BlueBox to have 3 rows of 3 boxes
const BlueBoxes = () => {
    const [boxStates] = useState(() => {
        const states = Array(9).fill(false); // Start with all boxes non-transparent
        const transparentIndices = new Set();

        while (transparentIndices.size < 4) {
            const randomIndex = Math.floor(Math.random() * 9);
            transparentIndices.add(randomIndex);
        }

        transparentIndices.forEach(index => {
            states[index] = true; // Set selected indices to true for transparency
        });

        return states;
    });

    const boxes = boxStates.map((transparent, index) => (
        <BlueBox key={index} transparent={transparent} />
    ));

    return <View style={styles.container}>{boxes}</View>;
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop:4
    },
    blueBox: {
        width: Dimensions.get('window').width / 3 - 12,
        // get container's height
        height: (Dimensions.get('window').height / 3) - 104,
        backgroundColor: '#4084fc',
        marginVertical:4,
        marginHorizontal:5.3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: 'white',
    },
    transparent: {
        backgroundColor: 'rgba(0, 0, 255, 0.3)', // Adjust opacity as needed
    }
});

export default BlueBoxes;