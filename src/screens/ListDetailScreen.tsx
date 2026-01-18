import React, { useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useListStore } from '../stores/listStore';

type Props = NativeStackScreenProps<RootStackParamList, 'ListDetail'>;

export default function ListDetailScreen({ route, navigation }: Props) {
    const { list } = route.params;
    const { items, loading, fetchItems, deleteItem, setCurrentList } = useListStore();

    useEffect(() => {
        setCurrentList(list);
        fetchItems(list.id);
    }, [list.id]);

    const handleDeleteItem = (itemId: string) => {
        Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => deleteItem(itemId),
            },
        ]);
    };

    const renderFieldValue = (value: any, type: string) => {
        if (value === null || value === undefined || value === '') {
            return <Text style={styles.fieldValueEmpty}>—</Text>;
        }

        switch (type) {
            case 'boolean':
                return <Text style={styles.fieldValue}>{value ? 'Yes' : 'No'}</Text>;
            case 'date':
                return <Text style={styles.fieldValue}>{new Date(value).toLocaleDateString()}</Text>;
            default:
                return <Text style={styles.fieldValue}>{String(value)}</Text>;
        }
    };

    if (loading && items.length === 0) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.listName}>{list.name}</Text>
                    <Text style={styles.itemCount}>
                        {items.length} item{items.length !== 1 ? 's' : ''}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddItem', { list })}
                >
                    <Text style={styles.addButtonText}>+ Add Item</Text>
                </TouchableOpacity>
            </View>

            {items.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>No items yet</Text>
                    <Text style={styles.emptySubtext}>Add your first item to get started</Text>
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.itemCard}>
                            {list.schema.fields.map((field) => (
                                <View key={field.name} style={styles.fieldRow}>
                                    <Text style={styles.fieldLabel}>{field.name}</Text>
                                    {renderFieldValue(item.data[field.name], field.type)}
                                </View>
                            ))}
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDeleteItem(item.id)}
                            >
                                <Text style={styles.deleteButtonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    listName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    itemCount: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    addButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9ca3af',
    },
    listContent: {
        padding: 16,
    },
    itemCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    fieldRow: {
        marginBottom: 12,
    },
    fieldLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    fieldValue: {
        fontSize: 16,
        color: '#111827',
    },
    fieldValueEmpty: {
        fontSize: 16,
        color: '#d1d5db',
        fontStyle: 'italic',
    },
    deleteButton: {
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    deleteButtonText: {
        color: '#ef4444',
        fontWeight: '600',
        fontSize: 14,
    },
});