'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import { useAuthActions } from '../hooks/useAuthActions';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { login, busy, error, setError } = useAuthActions();
  async function handleSubmit(event) {
    event.preventDefault();
    try { const result = await login(form); window.location.assign(result.redirectTo || '/dashboard'); }
    catch { /* Error ko form ke paas dikhaya gaya hai. */ }
  }
  return <AuthLayout eyebrow="WELCOME BACK">
    <div className={styles.heading}><span className={styles.icon}><LockKeyhole size={22} /></span><p className={styles.kicker}>SIGN IN TO INVENTUAL</p><h2>Welcome back</h2><p>Enter your account details to continue to your workspace.</p></div>
    <form className={styles.form} onSubmit={handleSubmit}>
      <FormField label="Email address" htmlFor="login-email" required><Input id="login-email" name="email" type="email" autoComplete="username" placeholder="name@company.com" value={form.email} onChange={(event) => { setError(''); setForm((current) => ({ ...current, email: event.target.value })); }} required /></FormField>
      <div className={styles.passwordField}>
        <label className={styles.passwordLabel} htmlFor="login-password">Password <span aria-hidden="true">*</span></label>
        <div className={styles.passwordControl}>
          <Input id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={(event) => { setError(''); setForm((current) => ({ ...current, password: event.target.value })); }} required />
          <button className={styles.passwordToggle} type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>
            {showPassword ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
          </button>
        </div>
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <Button type="submit" className={styles.submit} loading={busy} trailingIcon={!busy && <ArrowRight size={18} />}>Sign in</Button>
    </form>
    <p className={styles.switch}>New to Inventual? <Link href="/register">Create a company account</Link></p>
  </AuthLayout>;
}
