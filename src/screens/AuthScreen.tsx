import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function AuthScreen() {
    const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { signIn, signUp, loading } = useAuthStore();

    const handleAuth = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (activeTab === 'signup') {
            if (password !== confirmPassword) {
                Alert.alert('Error', 'Passwords do not match');
                return;
            }
            if (password.length < 6) {
                Alert.alert('Error', 'Password must be at least 6 characters');
                return;
            }
        }

        const { error } = activeTab === 'signup'
            ? await signUp(email.trim(), password)
            : await signIn(email.trim(), password);

        if (error) {
            Alert.alert('Error', error);
        } else if (activeTab === 'signup') {
            Alert.alert('Success', 'Account created! You can now sign in.');
            setActiveTab('signin');
            setPassword('');
            setConfirmPassword('');
        }
    };

    const switchTab = (tab: 'signin' | 'signup') => {
        setActiveTab(tab);
        setPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    return (
        <KeyboardAwareScrollView
            contentContainerStyle={styles.scrollContent}
            enableOnAndroid={true}
            extraScrollHeight={20}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.content}>
                {/* Logo/Brand */}
                <View style={styles.brandContainer}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoText}>DN</Text>
                    </View>
                    <Text style={styles.appName}>DataNest</Text>
                    <Text style={styles.tagline}>Organize anything, your way</Text>
                </View>

                {/* Tab Selector */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'signin' && styles.tabActive]}
                        onPress={() => switchTab('signin')}
                        disabled={loading}
                    >
                        <Text style={[styles.tabText, activeTab === 'signin' && styles.tabTextActive]}>
                            Sign In
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'signup' && styles.tabActive]}
                        onPress={() => switchTab('signup')}
                        disabled={loading}
                    >
                        <Text style={[styles.tabText, activeTab === 'signup' && styles.tabTextActive]}>
                            Sign Up
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="you@example.com"
                            placeholderTextColor="#9ca3af"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder={activeTab === 'signup' ? 'Min. 6 characters' : '••••••••'}
                                placeholderTextColor="#9ca3af"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                editable={!loading}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {activeTab === 'signup' && (
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="••••••••"
                                    placeholderTextColor="#9ca3af"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    editable={!loading}
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleAuth}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Loading...' : activeTab === 'signup' ? 'Create Account' : 'Sign In'}
                        </Text>
                    </TouchableOpacity>

                    {activeTab === 'signin' && (
                        <Text style={styles.helperText}>
                            New to DataNest? Switch to Sign Up above
                        </Text>
                    )}
                    {activeTab === 'signup' && (
                        <Text style={styles.helperText}>
                            Already have an account? Switch to Sign In above
                        </Text>
                    )}
                </View>
            </View>
        </KeyboardAwareScrollView >
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    brandContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    logoText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    appName: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        color: '#6b7280',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#e5e7eb',
        borderRadius: 12,
        padding: 4,
        marginBottom: 32,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    tabActive: {
        backgroundColor: '#3b82f6',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
    },
    tabTextActive: {
        color: '#fff',
    },
    form: {
        gap: 20,
    },
    inputContainer: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#111827',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
    },
    passwordInput: {
        flex: 1,
        padding: 16,
        fontSize: 16,
        color: '#111827',
    },
    eyeButton: {
        padding: 16,
    },
    eyeIcon: {
        fontSize: 20,
    },
    button: {
        backgroundColor: '#3b82f6',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    helperText: {
        color: '#6b7280',
        textAlign: 'center',
        fontSize: 14,
    },
});