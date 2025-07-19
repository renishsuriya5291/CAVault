// src/pages/Help.jsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
    HelpCircle,
    Search,
    MessageCircle,
    Mail,
    Phone,
    Book,
    Video,
    FileText,
    Shield,
    Upload,
    Settings,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    Clock,
    CheckCircle,
    Star,
    Send,
    User,
    Zap,
    Globe
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

const Help = () => {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('faq');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [supportForm, setSupportForm] = useState({
        category: '',
        subject: '',
        message: '',
        priority: 'medium'
    });

    // FAQ Data
    const faqCategories = [
        {
            id: 'getting-started',
            title: 'Getting Started',
            icon: Zap,
            questions: [
                {
                    id: 1,
                    question: 'How do I upload my first document?',
                    answer: 'To upload your first document, navigate to the Upload page from the sidebar or click the "Upload Document" button on the dashboard. You can drag and drop files or click to browse. Select the appropriate category and client information before uploading.'
                },
                {
                    id: 2,
                    question: 'What file formats are supported?',
                    answer: 'We support PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, and GIF files. Maximum file size is 50MB per document. All files are automatically encrypted before storage.'
                },
                {
                    id: 3,
                    question: 'How do I organize my documents?',
                    answer: 'Documents can be organized using categories (Tax Returns, Financial Statements, etc.), client names, and tags. Use the search function to quickly find documents by any of these criteria.'
                }
            ]
        },
        {
            id: 'security',
            title: 'Security & Privacy',
            icon: Shield,
            questions: [
                {
                    id: 4,
                    question: 'How secure are my documents?',
                    answer: 'All documents are encrypted with AES-256 encryption both in transit and at rest. We use a zero-knowledge architecture, meaning even our servers cannot read your documents without your encryption keys.'
                },
                {
                    id: 5,
                    question: 'Can I enable two-factor authentication?',
                    answer: 'Yes, you can enable two-factor authentication from the Security section in Settings. We recommend enabling this for additional account protection.'
                },
                {
                    id: 6,
                    question: 'What happens if I forget my password?',
                    answer: 'You can reset your password using the "Forgot Password" link on the login page. Note that due to our zero-knowledge encryption, you may need to re-upload documents if you lose access to your encryption keys.'
                }
            ]
        },
        {
            id: 'features',
            title: 'Features & Functions',
            icon: Settings,
            questions: [
                {
                    id: 7,
                    question: 'How does the search function work?',
                    answer: 'Our advanced search allows you to find documents by name, client, category, tags, or even content within documents. Use the Advanced Search page for filtering by date ranges, file types, and more.'
                },
                {
                    id: 8,
                    question: 'Can I share documents with clients?',
                    answer: 'Currently, document sharing is planned for a future release. You can download documents and share them through secure external channels.'
                },
                {
                    id: 9,
                    question: 'How do I backup my documents?',
                    answer: 'Automatic backups can be configured in the Storage settings. You can also manually export all your data from the Settings page.'
                }
            ]
        },
        {
            id: 'troubleshooting',
            title: 'Troubleshooting',
            icon: HelpCircle,
            questions: [
                {
                    id: 10,
                    question: 'Upload is failing, what should I do?',
                    answer: 'Check your internet connection and ensure the file size is under 50MB. If the problem persists, try a different browser or contact support with the specific error message.'
                },
                {
                    id: 11,
                    question: 'Why is the page loading slowly?',
                    answer: 'Slow loading can be due to internet connectivity or browser issues. Try clearing your browser cache, disabling extensions, or using a different browser. Contact support if issues persist.'
                },
                {
                    id: 12,
                    question: 'I cannot find my uploaded document',
                    answer: 'Use the search function on the Documents page or try filtering by category and date. If you still cannot find it, check if the upload completed successfully or contact support.'
                }
            ]
        }
    ];

    // Video tutorials data
    const videoTutorials = [
        {
            id: 1,
            title: 'Getting Started with CA Portal',
            duration: '5:30',
            thumbnail: 'https://via.placeholder.com/300x180/1e40af/ffffff?text=Video+1',
            description: 'Learn the basics of navigating and using the CA Portal for document management.'
        },
        {
            id: 2,
            title: 'Uploading and Organizing Documents',
            duration: '7:45',
            thumbnail: 'https://via.placeholder.com/300x180/059669/ffffff?text=Video+2',
            description: 'Step-by-step guide to uploading documents and organizing them effectively.'
        },
        {
            id: 3,
            title: 'Advanced Search Techniques',
            duration: '4:20',
            thumbnail: 'https://via.placeholder.com/300x180/dc2626/ffffff?text=Video+3',
            description: 'Master the search functionality to quickly find any document in your collection.'
        },
        {
            id: 4,
            title: 'Security Best Practices',
            duration: '6:15',
            thumbnail: 'https://via.placeholder.com/300x180/64748b/ffffff?text=Video+4',
            description: 'Learn how to keep your documents secure with our advanced security features.'
        }
    ];

    // Documentation links
    const documentationSections = [
        {
            title: 'User Guide',
            icon: Book,
            links: [
                { title: 'Quick Start Guide', url: '#', type: 'PDF' },
                { title: 'Complete User Manual', url: '#', type: 'PDF' },
                { title: 'Feature Overview', url: '#', type: 'Web' },
                { title: 'Keyboard Shortcuts', url: '#', type: 'Web' }
            ]
        },
        {
            title: 'Technical Documentation',
            icon: FileText,
            links: [
                { title: 'API Documentation', url: '#', type: 'Web' },
                { title: 'Security Whitepaper', url: '#', type: 'PDF' },
                { title: 'Data Privacy Policy', url: '#', type: 'PDF' },
                { title: 'Terms of Service', url: '#', type: 'Web' }
            ]
        },
        {
            title: 'Integration Guides',
            icon: Globe,
            links: [
                { title: 'Tally Integration', url: '#', type: 'PDF' },
                { title: 'Excel Import/Export', url: '#', type: 'Web' },
                { title: 'Mobile App Setup', url: '#', type: 'PDF' },
                { title: 'Browser Requirements', url: '#', type: 'Web' }
            ]
        }
    ];

    const filteredFaqs = faqCategories.map(category => ({
        ...category,
        questions: category.questions.filter(q =>
            searchQuery === '' ||
            q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.questions.length > 0);

    const toggleFaq = (id) => {
        setExpandedFaq(expandedFaq === id ? null : id);
    };

    const handleSupportFormChange = (field, value) => {
        setSupportForm(prev => ({ ...prev, [field]: value }));
    };

    const submitSupportRequest = () => {
        if (!supportForm.subject || !supportForm.message) {
            alert('Please fill in all required fields');
            return;
        }

        // Simulate form submission
        alert('Support request submitted successfully! We will respond within 24 hours.');
        setSupportForm({
            category: '',
            subject: '',
            message: '',
            priority: 'medium'
        });
    };

    return (
        <div className="min-h-screen bg-ca-light">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="lg:ml-64 pt-16">
                <div className="p-6 max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-ca-dark">Help & Support</h1>
                        <p className="text-ca-neutral mt-1">
                            Find answers, learn features, and get support for your CA Portal
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card className="ca-shadow border-0 hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="p-6 text-center">
                                <MessageCircle className="w-8 h-8 text-ca-primary mx-auto mb-3" />
                                <h3 className="font-semibold text-ca-dark mb-2">Live Chat</h3>
                                <p className="text-sm text-ca-neutral mb-3">
                                    Get instant help from our support team
                                </p>
                                <Badge className="bg-green-100 text-green-800">Online</Badge>
                            </CardContent>
                        </Card>

                        <Card className="ca-shadow border-0 hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="p-6 text-center">
                                <Mail className="w-8 h-8 text-ca-primary mx-auto mb-3" />
                                <h3 className="font-semibold text-ca-dark mb-2">Email Support</h3>
                                <p className="text-sm text-ca-neutral mb-3">
                                    Send us an email and we'll respond within 24 hours
                                </p>
                                <Badge className="bg-blue-100 text-blue-800">support@caportal.com</Badge>
                            </CardContent>
                        </Card>

                        <Card className="ca-shadow border-0 hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="p-6 text-center">
                                <Phone className="w-8 h-8 text-ca-primary mx-auto mb-3" />
                                <h3 className="font-semibold text-ca-dark mb-2">Phone Support</h3>
                                <p className="text-sm text-ca-neutral mb-3">
                                    Call us for urgent technical issues
                                </p>
                                <Badge className="bg-orange-100 text-orange-800">+91 1800-XXX-XXXX</Badge>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="faq" className="flex items-center gap-2">
                                <HelpCircle className="w-4 h-4" />
                                FAQ
                            </TabsTrigger>
                            <TabsTrigger value="tutorials" className="flex items-center gap-2">
                                <Video className="w-4 h-4" />
                                Tutorials
                            </TabsTrigger>
                            <TabsTrigger value="docs" className="flex items-center gap-2">
                                <Book className="w-4 h-4" />
                                Documentation
                            </TabsTrigger>
                            <TabsTrigger value="contact" className="flex items-center gap-2">
                                <MessageCircle className="w-4 h-4" />
                                Contact
                            </TabsTrigger>
                        </TabsList>

                        {/* FAQ Section */}
                        <TabsContent value="faq" className="space-y-6">
                            {/* Search Bar */}
                            <Card className="ca-shadow border-0">
                                <CardContent className="p-6">
                                    <div className="relative">
                                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-ca-neutral" />
                                        <Input
                                            placeholder="Search frequently asked questions..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* FAQ Categories */}
                            {filteredFaqs.map((category) => (
                                <Card key={category.id} className="ca-shadow border-0">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <category.icon className="w-5 h-5 text-ca-primary" />
                                            {category.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {category.questions.map((faq) => (
                                                <div key={faq.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                                                    <button
                                                        onClick={() => toggleFaq(faq.id)}
                                                        className="w-full text-left flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                                    >
                                                        <span className="font-medium text-ca-dark">{faq.question}</span>
                                                        {expandedFaq === faq.id ? (
                                                            <ChevronDown className="w-4 h-4 text-ca-neutral" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4 text-ca-neutral" />
                                                        )}
                                                    </button>
                                                    {expandedFaq === faq.id && (
                                                        <div className="px-3 pb-3">
                                                            <p className="text-ca-neutral leading-relaxed">{faq.answer}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {filteredFaqs.length === 0 && (
                                <Card className="ca-shadow border-0">
                                    <CardContent className="p-12 text-center">
                                        <Search className="w-12 h-12 text-ca-neutral mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-ca-dark mb-2">No results found</h3>
                                        <p className="text-ca-neutral">
                                            Try different keywords or browse our categories above
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Video Tutorials */}
                        <TabsContent value="tutorials" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {videoTutorials.map((video) => (
                                    <Card key={video.id} className="ca-shadow border-0 hover:shadow-lg transition-shadow">
                                        <div className="relative">
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="w-full h-48 object-cover rounded-t-lg"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Button size="lg" className="bg-white/90 text-ca-primary hover:bg-white">
                                                    <Video className="w-6 h-6 mr-2" />
                                                    Play
                                                </Button>
                                            </div>
                                            <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                                                {video.duration}
                                            </Badge>
                                        </div>
                                        <CardContent className="p-4">
                                            <h3 className="font-semibold text-ca-dark mb-2">{video.title}</h3>
                                            <p className="text-sm text-ca-neutral">{video.description}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <Alert className="border-ca-primary bg-blue-50">
                                <Video className="w-4 h-4 text-ca-primary" />
                                <AlertDescription className="text-ca-dark">
                                    <strong>Pro Tip:</strong> All tutorials are available in HD quality and include subtitles.
                                    You can also download them for offline viewing.
                                </AlertDescription>
                            </Alert>
                        </TabsContent>

                        {/* Documentation */}
                        <TabsContent value="docs" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {documentationSections.map((section, index) => (
                                    <Card key={index} className="ca-shadow border-0">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <section.icon className="w-5 h-5 text-ca-primary" />
                                                {section.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {section.links.map((link, linkIndex) => (
                                                    <a
                                                        key={linkIndex}
                                                        href={link.url}
                                                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors group"
                                                    >
                                                        <span className="text-sm text-ca-dark group-hover:text-ca-primary">
                                                            {link.title}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="text-xs">
                                                                {link.type}
                                                            </Badge>
                                                            <ExternalLink className="w-3 h-3 text-ca-neutral" />
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <Card className="ca-shadow border-0 bg-gradient-to-r from-ca-primary to-ca-secondary text-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">Developer Resources</h3>
                                            <p className="opacity-90">
                                                Access our API documentation and integration guides for custom solutions.
                                            </p>
                                        </div>
                                        <Button className="bg-white text-ca-primary hover:bg-gray-100">
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            View API Docs
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Contact Support */}
                        <TabsContent value="contact" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Support Form */}
                                <Card className="ca-shadow border-0">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Send className="w-5 h-5 text-ca-primary" />
                                            Submit Support Request
                                        </CardTitle>
                                        <CardDescription>
                                            Fill out the form below and we'll get back to you as soon as possible
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="category">Category</Label>
                                            <select
                                                id="category"
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                value={supportForm.category}
                                                onChange={(e) => handleSupportFormChange('category', e.target.value)}
                                            >
                                                <option value="">Select a category</option>
                                                <option value="technical">Technical Issue</option>
                                                <option value="billing">Billing Question</option>
                                                <option value="feature">Feature Request</option>
                                                <option value="security">Security Concern</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <Label htmlFor="subject">Subject *</Label>
                                            <Input
                                                id="subject"
                                                placeholder="Brief description of your issue"
                                                value={supportForm.subject}
                                                onChange={(e) => handleSupportFormChange('subject', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="priority">Priority</Label>
                                            <select
                                                id="priority"
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                value={supportForm.priority}
                                                onChange={(e) => handleSupportFormChange('priority', e.target.value)}
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                                <option value="urgent">Urgent</option>
                                            </select>
                                        </div>

                                        <div>
                                            <Label htmlFor="message">Message *</Label>
                                            <textarea
                                                id="message"
                                                rows={6}
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                placeholder="Describe your issue or question in detail..."
                                                value={supportForm.message}
                                                onChange={(e) => handleSupportFormChange('message', e.target.value)}
                                            />
                                        </div>

                                        <Button
                                            onClick={submitSupportRequest}
                                            className="w-full bg-ca-primary hover:bg-blue-700"
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            Submit Request
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Contact Information & Status */}
                                <div className="space-y-6">
                                    <Card className="ca-shadow border-0">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Clock className="w-5 h-5 text-ca-primary" />
                                                Support Hours
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-ca-neutral">Monday - Friday</span>
                                                    <span className="font-medium text-ca-dark">9:00 AM - 6:00 PM IST</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-ca-neutral">Saturday</span>
                                                    <span className="font-medium text-ca-dark">10:00 AM - 4:00 PM IST</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-ca-neutral">Sunday</span>
                                                    <span className="font-medium text-ca-dark">Closed</span>
                                                </div>
                                                <div className="pt-2 border-t">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                        <span className="text-sm text-ca-dark">Currently Online</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="ca-shadow border-0">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <User className="w-5 h-5 text-ca-primary" />
                                                Account Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-ca-neutral">Account:</span>
                                                    <span className="font-medium text-ca-dark">{user?.email}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-ca-neutral">Plan:</span>
                                                    <span className="font-medium text-ca-dark">Professional</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-ca-neutral">Member Since:</span>
                                                    <span className="font-medium text-ca-dark">January 2024</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="ca-shadow border-0">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Star className="w-5 h-5 text-ca-primary" />
                                                Rate Our Support
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-ca-neutral mb-3">
                                                Help us improve by rating your support experience
                                            </p>
                                            <div className="flex gap-1 mb-3">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                                                ))}
                                            </div>
                                            <p className="text-xs text-ca-neutral">
                                                4.8/5 based on 1,247 reviews
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
};

export default Help;