import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { School, Eye, EyeOff, CheckCircle, User, Users, GraduationCap } from 'lucide-react';

const formatRegisterError = (err: unknown): string => {
  const message = err instanceof Error ? err.message : 'Failed to create account';

  // Handle common Firebase Auth error string (in case the auth implementation changes)
  if (message.includes('auth/email-already-in-use') || message.includes('email-already-in-use')) {
    return 'Email sudah terdaftar. Silakan login.';
  }

  return message;
};

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'parent' | 'teacher' | 'student'>('parent');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [teacherInfo, setTeacherInfo] = useState({
    schoolName: '',
    teacherId: '',
    department: '',
    district: '',
    subjects: [] as string[],
    gradeLevels: [] as string[],
    yearsExperience: 0,
    certifications: [] as string[],
  });

  const [nisn, setNisn] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleTeacherInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTeacherInfo((prev) => ({
      ...prev,
      [name]: name === 'yearsExperience' ? parseInt(value, 10) || 0 : ['subjects', 'gradeLevels', 'certifications'].includes(name) ? value.split(',').map((item) => item.trim()) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (role === 'student' && !nisn) {
      setError('Please provide your NISN');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (role === 'teacher') {
      const requiredTeacherFields = ['schoolName', 'teacherId', 'department', 'subjects', 'gradeLevels'];
      const missingFields = requiredTeacherFields.filter(
        (field) => !teacherInfo[field as keyof typeof teacherInfo]
      );

      if (missingFields.length > 0) {
        setError('Please complete all required teacher information');
        return;
      }
    }

    setError('');
    setIsLoading(true);

    try {
      console.log('Registering user with:', {
        name,
        email,
        role,
        nisn,
        teacherInfo: role === 'teacher' ? teacherInfo : undefined,
      });

      await register(name, email, password, role, nisn, role === 'teacher' ? teacherInfo : undefined);
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      setError(formatRegisterError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <div className="flex justify-center">
            <div className="bg-blue-100 rounded-full p-3">
              <School className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Join BOS Monitor to review and track school fund transparency
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a:
              </label>
              <div className="grid grid-cols-3 gap-4">
                {['parent', 'teacher', 'student'].map((roleOption) => (
                  <button
                    key={roleOption}
                    type="button"
                    onClick={() => setRole(roleOption as typeof role)}
                    className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 ${
                      role === roleOption
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {roleOption === 'parent' && <User className="h-5 w-5 mr-2" />}
                    {roleOption === 'teacher' && <GraduationCap className="h-5 w-5 mr-2" />}
                    {roleOption === 'student' && <Users className="h-5 w-5 mr-2" />}
                    <span>{roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}</span>
                    {role === roleOption && <CheckCircle className="h-5 w-5 ml-2 text-blue-500" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Role-specific Fields */}
            {role === 'student' && (
              <div>
                <label htmlFor="nisn" className="block text-sm font-medium text-gray-700">
                  NISN (Number) <span className="text-red-500">*</span>
                </label>
                <input
                  id="nisn"
                  type="text"
                  required
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}

            {role === 'teacher' && (
              <div className="space-y-6 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">Teacher Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(teacherInfo).map(([key, value]) => (
                    <div key={key}>
                      <label
                        htmlFor={key}
                        className="block text-sm font-medium text-gray-700"
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}{' '}
                        {['schoolName', 'teacherId', 'department', 'subjects', 'gradeLevels'].includes(key) && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <input
                        id={key}
                        name={key}
                        type="text"
                        value={value}
                        onChange={handleTeacherInfoChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Already have an account? Login
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="mt-6 border-t border-gray-200 pt-6">
          <p className="text-xs text-center text-gray-500">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;