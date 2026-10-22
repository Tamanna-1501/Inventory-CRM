'use client';

import Link from 'next/link';
import { Check, Circle, ListChecks } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useOnboardingSteps } from '../hooks/useDashboard';
import styles from './OnboardingChecklist.module.css';

export default function OnboardingChecklist() {
  const { steps, failed } = useOnboardingSteps();
  const { canPath } = useAuth();
  if (failed || !steps.length) return null;
  const completed = steps.filter((step) => step.done).length;
  const allDone = completed === steps.length;
  const progress = Math.round((completed / steps.length) * 100);
  return <section className={styles.card} aria-label="Company onboarding checklist">
    <header className={styles.heading}><span className={styles.icon}><ListChecks size={21} /></span><div className={styles.title}><h2>{allDone ? 'Setup complete' : 'Get started with Inventual'}</h2><p>{allDone ? 'Your company has completed the onboarding steps.' : 'Complete these steps to prepare your inventory workflow.'}</p></div><span className={styles.progressLabel}>{completed} of {steps.length} complete</span></header>
    <div className={styles.progressTrack} role="progressbar" aria-label="Setup progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span className={styles.progressFill} style={{ '--progress': `${progress}%` }} /></div>
    <ol className={styles.steps}>{steps.map((step) => {
      const allowed = canPath(step.href);
      const Icon = step.done ? Check : Circle;
      return <li key={step.key} className={`${styles.step} ${step.done ? styles.done : ''}`}>
        <span className={styles.stepMark} aria-hidden="true"><Icon size={18} /></span><div className={styles.stepCopy}><strong>{step.title}</strong>
          {step.done ? <span className={styles.meta}>{Number(step.count || 0).toLocaleString()} {step.count === 1 ? 'record' : 'records'}</span> : allowed ? <Link href={step.href} className={styles.stepLink}>Start this step</Link> : <span className={styles.meta}>Ask your company admin to complete this step.</span>}
        </div>
      </li>;
    })}</ol>
  </section>;
}
