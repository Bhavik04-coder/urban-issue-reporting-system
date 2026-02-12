import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';

const MapViewScreen: React.FC = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.placeholder}>
                <Text style={styles.text}>Map is not available on web</Text>
                <Text style={styles.subtext}>Please use the mobile app for full map functionality.</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    placeholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    subtext: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
    },
});

export default MapViewScreen;
