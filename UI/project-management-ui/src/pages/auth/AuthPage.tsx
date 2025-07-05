import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import './AuthPage.css';

interface LoginFormValues {
    email: string;
    password: string;
}

interface RegisterFormValues extends LoginFormValues {
    name: string;
}

const AuthPage = () => {
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useUser();

    const toggleForm = () => {
        setIsRegisterMode(!isRegisterMode);
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
            const userData = {
                id: response.data.userId,
                email: response.data.email,
                name: response.data.name,
                role: response.data.role
            };
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
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
            const userData = {
                id: response.data.userId,
                email: response.data.email,
                name: response.data.name,
                role: response.data.role
            };
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            navigate('/dashboard');
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed. Please try again.');
        }
    };

    return (
        <div className={`auth-container ${isRegisterMode ? 'register-mode' : ''}`}>
            {/* Form Panel */}
            <div className="auth-panel">
                <div className="auth-form-wrapper">
                    {!isRegisterMode ? (
                        <div className="auth-form">
                            <h2 className="auth-title">Login</h2>
                            <Formik
                                initialValues={initialLoginValues}
                                validationSchema={loginSchema}
                                onSubmit={handleLogin}
                            >
                                {({ isSubmitting }) => (
                                    <Form>
                                        <div className="form-group">
                                            <Field
                                                type="email"
                                                name="email"
                                                placeholder="Enter your email"
                                                className="form-input"
                                            />
                                            <ErrorMessage name="email" component="div" className="form-error" />
                                        </div>
                                        <div className="form-group">
                                            <Field
                                                type="password"
                                                name="password"
                                                placeholder="Enter your password"
                                                className="form-input"
                                            />
                                            <ErrorMessage name="password" component="div" className="form-error" />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="form-button"
                                        >
                                            Login
                                        </button>
                                    </Form>
                                )}
                            </Formik>
                            <p className="form-footer">
                                Don't have an account?{' '}
                                <button
                                    onClick={toggleForm}
                                    className="form-link"
                                >
                                    Signup now
                                </button>
                            </p>
                        </div>
                    ) : (
                        <div className="auth-form">
                            <h2 className="auth-title">Register</h2>
                            <Formik
                                initialValues={initialRegisterValues}
                                validationSchema={registerSchema}
                                onSubmit={handleRegister}
                            >
                                {({ isSubmitting }) => (
                                    <Form>
                                        <div className="form-group">
                                            <Field
                                                type="text"
                                                name="name"
                                                placeholder="Enter your name"
                                                className="form-input"
                                            />
                                            <ErrorMessage name="name" component="div" className="form-error" />
                                        </div>
                                        <div className="form-group">
                                            <Field
                                                type="email"
                                                name="email"
                                                placeholder="Enter your email"
                                                className="form-input"
                                            />
                                            <ErrorMessage name="email" component="div" className="form-error" />
                                        </div>
                                        <div className="form-group">
                                            <Field
                                                type="password"
                                                name="password"
                                                placeholder="Enter your password"
                                                className="form-input"
                                            />
                                            <ErrorMessage name="password" component="div" className="form-error" />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="form-button"
                                        >
                                            Register
                                        </button>
                                    </Form>
                                )}
                            </Formik>
                            <p className="form-footer">
                                Already have an account?{' '}
                                <button
                                    onClick={toggleForm}
                                    className="form-link"
                                >
                                    Login
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Gradient Panel */}
            <div className="gradient-panel">
                <div className="gradient-content">
                    <h1 className="gradient-title">Every new friend is a new adventure.</h1>
                    <p className="gradient-subtitle">Let's get connected</p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;