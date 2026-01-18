import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useListStore } from '../stores/listStore';
import { Field, FieldType } from '../types';
import IconPicker from '../components/IconPicker';
import ColorPicker from '../components/ColorPicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

type Props = NativeStackScreenProps<RootStackParamList, 'EditList'>;

export default function EditListScreen({ route, navigation }: Props) {
    const { list } = route.params;
    const { updateList } = useListStore();

    const [listName, setListName] = useState(list.name);
    const [selectedIcon, setSelectedIcon] = useState(list.icon);
    const [selectedColor, setSelectedColor] = useState(list.color);
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [fields, setFields] = useState<Field[]>(list.schema.fields);
    const [currentField, setCurrentField] = useState({
        name: '',
        type: 'text' as FieldType,
        required: false,
    });

    const addField = () => {
        if (!currentField.name.trim()) {
            Alert.alert('Error', 'Field name is required');
            return;
        }

        setFields([...fields, { ...currentField }]);
        setCurrentField({ name: '', type: 'text', required: false });
    };

    const removeField = (index: number) => {
        Alert.alert(
            'Remove Field',
            'Removing this field will delete its data from all items. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => setFields(fields.filter((_, i) => i !== index)),
                },
            ]
        );
    };

    const handleSave = async () => {
        if (!listName.trim()) {
            Alert.alert('Error', 'Collection name is required');
            return;
        }

        if (fields.length === 0) {
            Alert.alert('Error', 'Collection must have at least one field');
            return;
        }

        await updateList(list.id, {
            name: listName,
            schema: { fields },
            color: selectedColor,
            icon: selectedIcon,
        });
        navigation.goBack();
    };

    return (
        <KeyboardAwareScrollView
            style={styles.container}
            enableOnAndroid={true}
            extraScrollHeight={20}
        >
            <View style={styles.section}>
                <Text style={styles.label}>Collection Name</Text>
                <TextInput
                    style={styles.input}
                    value={listName}
                    onChangeText={setListName}
                    placeholder="e.g., Contacts, Books, Movies"
                    placeholderTextColor="#9ca3af"
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Appearance</Text>
                <View style={styles.appearanceRow}>
                    <TouchableOpacity
                        style={styles.appearanceButton}
                        onPress={() => setShowIconPicker(true)}
                    >
                        <Text style={styles.appearanceLabel}>Icon</Text>
                        <Text style={styles.appearanceValue}>{selectedIcon}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.appearanceButton}
                        onPress={() => setShowColorPicker(true)}
                    >
                        <Text style={styles.appearanceLabel}>Color</Text>
                        <View style={[styles.colorPreview, { backgroundColor: selectedColor }]} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Fields</Text>

                {fields.map((field, index) => (
                    <View key={index} style={styles.fieldCard}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.fieldName}>{field.name}</Text>
                            <Text style={styles.fieldMeta}>
                                {field.type} • {field.required ? 'Required' : 'Optional'}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => removeField(index)}>
                            <Text style={styles.removeButton}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                <Text style={styles.addNewLabel}>Add New Field</Text>
                <View style={styles.fieldInputContainer}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        value={currentField.name}
                        onChangeText={(text) => setCurrentField({ ...currentField, name: text })}
                        placeholder="Field name (e.g., EMAIL, PHONE)"
                        placeholderTextColor="#9ca3af"
                    />

                    <View style={styles.typeSelector}>
                        {(['text', 'number', 'date', 'boolean'] as FieldType[]).map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.typeButton,
                                    currentField.type === type && styles.typeButtonActive,
                                ]}
                                onPress={() => setCurrentField({ ...currentField, type })}
                            >
                                <Text
                                    style={[
                                        styles.typeButtonText,
                                        currentField.type === type && styles.typeButtonTextActive,
                                    ]}
                                >
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.requiredToggle}
                        onPress={() =>
                            setCurrentField({ ...currentField, required: !currentField.required })
                        }
                    >
                        <Text style={styles.requiredText}>
                            {currentField.required ? '✓ Required' : 'Optional'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.addFieldButton} onPress={addField}>
                        <Text style={styles.addFieldButtonText}>Add Field</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>

            <IconPicker
                visible={showIconPicker}
                selectedIcon={selectedIcon}
                onSelect={setSelectedIcon}
                onClose={() => setShowIconPicker(false)}
            />

            <ColorPicker
                visible={showColorPicker}
                selectedColor={selectedColor}
                onSelect={setSelectedColor}
                onClose={() => setShowColorPicker(false)}
            />
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    section: {
        padding: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    addNewLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
        marginTop: 16,
        marginBottom: 12,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#111827',
    },
    appearanceRow: {
        flexDirection: 'row',
        gap: 12,
    },
    appearanceButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    appearanceLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 8,
    },
    appearanceValue: {
        fontSize: 32,
    },
    colorPreview: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    fieldCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    fieldName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    fieldMeta: {
        fontSize: 12,
        color: '#6b7280',
        textTransform: 'capitalize',
    },
    removeButton: {
        color: '#ef4444',
        fontWeight: '600',
        fontSize: 14,
    },
    fieldInputContainer: {
        gap: 12,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 8,
    },
    typeButton: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        alignItems: 'center',
    },
    typeButtonActive: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    typeButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'capitalize',
    },
    typeButtonTextActive: {
        color: '#fff',
    },
    requiredToggle: {
        padding: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        alignItems: 'center',
    },
    requiredText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    addFieldButton: {
        padding: 12,
        backgroundColor: '#10b981',
        borderRadius: 8,
        alignItems: 'center',
    },
    addFieldButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        margin: 16,
        padding: 16,
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});