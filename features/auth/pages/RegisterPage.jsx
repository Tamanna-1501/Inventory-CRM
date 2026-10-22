'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import { useAuthActions } from '../hooks/useAuthActions';
import styles from './RegisterPage.module.css';

const INITIAL_FORM = { companyName: '', phone: '', adminName: '', email: '', password: '' };

export default function RegisterPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const { register, busy, error, setError } = useAuthActions();
  function update(event) { setError(''); setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function handleSubmit(event) {
    event.preventDefault();
    try { const result = await register(form); window.location.assign(result.redirectTo || '/dashboard'); }
    catch { /* Error ko form ke paas dikhaya gaya hai. */ }
  }
  return <AuthLayout eyebrow="START YOUR WORKSPACE">
    <div className={styles.heading}><span className={styles.icon}><Building2 size={22} /></span><p className={styles.kicker}>COMPANY REGISTRATION</p><h2>Create your workspace</h2><p>Set up your company and administrator account to get started.</p></div>
    <form className={styles.form} onSubmit={handleSubmit}>
      <FormField label="Company name" htmlFor="register-company" required><Input id="register-company" name="companyName" autoComplete="organization" placeholder="Your company name" value={form.companyName} onChange={update} maxLength={191} required /></FormField>
      <div className={styles.row}><FormField label="Administrator name" htmlFor="register-name" required><Input id="register-name" name="adminName" autoComplete="name" placeholder="Your name" value={form.adminName} onChange={update} maxLength={191} required /></FormField><FormField label="Phone" htmlFor="register-phone"><Input id="register-phone" name="phone" type="tel" autoComplete="tel" placeholder="Phone number" value={form.phone} onChange={update} maxLength={40} /></FormField></div>
      <FormField label="Email address" htmlFor="register-email" required><Input id="register-email" name="email" type="email" autoComplete="email" placeholder="name@company.com" value={form.email} onChange={update} maxLength={191} required /></FormField>
      <div className={styles.passwordField}>
        <label className={styles.passwordLabel} htmlFor="register-password">Password <span aria-hidden="true">*</span></label>
        <div className={styles.passwordControl}>
          <Input id="register-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Create a password" value={form.password} onChange={update} minLength={8} aria-describedby="register-password-hint" required />
          <button className={styles.passwordToggle} type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>
            {showPassword ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
          </button>
        </div>
        <p className={styles.passwordHint} id="register-password-hint">Use at least 8 characters.</p>
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <Button type="submit" className={styles.submit} loading={busy} trailingIcon={!busy && <ArrowRight size={18} />}>Create company account</Button>
    </form>
    <p className={styles.switch}>Already have an account? <Link href="/login">Sign in</Link></p>
  </AuthLayout>;
}
