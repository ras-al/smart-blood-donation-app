import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser, Role, RegisterData } from '../../services/authService';

const AuthComponent: React.FC<{ mode: 'login' | 'register' }> = ({ mode }) => {
    const [email, setEmail] = useState(''); // Still needed for login
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState<Role>('donor');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Additional state for role-specific fields
    const [bloodType, setBloodType] = useState('A+');
    const [location, setLocation] = useState('');
    const [orgName, setOrgName] = useState('');
    const [hospitalName, setHospitalName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (mode === 'register') {
                // --- NEW LOGIC: Generate email from username and role ---
                if (!username) {
                    setError("Username is required.");
                    return;
                }
                
                let generatedEmail = '';
                switch (role) {
                    case 'donor':
                        generatedEmail = `${username.toLowerCase()}@donor.com`;
                        break;
                    case 'organizer':
                        generatedEmail = `${username.toLowerCase()}@organizer.com`;
                        break;
                    case 'hospital':
                        generatedEmail = `${username.toLowerCase()}@hospital.com`;
                        break;
                }

                const registrationData: RegisterData = {
                    email: generatedEmail, // Use the auto-generated email
                    password,
                    username,
                    role,
                    bloodType,
                    location,
                    organizationName: orgName,
                    hospitalName
                };
                await registerUser(registrationData);
            } else {
                // Login logic remains unchanged
                await loginUser(email, password);
            }
            navigate('/dashboard');
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                setError('This username is already taken. Please try another one.');
            } else if (err.code === 'auth/invalid-email') {
                setError('The generated email is invalid. Please use a different username.');
            } else {
                setError(err.message);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            {error && <p className="auth-error">{error}</p>}
            
            {/* Show Username field for both login and register */}
            <div className="form-group">
                <label>{mode === 'login' ? 'Email' : 'Username'}</label>
                <input 
                    type="text" 
                    value={mode === 'login' ? email : username} 
                    onChange={e => mode === 'login' ? setEmail(e.target.value) : setUsername(e.target.value)} 
                    placeholder={mode === 'login' ? 'yourname@domain.com' : 'Choose a username'}
                    required 
                />
            </div>

            <div className="form-group">
                <label>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            {mode === 'register' && (
                <>
                    {/* Role selector and role-specific fields remain the same */}
                    <div className="form-group">
                        <label>I am a...</label>
                        <select value={role} onChange={e => setRole(e.target.value as Role)}>
                            <option value="donor">Donor</option>
                            <option value="hospital">Hospital Staff</option>
                            <option value="organizer">Campaign Organizer</option>
                        </select>
                    </div>
                    {role === 'donor' && (
                        <>
                            <div className="form-group">
                                <label>Blood Type</label>
                                <select value={bloodType} onChange={e => setBloodType(e.target.value)}>
                                    <option>A+</option><option>A-</option>
                                    <option>B+</option><option>B-</option>
                                    <option>AB+</option><option>AB-</option>
                                    <option>O+</option><option>O-</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Location (City)</label>
                                <input type="text" value={location} onChange={e => setLocation(e.target.value)} required />
                            </div>
                        </>
                    )}
                    {role === 'hospital' && (
                        <div className="form-group">
                            <label>Hospital Name</label>
                            <input type="text" value={hospitalName} onChange={e => setHospitalName(e.target.value)} required />
                        </div>
                    )}
                    {role === 'organizer' && (
                        <div className="form-group">
                            <label>Organization Name</label>
                            <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} required />
                        </div>
                    )}
                </>
            )}
            <button type="submit" className="auth-button">
                {mode === 'login' ? 'Log In' : 'Create Account'}
            </button>
        </form>
    );
};

export default AuthComponent;