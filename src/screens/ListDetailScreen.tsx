import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TextInput,
    Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useListStore } from '../stores/listStore';

type Props = NativeStackScreenProps<RootStackParamList, 'ListDetail'>;

export default function ListDetailScreen({ route, navigation }: Props) {
    const { list } = route.params;
    const {
        items,
        loading,
        fetchItems,
        deleteItem,
        setCurrentList,
        deletedItem,
        undoDeleteItem,
        clearDeletedItem,
        getSortedItems,
        setSortBy,
        sortBy,
        sortField,
        sortOrder
    } = useListStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [showSortModal, setShowSortModal] = useState(false);

    useEffect(() => {
        setCurrentList(list);
        fetchItems(list.id);
    }, [list.id]);

    useEffect(() => {
        // Auto-dismiss undo notification after 5 seconds
        if (deletedItem) {
            const timer = setTimeout(() => {
                clearDeletedItem();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [deletedItem]);

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

    const sortedItems = getSortedItems();

    const filteredItems = sortedItems.filter((item) => {
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase();
        return list.schema.fields.some((field) => {
            const value = item.data[field.name];
            if (value === null || value === undefined) return false;
            return String(value).toLowerCase().includes(query);
        });
    });

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

    const handleSort = (field?: string) => {
        if (field) {
            const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
            setSortBy('field', field, newOrder);
        } else {
            const newOrder = sortBy === 'created_at' && sortOrder === 'asc' ? 'desc' : 'asc';
            setSortBy('created_at', undefined, newOrder);
        }
        setShowSortModal(false);
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
                <View style={{ flex: 1 }}>
                    <View style={styles.headerTop}>
                        <Text style={styles.listIcon}>{list.icon}</Text>
                        <Text style={styles.listName}>{list.name}</Text>
                    </View>
                    <Text style={styles.itemCount}>
                        {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
                        {searchQuery.trim() && items.length !== filteredItems.length &&
                            ` (${items.length} total)`}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.navigate('EditList', { list })}
                >
                    <Text style={styles.headerButtonText}>✏️ Edit</Text>
                </TouchableOpacity>
            </View>

            {/* Search and Add Item Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search items..."
                    placeholderTextColor="#9ca3af"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => setSearchQuery('')}
                    >
                        <Text style={styles.clearButtonText}>✕</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.sortButton}
                    onPress={() => setShowSortModal(true)}
                >
                    <Text style={styles.sortButtonText}>⇅</Text>
                </TouchableOpacity>
            </View>

            {/* Add Item Button */}
            <View style={styles.addItemContainer}>
                <TouchableOpacity
                    style={styles.addItemButton}
                    onPress={() => navigation.navigate('AddItem', { list })}
                >
                    <Text style={styles.addItemButtonText}>+ Add Item</Text>
                </TouchableOpacity>
            </View>

            {filteredItems.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>
                        {searchQuery.trim() ? 'No items found' : 'No items yet'}
                    </Text>
                    <Text style={styles.emptySubtext}>
                        {searchQuery.trim()
                            ? 'Try a different search term'
                            : 'Add your first item to get started'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredItems}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={[styles.itemCard, { borderLeftColor: list.color, borderLeftWidth: 4 }]}>
                            {list.schema.fields.map((field) => (
                                <View key={field.name} style={styles.fieldRow}>
                                    <Text style={styles.fieldLabel}>{field.name}</Text>
                                    {renderFieldValue(item.data[field.name], field.type)}
                                </View>
                            ))}
                            <View style={styles.itemActions}>
                                <TouchableOpacity
                                    style={styles.editItemButton}
                                    onPress={() => navigation.navigate('EditItem', { list, item })}
                                >
                                    <Text style={styles.editItemButtonText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteItem(item.id)}
                                >
                                    <Text style={styles.deleteButtonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    contentContainerStyle={styles.listContent}
                />
            )}

            {/* Undo Delete Snackbar */}
            {deletedItem && (
                <View style={styles.snackbar}>
                    <Text style={styles.snackbarText}>Item deleted</Text>
                    <TouchableOpacity onPress={undoDeleteItem}>
                        <Text style={styles.undoText}>UNDO</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Sort Modal */}
            <Modal visible={showSortModal} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowSortModal(false)}
                >
                    <View style={styles.sortModal} onStartShouldSetResponder={() => true}>
                        <Text style={styles.sortModalTitle}>Sort By</Text>

                        <TouchableOpacity
                            style={styles.sortOption}
                            onPress={() => handleSort()}
                        >
                            <Text style={styles.sortOptionText}>Date Created</Text>
                            {sortBy === 'created_at' && (
                                <Text style={styles.sortIndicator}>
                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        {list.schema.fields.map((field) => (
                            <TouchableOpacity
                                key={field.name}
                                style={styles.sortOption}
                                onPress={() => handleSort(field.name)}
                            >
                                <Text style={styles.sortOptionText}>{field.name}</Text>
                                {sortBy === 'field' && sortField === field.name && (
                                    <Text style={styles.sortIndicator}>
                                        {sortOrder === 'asc' ? '↑' : '↓'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowSortModal(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
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
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    listIcon: {
        fontSize: 28,
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
        marginLeft: 36,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    headerButton: {
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    headerButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    addItemContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    addItemButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    addItemButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    searchContainer: {
        backgroundColor: '#fff',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#111827',
    },
    clearButton: {
        padding: 8,
    },
    clearButtonText: {
        fontSize: 20,
        color: '#6b7280',
    },
    sortButton: {
        width: 40,
        height: 40,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sortButtonText: {
        fontSize: 20,
        color: '#374151',
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
    itemActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    editItemButton: {
        flex: 1,
        padding: 8,
        backgroundColor: '#f3f4f6',
        borderRadius: 6,
        alignItems: 'center',
    },
    editItemButtonText: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 14,
    },
    deleteButton: {
        flex: 1,
        padding: 8,
        backgroundColor: '#fef2f2',
        borderRadius: 6,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#ef4444',
        fontWeight: '600',
        fontSize: 14,
    },
    snackbar: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#1f2937',
        padding: 16,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    snackbarText: {
        color: '#fff',
        fontSize: 14,
    },
    undoText: {
        color: '#3b82f6',
        fontWeight: '700',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    sortModal: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    sortModalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    sortOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        marginBottom: 8,
    },
    sortOptionText: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
    },
    sortIndicator: {
        fontSize: 20,
        color: '#3b82f6',
    },
    cancelButton: {
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#6b7280',
        fontWeight: '600',
    },
});