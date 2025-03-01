import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

interface LoginFormValues {
    email: string;
    password: string;
}

interface RegisterFormValues extends LoginFormValues {
    name: string;
}

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();

    const toggleForm = () => {
        setIsLogin(!isLogin);
    };

    const initialLoginValues: LoginFormValues = {
        email: '',
        password: '',
    };

    const initialRegisterValues: RegisterFormValues = {
        email: '',
        password: '',
        name: '',
    };

    const loginSchema = Yup.object().shape({
        email: Yup.string().email('Invalid email').required('Required'),
        password: Yup.string().required('Required'),
    });

    const registerSchema = Yup.object().shape({
        email: Yup.string().email('Invalid email').required('Required'),
        password: Yup.string().min(6, 'Password must be at least 6 characters').required('Required'),
        name: Yup.string().required('Required'),
    });

    const handleLogin = async (values: LoginFormValues) => {
        try {
            const response = await axios.post('/api/auth/login', values);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify({
                email: response.data.email,
                name: response.data.name,
                userId: response.data.userId
            }));
            navigate('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please check your credentials.');
        }
    };

    const handleRegister = async (values: RegisterFormValues) => {
        try {
            const response = await axios.post('/api/auth/register', values);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify({
                email: response.data.email,
                name: response.data.name,
                userId: response.data.userId
            }));
            navigate('/dashboard');
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed. Please try again.');
        }
    };

    return (
        <div className="flex h-screen w-full">
            {/* Left side with form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <AnimatePresence mode="wait">
                        {isLogin ? (
                            <motion.div
                                key="login"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white shadow-md rounded-lg p-8"
                            >
                                <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Login</h2>
                                <Formik
                                    initialValues={initialLoginValues}
                                    validationSchema={loginSchema}
                                    onSubmit={handleLogin}
                                >
                                    {({ isSubmitting }) => (
                                        <Form>
                                            <div className="mb-4">
                                                <Field
                                                    type="email"
                                                    name="email"
                                                    placeholder="Enter your email"
                                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                                                />
                                                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>
                                            <div className="mb-6">
                                                <Field
                                                    type="password"
                                                    name="password"
                                                    placeholder="Enter your password"
                                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                                                />
                                                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full py-3 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50"
                                            >
                                                Login
                                            </button>
                                        </Form>
                                    )}
                                </Formik>
                                <p className="text-center mt-6 text-gray-600">
                                    Don't have an account?{' '}
                                    <button
                                        onClick={toggleForm}
                                        className="text-purple-600 font-semibold focus:outline-none"
                                    >
                                        Signup now
                                    </button>
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="register"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white shadow-md rounded-lg p-8"
                            >
                                <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Register</h2>
                                <Formik
                                    initialValues={initialRegisterValues}
                                    validationSchema={registerSchema}
                                    onSubmit={handleRegister}
                                >
                                    {({ isSubmitting }) => (
                                        <Form>
                                            <div className="mb-4">
                                                <Field
                                                    type="text"
                                                    name="name"
                                                    placeholder="Enter your name"
                                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                                                />
                                                <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>
                                            <div className="mb-4">
                                                <Field
                                                    type="email"
                                                    name="email"
                                                    placeholder="Enter your email"
                                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                                                />
                                                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>
                                            <div className="mb-6">
                                                <Field
                                                    type="password"
                                                    name="password"
                                                    placeholder="Enter your password"
                                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                                                />
                                                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full py-3 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50"
                                            >
                                                Register
                                            </button>
                                        </Form>
                                    )}
                                </Formik>
                                <p className="text-center mt-6 text-gray-600">
                                    Already have an account?{' '}
                                    <button
                                        onClick={toggleForm}
                                        className="text-purple-600 font-semibold focus:outline-none"
                                    >
                                        Login
                                    </button>
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Right side with gradient and message */}
            <div className="hidden lg:block lg:w-1/2 bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center">
                <div className="text-center px-8">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Every new friend is a new adventure.
                    </h1>
                    <p className="text-xl text-white">Let's get connected</p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;