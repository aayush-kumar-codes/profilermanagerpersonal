'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setTokens, setUser } from '@/lib/auth';
import { validators } from '@/lib/utils/validation';
import { api } from '@/lib/utils/api';
import { useConfirmModal } from '@/lib/hooks/useConfirmModal';
import ConfirmModal from '../components/ConfirmModal';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const modal = useConfirmModal();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name as keyof typeof touched]) {
      let error = '';
      if (name === 'email') error = validators.email(value) || '';
      if (name === 'password') error = validators.password(value) || '';
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    let error = '';
    if (name === 'email') error = validators.email(value) || '';
    if (name === 'password') error = validators.password(value) || '';
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailError = validators.email(formData.email) || '';
    const passwordError = validators.password(formData.password) || '';

    setErrors({
      email: emailError,
      password: passwordError,
    });

    setTouched({
      email: true,
      password: true,
    });

    if (!emailError && !passwordError) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          setErrors((prev) => ({ ...prev, email: data.error }));
        } else {
          setTokens(data.tokens.accessToken, data.tokens.refreshToken);
          setUser(data.user);
          router.push('/dashboard');
        }
      } catch (error) {
        setErrors((prev) => ({ ...prev, email: 'Something went wrong. Please try again.' }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">Login</h1>
        <p className="auth-subtitle">Welcome back</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${errors.email && touched.email ? 'input-error' : ''}`}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {errors.email && touched.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${errors.password && touched.password ? 'input-error' : ''}`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L4.16852 4.87562C2.05102 6.32912 0.833336 9.16667 0.833336 10C0.833336 11.6667 4.16667 16.6667 10 16.6667C12.1562 16.6667 13.9844 15.9844 15.3125 15.1458L17.1464 16.9797C17.3417 17.175 17.6583 17.175 17.8536 16.9797C18.0488 16.7845 18.0488 16.4679 17.8536 16.2726L2.85355 2.14645Z"
                      fill="currentColor"
                    />
                    <path
                      d="M6.25 6.25L13.75 13.75M10 3.33333C5.83333 3.33333 2.5 8.33333 2.5 10C2.5 10.8333 3.33333 12.5 4.58333 13.75M15.4167 15.4167C16.6667 14.1667 17.5 12.5 17.5 10C17.5 8.33333 14.1667 3.33333 10 3.33333"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 3.33333C5.83333 3.33333 2.5 8.33333 2.5 10C2.5 11.6667 5.83333 16.6667 10 16.6667C14.1667 16.6667 17.5 11.6667 17.5 10C17.5 8.33333 14.1667 3.33333 10 3.33333Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && touched.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? <span className="loading-spinner"></span> : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
