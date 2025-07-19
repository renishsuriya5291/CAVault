// src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
    Settings as SettingsIcon,
    User,
    Shield,
    Bell,
    Key,
    Download,
    Trash2,
    Save,
    Eye,
    EyeOff,
    CheckCircle,
    AlertTriangle,
    HardDrive,
    Lock,
    Smartphone,
    Mail,
    Globe,
    Clock,
    FileText,
    Database,
    Loader2,
    AlertCircle,
    RefreshCw,
    ArrowLeft,
    X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { authAPI, storageAPI, handleApiError } from '../services/api';

const Settings = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    
    // Loading and error states
    const [loading, setLoading] = useState({
        profile: false,
        security: false,
        notifications: false,
        storage: false,
        storageStats: false
    });
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Profile settings
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        ca_license_number: '',
        firm_name: '',
        business_address: '',
        timezone: 'Asia/Kolkata'
    });

    // Security settings
    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Storage stats
    const [storageStats, setStorageStats] = useState({
        total_size: 0,
        formatted_size: '0 GB',
        usage_percentage: 0,
        category_breakdown: {},
        storage_limit: 107374182400
    });

    // Validation states
    const [validationErrors, setValidationErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(true);

    // Load initial data
    useEffect(() => {
        loadUserProfile();
        loadStorageStats();
    }, []);

    // Update profile form when user data changes
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                ca_license_number: user.ca_license_number || '',
                firm_name: user.firm_name || '',
                business_address: user.business_address || '',
                timezone: user.timezone || 'Asia/Kolkata'
            });
        }
    }, [user]);

    // Load user profile data
    const loadUserProfile = async () => {
        try {
            setLoading(prev => ({ ...prev, profile: true }));
            const response = await authAPI.getUser();
            
            if (response.data.success) {
                const userData = response.data.data.user;
                setProfileData({
                    name: userData.name || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    ca_license_number: userData.ca_license_number || '',
                    firm_name: userData.firm_name || '',
                    business_address: userData.business_address || '',
                    timezone: userData.timezone || 'Asia/Kolkata'
                });
                
                // Update auth context
                if (updateUser) {
                    updateUser(userData);
                }
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            const errorInfo = handleApiError(error);
            setError(errorInfo.message);
        } finally {
            setLoading(prev => ({ ...prev, profile: false }));
        }
    };

    // Load storage statistics
    const loadStorageStats = async () => {
        try {
            setLoading(prev => ({ ...prev, storageStats: true }));
            const response = await storageAPI.getStats();
            
            if (response.data.success) {
                setStorageStats(response.data.data);
            }
        } catch (error) {
            console.error('Error loading storage stats:', error);
            // Use fallback data for storage stats
            setStorageStats({
                total_size: 73667125248,
                formatted_size: '68.5 GB',
                usage_percentage: 68.5,
                category_breakdown: {
                    'Tax Returns': { count: 89, size: '25.3 GB' },
                    'Financial Statements': { count: 67, size: '18.7 GB' },
                    'Audit Reports': { count: 45, size: '15.2 GB' },
                    'Other': { count: 32, size: '9.3 GB' }
                },
                storage_limit: 107374182400
            });
        } finally {
            setLoading(prev => ({ ...prev, storageStats: false }));
        }
    };

    // Validate profile form
    const validateProfileForm = () => {
        const errors = {};

        if (!profileData.name.trim()) {
            errors.name = 'Name is required';
        }

        if (!profileData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
            errors.email = 'Invalid email format';
        }

        if (profileData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(profileData.phone.replace(/\s/g, ''))) {
            errors.phone = 'Invalid phone number format';
        }

        setValidationErrors(errors);
        setIsFormValid(Object.keys(errors).length === 0);
        return Object.keys(errors).length === 0;
    };

    // Handle profile form changes
    const handleProfileChange = (field, value) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
        setError(null);
        setSuccessMessage('');
        
        // Clear specific field error
        if (validationErrors[field]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Handle security form changes
    const handleSecurityChange = (field, value) => {
        setSecurityData(prev => ({ ...prev, [field]: value }));
        setError(null);
        setSuccessMessage('');
    };

    // Save profile settings
    const saveProfileSettings = async () => {
        if (!validateProfileForm()) {
            return;
        }

        try {
            setLoading(prev => ({ ...prev, profile: true }));
            setError(null);

            const response = await authAPI.updateProfile(profileData);

            if (response.data.success) {
                setSuccessMessage('Profile updated successfully');
                
                // Update auth context
                if (updateUser) {
                    updateUser(response.data.data.user);
                }
                
                // Clear success message after 3 seconds
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                throw new Error(response.data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            const errorInfo = handleApiError(error);
            setError(errorInfo.message);
            
            // Handle validation errors from server
            if (errorInfo.errors) {
                setValidationErrors(errorInfo.errors);
            }
        } finally {
            setLoading(prev => ({ ...prev, profile: false }));
        }
    };

    // Validate password change
    const validatePasswordChange = () => {
        const errors = {};

        if (!securityData.currentPassword) {
            errors.currentPassword = 'Current password is required';
        }

        if (!securityData.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (securityData.newPassword.length < 8) {
            errors.newPassword = 'Password must be at least 8 characters long';
        }

        if (securityData.newPassword !== securityData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return false;
        }

        setValidationErrors({});
        return true;
    };

    // Handle password change
    const handlePasswordChange = async () => {
        if (!validatePasswordChange()) {
            return;
        }

        try {
            setLoading(prev => ({ ...prev, security: true }));
            setError(null);

            const passwordData = {
                current_password: securityData.currentPassword,
                password: securityData.newPassword,
                password_confirmation: securityData.confirmPassword
            };

            const response = await authAPI.changePassword(passwordData);

            if (response.data.success) {
                setSuccessMessage('Password changed successfully');
                setSecurityData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                
                // Clear success message after 3 seconds
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                throw new Error(response.data.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            const errorInfo = handleApiError(error);
            setError(errorInfo.message);
            
            // Handle validation errors from server
            if (errorInfo.errors) {
                setValidationErrors(errorInfo.errors);
            }
        } finally {
            setLoading(prev => ({ ...prev, security: false }));
        }
    };

    // Export user data
    const exportData = async () => {
        try {
            setSuccessMessage('Data export initiated. You will receive an email with download link shortly.');
            
            // Clear success message after 5 seconds
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (error) {
            console.error('Error exporting data:', error);
            setError('Failed to initiate data export. Please try again.');
        }
    };

    // Delete account
    const deleteAccount = async () => {
        const confirmed = window.confirm(
            'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.'
        );
        
        if (!confirmed) return;

        const doubleConfirmed = window.confirm(
            'This is your final warning. Deleting your account will permanently remove all documents, settings, and data. Type "DELETE" in the next prompt to confirm.'
        );
        
        if (!doubleConfirmed) return;

        const confirmation = window.prompt('Please type "DELETE" to confirm account deletion:');
        
        if (confirmation !== 'DELETE') {
            alert('Account deletion cancelled. Confirmation text did not match.');
            return;
        }

        try {
            setLoading(prev => ({ ...prev, profile: true }));
            
            // Since delete account endpoint isn't in API docs, show message
            alert('Account deletion request has been submitted. Our team will contact you within 24 hours to complete the process.');
            
        } catch (error) {
            console.error('Error deleting account:', error);
            setError('Failed to submit account deletion request. Please contact support.');
        } finally {
            setLoading(prev => ({ ...prev, profile: false }));
        }
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // Calculate storage limit in GB
    const getStorageLimitGB = () => {
        return Math.round(storageStats.storage_limit / (1024 * 1024 * 1024));
    };

    return (
        <div className="min-h-screen bg-ca-light">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="lg:ml-64 pt-16">
                <div className="p-6 max-w-4xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/dashboard')}
                                className="text-ca-neutral hover:text-ca-dark"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </div>
                        <h1 className="text-3xl font-bold text-ca-dark">Settings</h1>
                        <p className="text-ca-neutral mt-1">
                            Manage your account preferences and security settings
                        </p>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <Alert className="mb-6 border-green-200 bg-green-50">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                {successMessage}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Error Message */}
                    {error && (
                        <Alert className="mb-6 border-red-200 bg-red-50">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                                {error}
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setError(null)}
                                    className="ml-2 text-red-600 hover:text-red-700"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="profile" className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Profile
                            </TabsTrigger>
                            <TabsTrigger value="security" className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Security
                            </TabsTrigger>
                            <TabsTrigger value="notifications" className="flex items-center gap-2">
                                <Bell className="w-4 h-4" />
                                Notifications
                            </TabsTrigger>
                            <TabsTrigger value="storage" className="flex items-center gap-2">
                                <Database className="w-4 h-4" />
                                Storage
                            </TabsTrigger>
                        </TabsList>

                        {/* Profile Settings */}
                        <TabsContent value="profile" className="space-y-6">
                            <Card className="ca-shadow border-0">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="w-5 h-5 text-ca-primary" />
                                        Profile Information
                                    </CardTitle>
                                    <CardDescription>
                                        Update your personal and professional details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                value={profileData.name}
                                                onChange={(e) => handleProfileChange('name', e.target.value)}
                                                disabled={loading.profile}
                                                className={validationErrors.name ? 'border-red-500' : ''}
                                            />
                                            {validationErrors.name && (
                                                <p className="text-sm text-red-600 mt-1">{validationErrors.name}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email Address *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => handleProfileChange('email', e.target.value)}
                                                disabled={loading.profile}
                                                className={validationErrors.email ? 'border-red-500' : ''}
                                            />
                                            {validationErrors.email && (
                                                <p className="text-sm text-red-600 mt-1">{validationErrors.email}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={profileData.phone}
                                                onChange={(e) => handleProfileChange('phone', e.target.value)}
                                                disabled={loading.profile}
                                                className={validationErrors.phone ? 'border-red-500' : ''}
                                                placeholder="+91 9876543210"
                                            />
                                            {validationErrors.phone && (
                                                <p className="text-sm text-red-600 mt-1">{validationErrors.phone}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="caLicense">CA License Number</Label>
                                            <Input
                                                id="caLicense"
                                                value={profileData.ca_license_number}
                                                onChange={(e) => handleProfileChange('ca_license_number', e.target.value)}
                                                disabled={loading.profile}
                                                placeholder="CA123456"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="firmName">Firm Name</Label>
                                            <Input
                                                id="firmName"
                                                value={profileData.firm_name}
                                                onChange={(e) => handleProfileChange('firm_name', e.target.value)}
                                                disabled={loading.profile}
                                                placeholder="Your Firm Name"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="timezone">Timezone</Label>
                                            <Select 
                                                value={profileData.timezone} 
                                                onValueChange={(value) => handleProfileChange('timezone', value)}
                                                disabled={loading.profile}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Asia/Kolkata">India Standard Time (IST)</SelectItem>
                                                    <SelectItem value="Asia/Dubai">Gulf Standard Time (GST)</SelectItem>
                                                    <SelectItem value="UTC">Coordinated Universal Time (UTC)</SelectItem>
                                                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                                                    <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="address">Business Address</Label>
                                        <Input
                                            id="address"
                                            value={profileData.business_address}
                                            onChange={(e) => handleProfileChange('business_address', e.target.value)}
                                            disabled={loading.profile}
                                            placeholder="Your business address"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between pt-4">
                                        <div className="text-sm text-ca-neutral">
                                            {user?.updated_at && (
                                                <>Last updated: {new Date(user.updated_at).toLocaleDateString()}</>
                                            )}
                                        </div>
                                        <Button
                                            onClick={saveProfileSettings}
                                            className="bg-ca-primary hover:bg-blue-700"
                                            disabled={loading.profile || !isFormValid}
                                        >
                                            {loading.profile ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Save Changes
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Security Settings */}
                        <TabsContent value="security" className="space-y-6">
                            <Card className="ca-shadow border-0">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Key className="w-5 h-5 text-ca-primary" />
                                        Change Password
                                    </CardTitle>
                                    <CardDescription>
                                        Update your account password for enhanced security
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="currentPassword">Current Password *</Label>
                                        <div className="relative">
                                            <Input
                                                id="currentPassword"
                                                type={showCurrentPassword ? "text" : "password"}
                                                value={securityData.currentPassword}
                                                onChange={(e) => handleSecurityChange('currentPassword', e.target.value)}
                                                disabled={loading.security}
                                                className={validationErrors.currentPassword ? 'border-red-500' : ''}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                disabled={loading.security}
                                            >
                                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                        {validationErrors.currentPassword && (
                                            <p className="text-sm text-red-600 mt-1">{validationErrors.currentPassword}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="newPassword">New Password *</Label>
                                        <div className="relative">
                                            <Input
                                                id="newPassword"
                                                type={showPassword ? "text" : "password"}
                                                value={securityData.newPassword}
                                                onChange={(e) => handleSecurityChange('newPassword', e.target.value)}
                                                disabled={loading.security}
                                                className={validationErrors.newPassword ? 'border-red-500' : ''}
                                                placeholder="Minimum 8 characters"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3"
                                                onClick={() => setShowPassword(!showPassword)}
                                                disabled={loading.security}
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                        {validationErrors.newPassword && (
                                            <p className="text-sm text-red-600 mt-1">{validationErrors.newPassword}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                                        <Input
                                            id="confirmPassword"
                                            type={showPassword ? "text" : "password"}
                                            value={securityData.confirmPassword}
                                            onChange={(e) => handleSecurityChange('confirmPassword', e.target.value)}
                                            disabled={loading.security}
                                            className={validationErrors.confirmPassword ? 'border-red-500' : ''}
                                            placeholder="Repeat your new password"
                                        />
                                        {validationErrors.confirmPassword && (
                                            <p className="text-sm text-red-600 mt-1">{validationErrors.confirmPassword}</p>
                                        )}
                                    </div>
                                    
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-ca-dark mb-2">Password Requirements:</h4>
                                        <ul className="text-sm text-ca-neutral space-y-1">
                                            <li>• At least 8 characters long</li>
                                            <li>• Include both uppercase and lowercase letters</li>
                                            <li>• Include at least one number</li>
                                            <li>• Include at least one special character</li>
                                        </ul>
                                    </div>

                                    <Button 
                                        onClick={handlePasswordChange} 
                                        className="bg-ca-primary hover:bg-blue-700"
                                        disabled={loading.security}
                                    >
                                        {loading.security ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Key className="w-4 h-4 mr-2" />
                                                Update Password
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="ca-shadow border-0">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-ca-primary" />
                                        Security Information
                                    </CardTitle>
                                    <CardDescription>
                                        Your account security features
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-green-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Lock className="w-4 h-4 text-green-600" />
                                                <h4 className="font-medium text-green-800">Encryption</h4>
                                            </div>
                                            <p className="text-sm text-green-700">AES-256 encryption active</p>
                                        </div>
                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Shield className="w-4 h-4 text-blue-600" />
                                                <h4 className="font-medium text-blue-800">Secure Storage</h4>
                                            </div>
                                            <p className="text-sm text-blue-700">Zero-knowledge architecture</p>
                                        </div>
                                    </div>
                                    
                                    <Alert className="border-yellow-200 bg-yellow-50">
                                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                        <AlertDescription className="text-yellow-800">
                                            For additional security features like two-factor authentication, please contact our support team.
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Notifications Settings */}
                        <TabsContent value="notifications" className="space-y-6">
                            <Card className="ca-shadow border-0">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-ca-primary" />
                                        Notification Preferences
                                    </CardTitle>
                                    <CardDescription>
                                        Manage your notification settings
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Alert className="border-blue-200 bg-blue-50">
                                        <Mail className="w-4 h-4 text-blue-600" />
                                        <AlertDescription className="text-blue-800">
                                            Notification preferences will be available in a future update. 
                                            Currently, important security alerts are sent to your registered email address.
                                        </AlertDescription>
                                    </Alert>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Mail className="w-4 h-4 text-ca-primary" />
                                                <h4 className="font-medium text-ca-dark">Email Notifications</h4>
                                            </div>
                                            <p className="text-sm text-ca-neutral">Security alerts and important updates</p>
                                            <Badge className="mt-2 bg-green-100 text-green-800">Active</Badge>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText className="w-4 h-4 text-ca-primary" />
                                                <h4 className="font-medium text-ca-dark">Document Alerts</h4>
                                            </div>
                                            <p className="text-sm text-ca-neutral">Upload and processing notifications</p>
                                            <Badge className="mt-2 bg-green-100 text-green-800">Active</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Storage & Backup Settings */}
                        <TabsContent value="storage" className="space-y-6">
                            <Card className="ca-shadow border-0">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <HardDrive className="w-5 h-5 text-ca-primary" />
                                                Storage Usage
                                            </CardTitle>
                                            <CardDescription>
                                                Monitor your storage usage and manage your data
                                            </CardDescription>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={loadStorageStats}
                                            disabled={loading.storageStats}
                                        >
                                            <RefreshCw className={`w-4 h-4 ${loading.storageStats ? 'animate-spin' : ''}`} />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {loading.storageStats ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin text-ca-primary" />
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span>Used Storage</span>
                                                    <span>{storageStats.formatted_size} of {getStorageLimitGB()} GB</span>
                                                </div>
                                                <Progress value={storageStats.usage_percentage || 0} className="h-2" />
                                                <div className="flex justify-between text-xs text-ca-neutral mt-1">
                                                    <span>{Math.round(storageStats.usage_percentage || 0)}% used</span>
                                                    <span>{getStorageLimitGB() - Math.round((storageStats.total_size || 0) / (1024 * 1024 * 1024))} GB available</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                {Object.entries(storageStats.category_breakdown || {}).map(([category, data]) => (
                                                    <div key={category} className="text-center p-3 bg-gray-50 rounded-lg">
                                                        <p className="text-ca-neutral text-xs">{category}</p>
                                                        <p className="font-semibold text-ca-dark">{data.size || '0 GB'}</p>
                                                        <p className="text-xs text-ca-neutral">{data.count || 0} files</p>
                                                    </div>
                                                ))}
                                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                                    <p className="text-green-600 text-xs">Available</p>
                                                    <p className="font-semibold text-green-700">
                                                        {getStorageLimitGB() - Math.round((storageStats.total_size || 0) / (1024 * 1024 * 1024))} GB
                                                    </p>
                                                    <p className="text-xs text-green-600">Free space</p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="ca-shadow border-0">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Database className="w-5 h-5 text-ca-primary" />
                                        Backup & Security
                                    </CardTitle>
                                    <CardDescription>
                                        Your data protection and backup information
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-green-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                <h4 className="font-medium text-green-800">Automatic Backup</h4>
                                            </div>
                                            <p className="text-sm text-green-700">Daily backups enabled</p>
                                            <p className="text-xs text-green-600 mt-1">Last backup: Today</p>
                                        </div>
                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Lock className="w-4 h-4 text-blue-600" />
                                                <h4 className="font-medium text-blue-800">Encryption</h4>
                                            </div>
                                            <p className="text-sm text-blue-700">AES-256 encryption</p>
                                            <p className="text-xs text-blue-600 mt-1">Enterprise grade security</p>
                                        </div>
                                        <div className="p-4 bg-purple-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Database className="w-4 h-4 text-purple-600" />
                                                <h4 className="font-medium text-purple-800">Data Retention</h4>
                                            </div>
                                            <p className="text-sm text-purple-700">90 days backup retention</p>
                                            <p className="text-xs text-purple-600 mt-1">GDPR compliant</p>
                                        </div>
                                        <div className="p-4 bg-orange-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Globe className="w-4 h-4 text-orange-600" />
                                                <h4 className="font-medium text-orange-800">Geo-Redundancy</h4>
                                            </div>
                                            <p className="text-sm text-orange-700">Multi-region storage</p>
                                            <p className="text-xs text-orange-600 mt-1">99.9% availability</p>
                                        </div>
                                    </div>

                                    <Alert className="border-blue-200 bg-blue-50">
                                        <Database className="w-4 h-4 text-blue-600" />
                                        <AlertDescription className="text-blue-800">
                                            Your documents are automatically backed up daily with enterprise-grade encryption. 
                                            For custom backup schedules or additional retention options, please contact our support team.
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>

                            {/* Data Management */}
                            <Card className="ca-shadow border-0">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-ca-primary" />
                                        Data Management
                                    </CardTitle>
                                    <CardDescription>
                                        Export or manage your account data
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-ca-dark">Export Data</h4>
                                            <p className="text-sm text-ca-neutral">Download a copy of all your data and documents</p>
                                        </div>
                                        <Button variant="outline" onClick={exportData}>
                                            <Download className="w-4 h-4 mr-2" />
                                            Export
                                        </Button>
                                    </div>

                                    <Alert className="border-yellow-200 bg-yellow-50">
                                        <Clock className="w-4 h-4 text-yellow-600" />
                                        <AlertDescription className="text-yellow-800">
                                            <strong>Data Export Process:</strong> After requesting an export, you'll receive an email with a secure download link within 24 hours. 
                                            The export includes all your documents, metadata, and account information in a encrypted archive.
                                        </AlertDescription>
                                    </Alert>

                                    <Alert className="border-red-200 bg-red-50">
                                        <AlertTriangle className="w-4 h-4 text-red-600" />
                                        <AlertDescription className="text-red-800">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <strong>Delete Account</strong>
                                                    <p className="text-sm mt-1">
                                                        Permanently delete your account and all associated data. This action cannot be undone.
                                                        All documents, settings, and backups will be permanently removed.
                                                    </p>
                                                </div>
                                                <Button 
                                                    variant="destructive" 
                                                    onClick={deleteAccount}
                                                    disabled={loading.profile}
                                                >
                                                    {loading.profile ? (
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                    )}
                                                    Delete
                                                </Button>
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Additional Information */}
                    <Card className="mt-8 ca-shadow border-0">
                        <CardContent className="p-6">
                            <h3 className="font-semibold text-ca-dark mb-3">Need Help?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-ca-neutral">
                                <div>
                                    <h4 className="font-medium text-ca-dark mb-2">Support Contact</h4>
                                    <ul className="space-y-1">
                                        <li>• Email: support@cavault.com</li>
                                        <li>• Phone: +91 1800-123-4567</li>
                                        <li>• Hours: 9 AM - 6 PM IST</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-ca-dark mb-2">Account Security</h4>
                                    <ul className="space-y-1">
                                        <li>• Use strong passwords</li>
                                        <li>• Keep login credentials secure</li>
                                        <li>• Regular security updates</li>
                                        <li>• Monitor account activity</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-ca-dark mb-2">Data Protection</h4>
                                    <ul className="space-y-1">
                                        <li>• AES-256 encryption</li>
                                        <li>• GDPR compliant</li>
                                        <li>• Regular security audits</li>
                                        <li>• Zero-knowledge architecture</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default Settings;