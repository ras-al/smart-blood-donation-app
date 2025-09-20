import React, { useState } from 'react';
import AuthComponent from '../components/auth/AuthComponent';

const AuthPage: React.FC = () => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    return (
        <div className="auth-page">
            <div className="auth-form-container">
                <div className="auth-tabs">
                    <button onClick={() => setMode('login')} className={mode === 'login' ? 'active' : ''}>Login</button>
                    <button onClick={() => setMode('register')} className={mode === 'register' ? 'active' : ''}>Register</button>
                </div>
                <AuthComponent mode={mode} />
            </div>
        </div>
    );
};

export default AuthPage;