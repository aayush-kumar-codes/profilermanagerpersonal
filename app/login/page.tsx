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
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${errors.password && touched.password ? 'input-error' : ''}`}
              placeholder="Enter your password"
              disabled={isLoading}
            />
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
