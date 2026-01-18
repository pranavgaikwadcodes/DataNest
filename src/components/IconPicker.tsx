import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';

const ICONS = ['📦', '📝', '📚', '🎬', '🎵', '🏃', '💼', '🏠', '✈️', '🍔', '💰', '🎯', '⚡', '🌟', '🎨', '📱', '💻', '🔧', '🎮', '📷'];

interface IconPickerProps {
    visible: boolean;
    selectedIcon: string;
    onSelect: (icon: string) => void;
    onClose: () => void;
}

export default function IconPicker({ visible, selectedIcon, onSelect, onClose }: IconPickerProps) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <View style={styles.container} onStartShouldSetResponder={() => true}>
                    <Text style={styles.title}>Choose an Icon</Text>
                    <ScrollView contentContainerStyle={styles.grid}>
                        {ICONS.map((icon) => (
                            <TouchableOpacity
                                key={icon}
                                style={[styles.iconButton, selectedIcon === icon && styles.iconButtonSelected]}
                                onPress={() => {
                                    onSelect(icon);
                                    onClose();
                                }}
                            >
                                <Text style={styles.iconText}>{icon}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
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
        maxHeight: '70%',
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
    iconButton: {
        width: 60,
        height: 60,
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    iconButtonSelected: {
        borderColor: '#3b82f6',
        backgroundColor: '#dbeafe',
    },
    iconText: {
        fontSize: 32,
    },
});