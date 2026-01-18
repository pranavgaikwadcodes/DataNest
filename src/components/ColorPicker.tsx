import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

const COLORS = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Green', value: '#10b981' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Gray', value: '#6b7280' },
];

interface ColorPickerProps {
    visible: boolean;
    selectedColor: string;
    onSelect: (color: string) => void;
    onClose: () => void;
}

export default function ColorPicker({ visible, selectedColor, onSelect, onClose }: ColorPickerProps) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <View style={styles.container} onStartShouldSetResponder={() => true}>
                    <Text style={styles.title}>Choose a Color</Text>
                    <View style={styles.grid}>
                        {COLORS.map((color) => (
                            <TouchableOpacity
                                key={color.value}
                                style={styles.colorButton}
                                onPress={() => {
                                    onSelect(color.value);
                                    onClose();
                                }}
                            >
                                <View style={[
                                    styles.colorCircle,
                                    { backgroundColor: color.value },
                                    selectedColor === color.value && styles.colorCircleSelected
                                ]}>
                                    {selectedColor === color.value && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </View>
                                <Text style={styles.colorName}>{color.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        maxWidth: 350,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
        textAlign: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    colorButton: {
        alignItems: 'center',
        width: '30%',
    },
    colorCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    colorCircleSelected: {
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    checkmark: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    colorName: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
    },
});