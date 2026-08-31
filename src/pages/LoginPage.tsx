import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import useForm from '../hooks/useForm';
import useToast from '../hooks/useToast';

interface LoginFields {
    email: string;
    password: string;
}

function validateLogin(values: LoginFields): Partial<Record<keyof LoginFields, string>> {
    const errors: Partial<Record<keyof LoginFields, string>> = {};
    if (!values.email.trim()) errors.email = 'Email is required.';
    if (!values.password) errors.password = 'Password is required.';
    return errors;
}

function LoginPage() {
    const { values, errors, handleChange, validateForm } = useForm<LoginFields>(
        { email: '', password: '' },
        validateLogin
    );
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            await login({ email: values.email, password: values.password });
            navigate('/dashboard');
        } catch (err) {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message ?? 'Login failed. Check your credentials.';
            showToast(message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={handleSubmit} noValidate>
                <div className="auth-card__mark">◆</div>
                <h1 className="auth-card__heading">Manager Login</h1>
                <p className="auth-card__subtitle">Employee Performance Dashboard</p>

                <label className="field">
                    <span className="field__label">Email</span>
                    <input
                        className="field__input"
                        type="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                    />
                    {errors.email && <span className="field__error">{errors.email}</span>}
                </label>

                <label className="field">
                    <span className="field__label">Password</span>
                    <input
                        className="field__input"
                        type="password"
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                    />
                    {errors.password && <span className="field__error">{errors.password}</span>}
                </label>

                <button className="auth-card__submit" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Logging in…' : 'Log in'}
                </button>

                <p className="auth-card__hint">
                    Seeded logins: admin@stackly.dev / admin123 · manager@stackly.dev / manager123
                </p>
            </form>
        </div>
    );
}

export default LoginPage;