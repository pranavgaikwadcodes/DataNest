import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Switch,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useListStore } from '../stores/listStore';
import { z } from 'zod';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

type Props = NativeStackScreenProps<RootStackParamList, 'AddItem'>;

export default function AddItemScreen({ route, navigation }: Props) {
    const { list } = route.params;
    const { createItem } = useListStore();

    const [formData, setFormData] = useState<Record<string, any>>(() => {
        const initialData: Record<string, any> = {};
        list.schema.fields.forEach((field) => {
            initialData[field.name] = field.type === 'boolean' ? false : '';
        });
        return initialData;
    });

    const updateField = (fieldName: string, value: any) => {
        setFormData({ ...formData, [fieldName]: value });
    };

    const validateAndSubmit = async () => {
        // Build Zod schema dynamically
        const schemaShape: Record<string, z.ZodTypeAny> = {};

        list.schema.fields.forEach((field) => {
            let fieldSchema: z.ZodTypeAny;

            switch (field.type) {
                case 'text':
                    fieldSchema = z.string();
                    break;
                case 'number':
                    fieldSchema = z.string().refine(
                        (val) => val === '' || !isNaN(Number(val)),
                        { message: 'Must be a valid number' }
                    );
                    break;
                case 'date':
                    fieldSchema = z.string();
                    break;
                case 'boolean':
                    fieldSchema = z.boolean();
                    break;
                default:
                    fieldSchema = z.string();
            }

            if (field.required) {
                if (field.type === 'boolean') {
                    schemaShape[field.name] = fieldSchema;
                } else {
                    schemaShape[field.name] = fieldSchema.refine(
                        (val) => val !== '' && val !== null && val !== undefined,
                        { message: `${field.name} is required` }
                    );
                }
            } else {
                schemaShape[field.name] = fieldSchema.optional();
            }
        });

        const itemSchema = z.object(schemaShape);

        try {
            const validatedData = itemSchema.parse(formData);

            // Convert number strings to actual numbers
            const processedData: Record<string, any> = {};
            list.schema.fields.forEach((field) => {
                const value = validatedData[field.name];
                if (field.type === 'number' && value !== '' && value !== undefined) {
                    processedData[field.name] = Number(value);
                } else {
                    processedData[field.name] = value;
                }
            });

            await createItem(list.id, processedData);
            navigation.goBack();
        } catch (error) {
            if (error instanceof z.ZodError) {
                Alert.alert('Validation Error', error.issues[0].message);
            } else {
                Alert.alert('Error', 'Failed to add item');
            }
        }
    };

    const renderField = (field: typeof list.schema.fields[0]) => {
        switch (field.type) {
            case 'boolean':
                return (
                    <View style={styles.fieldContainer} key={field.name}>
                        <View style={styles.switchRow}>
                            <Text style={styles.label}>
                                {field.name}
                                {field.required && <Text style={styles.required}> *</Text>}
                            </Text>
                            <Switch
                                value={formData[field.name]}
                                onValueChange={(value) => updateField(field.name, value)}
                            />
                        </View>
                    </View>
                );

            case 'number':
                return (
                    <View style={styles.fieldContainer} key={field.name}>
                        <Text style={styles.label}>
                            {field.name}
                            {field.required && <Text style={styles.required}> *</Text>}
                        </Text>
                        <TextInput
                            style={styles.input}
                            value={formData[field.name]}
                            onChangeText={(value) => updateField(field.name, value)}
                            placeholder={`Enter ${field.name.toLowerCase()}`}
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                        />
                    </View>
                );

            case 'date':
                return (
                    <View style={styles.fieldContainer} key={field.name}>
                        <Text style={styles.label}>
                            {field.name}
                            {field.required && <Text style={styles.required}> *</Text>}
                        </Text>
                        <TextInput
                            style={styles.input}
                            value={formData[field.name]}
                            onChangeText={(value) => updateField(field.name, value)}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor="#9ca3af"
                        />
                        <Text style={styles.hint}>Format: YYYY-MM-DD</Text>
                    </View>
                );

            default: // text
                return (
                    <View style={styles.fieldContainer} key={field.name}>
                        <Text style={styles.label}>
                            {field.name}
                            {field.required && <Text style={styles.required}> *</Text>}
                        </Text>
                        <TextInput
                            style={styles.input}
                            value={formData[field.name]}
                            onChangeText={(value) => updateField(field.name, value)}
                            placeholder={`Enter ${field.name.toLowerCase()}`}
                            placeholderTextColor="#9ca3af"
                        />
                    </View>
                );
        }
    };

    return (
        <KeyboardAwareScrollView
            style={styles.container}
            enableOnAndroid={true}
            extraScrollHeight={20}
        >
            <View style={styles.content}>
                <Text style={styles.title}>Add Item to {list.name}</Text>

                {list.schema.fields.map(renderField)}

                <TouchableOpacity style={styles.submitButton} onPress={validateAndSubmit}>
                    <Text style={styles.submitButtonText}>Add Item</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 24,
    },
    fieldContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    required: {
        color: '#ef4444',
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
    hint: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
    },
    submitButton: {
        marginTop: 8,
        padding: 16,
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});