import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Success toast with your theme colors
        toast.success('Welcome back!', {
          description: `Successfully signed in as ${result.user.name}`,
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          style: {
            background: '#f0f9ff', // ca-light equivalent
            border: '1px solid #3b82f6', // ca-primary
            color: '#1e293b', // ca-dark
          },
          className: 'ca-shadow',
          duration: 3000,
        });
        
        // Navigate to dashboard after successful login
        navigate('/dashboard');
      } else {
        // Handle different types of errors
        if (typeof result.error === 'object') {
          // Validation errors - show each field error
          Object.entries(result.error).forEach(([field, messages]) => {
            const errorMessage = Array.isArray(messages) ? messages.join(', ') : messages;
            toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)} Error`, {
              description: errorMessage,
              icon: <AlertCircle className="h-4 w-4 text-red-600" />,
              style: {
                background: '#fef2f2', // Light red background
                border: '1px solid #ef4444', // Red border
                color: '#991b1b', // Dark red text
              },
              className: 'ca-shadow',
              duration: 5000,
            });
          });
        } else {
          // General error message
          toast.error('Login Failed', {
            description: result.error || 'Please check your credentials and try again',
            icon: <AlertCircle className="h-4 w-4 text-red-600" />,
            style: {
              background: '#fef2f2',
              border: '1px solid #ef4444',
              color: '#991b1b',
            },
            className: 'ca-shadow',
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Network Error', {
        description: 'Unable to connect to the server. Please try again.',
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
        style: {
          background: '#fef2f2',
          border: '1px solid #ef4444',
          color: '#991b1b',
        },
        className: 'ca-shadow',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-ca-light via-white to-blue-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-ca-primary rounded-2xl flex items-center justify-center mx-auto mb-4 ca-shadow">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-ca-dark">Welcome Back</h1>
          <p className="text-ca-neutral mt-2">Sign in to your CA Portal account</p>
        </div>

        <Card className="ca-shadow border-0">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your secure document portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-ca-neutral" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-ca-neutral" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10"
                    placeholder="Enter your password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-ca-primary hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-ca-neutral">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-ca-primary hover:underline font-medium"
                >
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-ca-neutral">
            Protected by enterprise-grade encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;