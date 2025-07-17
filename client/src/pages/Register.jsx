// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Shield, Mail, Lock, User, Phone, FileText, Eye, EyeOff, CheckCircle } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    ca_license_number: '',
    phone: '',
    firm_name: '',
    address: '',
    city: '',
    state: '',
    terms_accepted: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // Multi-step form

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form step
  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Full name is required';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      if (!formData.ca_license_number.trim()) {
        newErrors.ca_license_number = 'CA License Number is required';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      }
    }

    if (stepNumber === 2) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (!formData.password_confirmation) {
        newErrors.password_confirmation = 'Please confirm your password';
      } else if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = 'Passwords do not match';
      }
      if (!formData.firm_name.trim()) {
        newErrors.firm_name = 'Firm name is required';
      }
    }

    if (stepNumber === 3) {
      if (!formData.terms_accepted) {
        newErrors.terms_accepted = 'You must accept the terms and conditions';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setStep(step - 1);
    setErrors({});
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;
    
    setLoading(true);
    setErrors({});

    try {
      const result = await register(formData);
      
      if (result.success) {
        // Registration successful, redirect to dashboard
        navigate('/dashboard');
      } else {
        // Handle registration errors
        if (typeof result.error === 'object') {
          setErrors(result.error);
        } else {
          setErrors({ general: result.error });
        }
      }
    } catch (error) {
      setErrors({ general: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Personal Information
  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-ca-dark">Personal Information</h2>
        <p className="text-ca-neutral mt-2">Enter your basic details</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-ca-dark">
          Full Name *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-4 h-4 w-4 text-ca-neutral" />
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ca-primary focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your full name"
          />
        </div>
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-ca-dark">
          Email Address *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-4 h-4 w-4 text-ca-neutral" />
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ca-primary focus:border-transparent ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your email address"
          />
        </div>
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="ca_license_number" className="block text-sm font-medium text-ca-dark">
          CA License Number *
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-4 h-4 w-4 text-ca-neutral" />
          <input
            id="ca_license_number"
            name="ca_license_number"
            type="text"
            required
            value={formData.ca_license_number}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ca-primary focus:border-transparent ${
              errors.ca_license_number ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your CA license number"
          />
        </div>
        {errors.ca_license_number && <p className="text-red-500 text-sm">{errors.ca_license_number}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="block text-sm font-medium text-ca-dark">
          Phone Number *
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-4 h-4 w-4 text-ca-neutral" />
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            value={formData.phone}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ca-primary focus:border-transparent ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your phone number"
          />
        </div>
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
      </div>
    </div>
  );

  // Step 2: Professional Information & Security
  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-ca-dark">Professional & Security</h2>
        <p className="text-ca-neutral mt-2">Setup your firm details and secure password</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="firm_name" className="block text-sm font-medium text-ca-dark">
          Firm Name *
        </label>
        <input
          id="firm_name"
          name="firm_name"
          type="text"
          required
          value={formData.firm_name}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ca-primary focus:border-transparent ${
            errors.firm_name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your firm name"
        />
        {errors.firm_name && <p className="text-red-500 text-sm">{errors.firm_name}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="city" className="block text-sm font-medium text-ca-dark">
            City
          </label>
          <input
            id="city"
            name="city"
            type="text"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ca-primary focus:border-transparent"
            placeholder="Enter your city"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="state" className="block text-sm font-medium text-ca-dark">
            State
          </label>
          <input
            id="state"
            name="state"
            type="text"
            value={formData.state}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ca-primary focus:border-transparent"
            placeholder="Enter your state"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="address" className="block text-sm font-medium text-ca-dark">
          Address
        </label>
        <textarea
          id="address"
          name="address"
          rows="3"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ca-primary focus:border-transparent"
          placeholder="Enter your complete address"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-ca-dark">
          Password *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-4 h-4 w-4 text-ca-neutral" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            value={formData.password}
            onChange={handleChange}
            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ca-primary focus:border-transparent ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Create a strong password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-4 text-ca-neutral hover:text-ca-dark"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        <div className="text-sm text-ca-neutral">
          Password must be at least 8 characters long
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="password_confirmation" className="block text-sm font-medium text-ca-dark">
          Confirm Password *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-4 h-4 w-4 text-ca-neutral" />
          <input
            id="password_confirmation"
            name="password_confirmation"
            type={showConfirmPassword ? "text" : "password"}
            required
            value={formData.password_confirmation}
            onChange={handleChange}
            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ca-primary focus:border-transparent ${
              errors.password_confirmation ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Confirm your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-4 text-ca-neutral hover:text-ca-dark"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password_confirmation && <p className="text-red-500 text-sm">{errors.password_confirmation}</p>}
      </div>
    </div>
  );

  // Step 3: Terms & Confirmation
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-ca-dark">Review & Confirm</h2>
        <p className="text-ca-neutral mt-2">Review your information and accept terms</p>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-ca-dark mb-3">Registration Summary</h3>
        <div className="space-y-2 text-sm">
          <div><span className="font-medium">Name:</span> {formData.name}</div>
          <div><span className="font-medium">Email:</span> {formData.email}</div>
          <div><span className="font-medium">CA License:</span> {formData.ca_license_number}</div>
          <div><span className="font-medium">Firm:</span> {formData.firm_name}</div>
          <div><span className="font-medium">Phone:</span> {formData.phone}</div>
          {formData.city && <div><span className="font-medium">Location:</span> {formData.city}, {formData.state}</div>}
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="border border-gray-200 rounded-lg p-4 max-h-40 overflow-y-auto bg-gray-50">
        <h4 className="font-semibold mb-2">Terms and Conditions</h4>
        <div className="text-sm text-ca-neutral space-y-2">
          <p>By creating an account, you agree to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Provide accurate and truthful information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Use the service in accordance with applicable laws</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Our data processing practices as outlined in our Privacy Policy</li>
            <li>The secure handling of your documents with encryption</li>
          </ul>
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            name="terms_accepted"
            checked={formData.terms_accepted}
            onChange={handleChange}
            className={`mt-1 w-4 h-4 text-ca-primary border-2 rounded focus:ring-ca-primary ${
              errors.terms_accepted ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <span className="text-sm text-ca-dark">
            I accept the <Link to="/terms" className="text-ca-primary hover:underline">Terms and Conditions</Link> and{' '}
            <Link to="/privacy" className="text-ca-primary hover:underline">Privacy Policy</Link>
          </span>
        </label>
        {errors.terms_accepted && <p className="text-red-500 text-sm">{errors.terms_accepted}</p>}
      </div>

      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{errors.general}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-ca-light via-white to-blue-50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-ca-primary rounded-2xl flex items-center justify-center mx-auto mb-4 ca-shadow">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-ca-dark">Join CA Portal</h1>
          <p className="text-ca-neutral mt-2">Create your secure document management account</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= stepNumber
                    ? 'bg-ca-primary text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > stepNumber ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  stepNumber
                )}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-ca-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-xl p-6 border-0">
          <form onSubmit={handleSubmit}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-3 border border-ca-primary text-ca-primary rounded-lg hover:bg-ca-primary hover:text-white transition-colors"
                >
                  Previous
                </button>
              )}
              
              <div className="ml-auto">
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-8 py-3 bg-ca-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-ca-primary text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-ca-neutral">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-ca-primary hover:underline font-medium"
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Security Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-ca-neutral">
            🔒 Your data is protected with enterprise-grade encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;