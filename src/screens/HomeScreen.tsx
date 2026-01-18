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
import { useAuthStore } from '../stores/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
    const { lists, loading, fetchLists, deleteList } = useListStore();
    const { user, signOut } = useAuthStore();

    useEffect(() => {
        fetchLists();
    }, []);

    const handleDeleteList = (listId: string, listName: string) => {
        Alert.alert(
            'Delete Collection',
            `Are you sure you want to delete "${listName}"? This will also delete all items in this collection.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteList(listId),
                },
            ]
        );
    };

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: signOut,
            },
        ]);
    };

    if (loading && lists.length === 0) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.title}>Collections</Text>
                    <Text style={styles.email} numberOfLines={1} ellipsizeMode="tail">
                        {user?.email}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.signOutButton}
                    onPress={handleSignOut}
                >
                    <Text style={styles.signOutButtonText}>Sign Out</Text>
                </TouchableOpacity>
            </View>

            {lists.length === 0 ? (
                <View style={styles.empty}>
                    <View style={styles.emptyIcon}>
                        <Text style={styles.emptyIconText}>📦</Text>
                    </View>
                    <Text style={styles.emptyText}>No collections yet</Text>
                    <Text style={styles.emptySubtext}>Create your first collection to get started</Text>
                    <TouchableOpacity
                        style={styles.emptyButton}
                        onPress={() => navigation.navigate('CreateList')}
                    >
                        <Text style={styles.emptyButtonText}>+ Create Collection</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <FlatList
                        data={lists}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.listCard}>
                                <TouchableOpacity
                                    style={styles.listCardContent}
                                    onPress={() => navigation.navigate('ListDetail', { list: item })}
                                >
                                    <Text style={styles.listName}>{item.name}</Text>
                                    <Text style={styles.listFields}>
                                        {item.schema.fields.length} field{item.schema.fields.length !== 1 ? 's' : ''}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteList(item.id, item.name)}
                                >
                                    <Text style={styles.deleteButtonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        contentContainerStyle={styles.listContent}
                    />

                    {/* Floating Action Button */}
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() => navigation.navigate('CreateList')}
                    >
                        <Text style={styles.fabText}>+</Text>
                    </TouchableOpacity>
                </>
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
        paddingTop: 60,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        gap: 12,
    },
    headerLeft: {
        flex: 1,
        minWidth: 0,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
    },
    email: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    signOutButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        flexShrink: 0,
    },
    signOutButtonText: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 14,
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#e0f2fe',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyIconText: {
        fontSize: 40,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 24,
        textAlign: 'center',
    },
    emptyButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100, // Space for FAB
    },
    listCard: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    listCardContent: {
        flex: 1,
    },
    listName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    listFields: {
        fontSize: 14,
        color: '#6b7280',
    },
    deleteButton: {
        padding: 8,
    },
    deleteButtonText: {
        color: '#ef4444',
        fontWeight: '600',
        fontSize: 14,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabText: {
        fontSize: 32,
        color: '#fff',
        fontWeight: '300',
        marginTop: -2,
    },
});