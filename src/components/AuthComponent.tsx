import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

type AuthMode = 'login' | 'register';

interface AuthComponentProps {
    mode: AuthMode;
}

const AuthComponent: React.FC<AuthComponentProps> = ({ mode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState<'donor' | 'hospital' | 'organizer'>('donor');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (mode === 'register') {
                if (!username) {
                    setError("Username is required.");
                    return;
                }
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, "users", userCredential.user.uid), {
                    username,
                    email,
                    role
                });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            {error && <p className="auth-error">{error}</p>}
            {mode === 'register' && (
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} required />
                </div>
            )}
            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {mode === 'register' && (
                <div className="form-group">
                    <label htmlFor="role">I am a...</label>
                    <select id="role" value={role} onChange={e => setRole(e.target.value as any)}>
                        <option value="donor">Donor</option>
                        <option value="hospital">Hospital Staff</option>
                        <option value="organizer">Campaign Organizer</option>
                    </select>
                </div>
            )}
            <button type="submit" className="auth-button">
                {mode === 'login' ? 'Log In' : 'Create Account'}
            </button>
        </form>
    );
};

export default AuthComponent;
