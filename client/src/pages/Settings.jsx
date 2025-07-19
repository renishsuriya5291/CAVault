// src/pages/Settings.jsx
import React, { useState } from 'react';
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
    Database
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

const Settings = () => {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    // Profile settings
    const [profileData, setProfileData] = useState({
        name: user?.name || 'John Doe',
        email: user?.email || 'john.doe@example.com',
        phone: '+91 9876543210',
        caLicenseNumber: 'CA123456',
        firmName: 'Doe & Associates',
        address: '123 Business Street, Mumbai, Maharashtra',
        timezone: 'Asia/Kolkata',
        language: 'en'
    });

    // Security settings
    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: true,
        sessionTimeout: '60',
        loginNotifications: true
    });

    // Notification settings
    const [notificationData, setNotificationData] = useState({
        emailNotifications: true,
        pushNotifications: false,
        documentUploads: true,
        securityAlerts: true,
        systemUpdates: false,
        weeklyReports: true
    });

    // Storage and backup settings
    const [storageData, setStorageData] = useState({
        autoBackup: true,
        backupFrequency: 'daily',
        retentionPeriod: '90',
        encryptionLevel: 'aes256'
    });

    const [savedStates, setSavedStates] = useState({
        profile: false,
        security: false,
        notifications: false,
        storage: false
    });

    const handleProfileChange = (field, value) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
        setSavedStates(prev => ({ ...prev, profile: false }));
    };

    const handleSecurityChange = (field, value) => {
        setSecurityData(prev => ({ ...prev, [field]: value }));
        setSavedStates(prev => ({ ...prev, security: false }));
    };

    const handleNotificationChange = (field, value) => {
        setNotificationData(prev => ({ ...prev, [field]: value }));
        setSavedStates(prev => ({ ...prev, notifications: false }));
    };

    const handleStorageChange = (field, value) => {
        setStorageData(prev => ({ ...prev, [field]: value }));
        setSavedStates(prev => ({ ...prev, storage: false }));
    };

    const saveSettings = (section) => {
        // Simulate API call
        setTimeout(() => {
            setSavedStates(prev => ({ ...prev, [section]: true }));
            setTimeout(() => {
                setSavedStates(prev => ({ ...prev, [section]: false }));
            }, 3000);
        }, 500);
    };

    const validatePasswordChange = () => {
        if (!securityData.currentPassword) {
            alert('Please enter your current password');
            return false;
        }
        if (securityData.newPassword.length < 8) {
            alert('New password must be at least 8 characters long');
            return false;
        }
        if (securityData.newPassword !== securityData.confirmPassword) {
            alert('New passwords do not match');
            return false;
        }
        return true;
    };

    const handlePasswordChange = () => {
        if (validatePasswordChange()) {
            // Simulate password change
            setTimeout(() => {
                setSecurityData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));
                alert('Password changed successfully');
            }, 500);
        }
    };

    const exportData = () => {
        // Simulate data export
        alert('Data export initiated. You will receive an email with download link.');
    };

    const deleteAccount = () => {
        const confirmed = window.confirm(
            'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.'
        );
        if (confirmed) {
            alert('Account deletion request submitted. Our team will contact you within 24 hours.');
        }
    };

    return (
        <div className="min-h-screen bg-ca-light">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="lg:ml-64 pt-16">
                <div className="p-6 max-w-4xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-ca-dark">Settings</h1>
                        <p className="text-ca-neutral mt-1">
                            Manage your account preferences and security settings
                        </p>
                    </div>

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
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                value={profileData.name}
                                                onChange={(e) => handleProfileChange('name', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => handleProfileChange('email', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={profileData.phone}
                                                onChange={(e) => handleProfileChange('phone', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="caLicense">CA License Number</Label>
                                            <Input
                                                id="caLicense"
                                                value={profileData.caLicenseNumber}
                                                onChange={(e) => handleProfileChange('caLicenseNumber', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="firmName">Firm Name</Label>
                                            <Input
                                                id="firmName"
                                                value={profileData.firmName}
                                                onChange={(e) => handleProfileChange('firmName', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="timezone">Timezone</Label>
                                            <Select value={profileData.timezone} onValueChange={(value) => handleProfileChange('timezone', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Asia/Kolkata">India Standard Time</SelectItem>
                                                    <SelectItem value="Asia/Dubai">Gulf Standard Time</SelectItem>
                                                    <SelectItem value="UTC">UTC</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="address">Business Address</Label>
                                        <Input
                                            id="address"
                                            value={profileData.address}
                                            onChange={(e) => handleProfileChange('address', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between pt-4">
                                        <div className="text-sm text-ca-neutral">
                                            Last updated: 2 days ago
                                        </div>
                                        <Button
                                            onClick={() => saveSettings('profile')}
                                            className="bg-ca-primary hover:bg-blue-700"
                                            disabled={savedStates.profile}
                                        >
                                            {savedStates.profile ? (
                                                <>
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Saved
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
                                        <Label htmlFor="currentPassword">Current Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="currentPassword"
                                                type={showCurrentPassword ? "text" : "password"}
                                                value={securityData.currentPassword}
                                                onChange={(e) => handleSecurityChange('currentPassword', e.target.value)}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            >
                                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="newPassword"
                                                type={showPassword ? "text" : "password"}
                                                value={securityData.newPassword}
                                                onChange={(e) => handleSecurityChange('newPassword', e.target.value)}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type={showPassword ? "text" : "password"}
                                            value={securityData.confirmPassword}
                                            onChange={(e) => handleSecurityChange('confirmPassword', e.target.value)}
                                        />
                                    </div>
                                    <Button onClick={handlePasswordChange} className="bg-ca-primary hover:bg-blue-700">
                                        Update Password
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="ca-shadow border-0">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-ca-primary" />
                                        Security Preferences
                                    </CardTitle>
                                    <CardDescription>
                                        Configure advanced security options
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-ca-dark">Two-Factor Authentication</h4>
                                            <p className="text-sm text-ca-neutral">Add an extra layer of security to your account</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={securityData.twoFactorEnabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                                {securityData.twoFactorEnabled ? "Enabled" : "Disabled"}
                                            </Badge>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSecurityChange('twoFactorEnabled', !securityData.twoFactorEnabled)}
                                            >
                                                {securityData.twoFactorEnabled ? "Disable" : "Enable"}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-ca-dark">Session Timeout</h4>
                                            <p className="text-sm text-ca-neutral">Automatically log out after period of inactivity</p>
                                        </div>
                                        <Select
                                            value={securityData.sessionTimeout}
                                            onValueChange={(value) => handleSecurityChange('sessionTimeout', value)}
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="15">15 min</SelectItem>
                                                <SelectItem value="30">30 min</SelectItem>
                                                <SelectItem value="60">1 hour</SelectItem>
                                                <SelectItem value="120">2 hours</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-ca-dark">Login Notifications</h4>
                                            <p className="text-sm text-ca-neutral">Get notified of new login attempts</p>
                                        </div>
                                        <Button
                                            variant={securityData.loginNotifications ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleSecurityChange('loginNotifications', !securityData.loginNotifications)}
                                        >
                                            {securityData.loginNotifications ? "On" : "Off"}
                                        </Button>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button
                                            onClick={() => saveSettings('security')}
                                            className="bg-ca-primary hover:bg-blue-700"
                                            disabled={savedStates.security}
                                        >
                                            {savedStates.security ? (
                                                <>
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Saved
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

                        {/* Notifications Settings */}
                        <TabsContent value="notifications" className="space-y-6">
                            <Card className="ca-shadow border-0">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-ca-primary" />
                                        Notification Preferences
                                    </CardTitle>
                                    <CardDescription>
                                        Choose what notifications you want to receive
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-ca-dark">Email Notifications</h4>
                                                <p className="text-sm text-ca-neutral">Receive notifications via email</p>
                                            </div>
                                            <Button
                                                variant={notificationData.emailNotifications ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handleNotificationChange('emailNotifications', !notificationData.emailNotifications)}
                                            >
                                                {notificationData.emailNotifications ? "On" : "Off"}
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-ca-dark">Push Notifications</h4>
                                                <p className="text-sm text-ca-neutral">Browser push notifications</p>
                                            </div>
                                            <Button
                                                variant={notificationData.pushNotifications ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handleNotificationChange('pushNotifications', !notificationData.pushNotifications)}
                                            >
                                                {notificationData.pushNotifications ? "On" : "Off"}
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-ca-dark">Document Upload Alerts</h4>
                                                <p className="text-sm text-ca-neutral">Get notified when documents are uploaded</p>
                                            </div>
                                            <Button
                                                variant={notificationData.documentUploads ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handleNotificationChange('documentUploads', !notificationData.documentUploads)}
                                            >
                                                {notificationData.documentUploads ? "On" : "Off"}
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-ca-dark">Security Alerts</h4>
                                                <p className="text-sm text-ca-neutral">Important security notifications</p>
                                            </div>
                                            <Button
                                                variant={notificationData.securityAlerts ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handleNotificationChange('securityAlerts', !notificationData.securityAlerts)}
                                            >
                                                {notificationData.securityAlerts ? "On" : "Off"}
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-ca-dark">System Updates</h4>
                                                <p className="text-sm text-ca-neutral">Product updates and maintenance notices</p>
                                            </div>
                                            <Button
                                                variant={notificationData.systemUpdates ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handleNotificationChange('systemUpdates', !notificationData.systemUpdates)}
                                            >
                                                {notificationData.systemUpdates ? "On" : "Off"}
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-ca-dark">Weekly Reports</h4>
                                                <p className="text-sm text-ca-neutral">Weekly summary of your account activity</p>
                                            </div>
                                            <Button
                                                variant={notificationData.weeklyReports ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handleNotificationChange('weeklyReports', !notificationData.weeklyReports)}
                                            >
                                                {notificationData.weeklyReports ? "On" : "Off"}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button
                                            onClick={() => saveSettings('notifications')}
                                            className="bg-ca-primary hover:bg-blue-700"
                                            disabled={savedStates.notifications}
                                        >
                                            {savedStates.notifications ? (
                                                <>
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Saved
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

                        {/* Storage & Backup Settings */}
                        <TabsContent value="storage" className="space-y-6">
                            <Card className="ca-shadow border-0">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <HardDrive className="w-5 h-5 text-ca-primary" />
                                        Storage Usage
                                    </CardTitle>
                                    <CardDescription>
                                        Monitor your storage usage and manage backups
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span>Used Storage</span>
                                            <span>68 GB of 100 GB</span>
                                        </div>
                                        <Progress value={68} className="h-2" />
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                                            <p className="text-ca-neutral">Documents</p>
                                            <p className="font-semibold text-ca-dark">45 GB</p>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                                            <p className="text-ca-neutral">Backups</p>
                                            <p className="font-semibold text-ca-dark">18 GB</p>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                                            <p className="text-ca-neutral">Archives</p>
                                            <p className="font-semibold text-ca-dark">5 GB</p>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                                            <p className="text-ca-neutral">Available</p>
                                            <p className="font-semibold text-green-600">32 GB</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="ca-shadow border-0">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Database className="w-5 h-5 text-ca-primary" />
                                        Backup Settings
                                    </CardTitle>
                                    <CardDescription>
                                        Configure automatic backups and data retention
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-ca-dark">Automatic Backup</h4>
                                            <p className="text-sm text-ca-neutral">Automatically backup your documents</p>
                                        </div>
                                        <Button
                                            variant={storageData.autoBackup ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleStorageChange('autoBackup', !storageData.autoBackup)}
                                        >
                                            {storageData.autoBackup ? "Enabled" : "Disabled"}
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-ca-dark">Backup Frequency</h4>
                                            <p className="text-sm text-ca-neutral">How often to create backups</p>
                                        </div>
                                        <Select
                                            value={storageData.backupFrequency}
                                            onValueChange={(value) => handleStorageChange('backupFrequency', value)}
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="hourly">Hourly</SelectItem>
                                                <SelectItem value="daily">Daily</SelectItem>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-ca-dark">Retention Period</h4>
                                            <p className="text-sm text-ca-neutral">How long to keep backups</p>
                                        </div>
                                        <Select
                                            value={storageData.retentionPeriod}
                                            onValueChange={(value) => handleStorageChange('retentionPeriod', value)}
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="30">30 days</SelectItem>
                                                <SelectItem value="90">90 days</SelectItem>
                                                <SelectItem value="180">6 months</SelectItem>
                                                <SelectItem value="365">1 year</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-ca-dark">Encryption Level</h4>
                                            <p className="text-sm text-ca-neutral">Security level for stored data</p>
                                        </div>
                                        <Select
                                            value={storageData.encryptionLevel}
                                            onValueChange={(value) => handleStorageChange('encryptionLevel', value)}
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="aes128">AES-128</SelectItem>
                                                <SelectItem value="aes256">AES-256</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button
                                            onClick={() => saveSettings('storage')}
                                            className="bg-ca-primary hover:bg-blue-700"
                                            disabled={savedStates.storage}
                                        >
                                            {savedStates.storage ? (
                                                <>
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Saved
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

                            {/* Data Management */}
                            <Card className="ca-shadow border-0">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-ca-primary" />
                                        Data Management
                                    </CardTitle>
                                    <CardDescription>
                                        Export or delete your account data
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-ca-dark">Export Data</h4>
                                            <p className="text-sm text-ca-neutral">Download a copy of all your data</p>
                                        </div>
                                        <Button variant="outline" onClick={exportData}>
                                            <Download className="w-4 h-4 mr-2" />
                                            Export
                                        </Button>
                                    </div>

                                    <Alert className="border-red-200 bg-red-50">
                                        <AlertTriangle className="w-4 h-4 text-red-600" />
                                        <AlertDescription className="text-red-800">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <strong>Delete Account</strong>
                                                    <p className="text-sm mt-1">Permanently delete your account and all data. This action cannot be undone.</p>
                                                </div>
                                                <Button variant="destructive" onClick={deleteAccount}>
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
};

export default Settings;