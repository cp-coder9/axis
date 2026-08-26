'use client';

import { FormEvent, ReactNode, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { PublicLandingPage } from './PublicLandingPage';
import { REGISTRATION_ROLE_FIELDS, REGISTRATION_ROLE_GROUPS, ROLES } from '@/lib/data';
import { ArrowLeft, ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react';

type AccessView = 'landing' | 'access';
type AccessMode = 'signin' | 'register';

export function AccessGateway({ children }: { children: ReactNode }) {
  const { status, login, register, logout, error } = useAuth();
  const [view, setView] = useState<AccessView>('landing');
  const [mode, setMode] = useState<AccessMode>('signin');
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const enterWorkspace = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    try {
      await login(String(form.get('email') ?? ''), String(form.get('password') ?? ''));
    } catch {
      // AuthProvider owns the actionable error presented by this gateway.
    } finally {
      setPending(false);
    }
  };

  const createAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    const form = new FormData(event.currentTarget);
    const roleKey = String(form.get('role') ?? '');
    const profile: Record<string, string> = {};
    for (const field of REGISTRATION_ROLE_FIELDS[roleKey as keyof typeof REGISTRATION_ROLE_FIELDS] ?? []) {
      const value = String(form.get(field.name) ?? '').trim();
      if (value) profile[field.name] = value;
    }
    try {
      const result = await register({
        name: String(form.get('name') ?? ''),
        organization_name: String(form.get('organization_name') ?? ''),
        email: String(form.get('email') ?? ''),
        password: String(form.get('password') ?? ''),
        role_key: roleKey,
        profile,
      });
      setNotice(result.verification_token
        ? `Prototype verification token: ${result.verification_token}`
        : 'Registration received. Check your email to verify the account.');
    } catch (registrationError) {
      setNotice(registrationError instanceof Error ? registrationError.message : 'Registration failed');
    } finally {
      setPending(false);
    }
  };

  if (status === 'restoring') return <div className="access-shell" role="status" aria-live="polite"><span className="access-kicker">Restoring secure session…</span></div>;
  if (status === 'authenticated') return <>{children}<button type="button" className="access-signout" disabled={pending} onClick={async () => { setPending(true); await logout(); setPending(false); }}>Sign out</button></>;

  if (view === 'landing') {
    return (
      <PublicLandingPage
        onSignIn={() => { setMode('signin'); setView('access'); }}
        onSignUp={() => { setMode('register'); setNotice(null); setView('access'); }}
      />
    );
  }

  return (
    <V8Access
      mode={mode}
      onModeChange={(next) => { setMode(next); setNotice(null); }}
      onBack={() => setView('landing')}
      error={error}
      notice={notice}
      onSignInSubmit={enterWorkspace}
      onRegisterSubmit={createAccount}
      pending={pending}
    />
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className={`access-brand ${compact ? 'compact' : ''}`}><img src="/logo.png" alt="Architex" /><div><strong>{compact ? 'ARCHITEX' : 'Architex OS'}</strong>{!compact && <span>Built environment access</span>}</div></div>;
}

function V8Access({ mode, onModeChange, onBack, error, notice, onSignInSubmit, onRegisterSubmit, pending }: {
  mode: AccessMode;
  onModeChange: (mode: AccessMode) => void;
  onBack: () => void;
  error: string | null;
  notice: string | null;
  onSignInSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  onRegisterSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  pending: boolean;
}) {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const registering = mode === 'register';
  const roleFields = REGISTRATION_ROLE_FIELDS[selectedRole as keyof typeof REGISTRATION_ROLE_FIELDS] ?? [];
  return (
    <div className="v8-signin">
      <button className="v8-signin-back" onClick={onBack}><ArrowLeft size={16} /> Back to landing</button>
      <section className="v8-signin-panel" data-mode={mode}>
        <div className="v8-signin-identity">
          <Brand />
          <div className="v8-access-badge" key={`badge-${mode}`}><LockKeyhole size={14} /> {registering ? 'V8 secure enrolment' : 'V8 secure access'}</div>
          <h1 key={`title-${mode}`}>{registering ? 'Join Architex OS' : 'Welcome back'}</h1>
          <p key={`copy-${mode}`}>{registering
            ? 'Create your governed account, pick your role profile, and mount a workspace shaped around your part of the built environment.'
            : 'Resume your governed workspace with project context, evidence controls, and role permissions intact.'}</p>
          <div className="v8-status-stack"><span><i /> Identity boundary active</span><span><i /> Audit trail ready</span><span><i /> Workspace encrypted</span></div>
        </div>
        <form className="v8-signin-form" onSubmit={registering ? onRegisterSubmit : onSignInSubmit}>
          <div className="v8-form-head" key={mode}>
            <span className="v8-step">{registering ? '01 / Enrol' : '01 / Authenticate'}</span>
            <h2>{registering ? 'Create your account' : 'Enter Architex OS'}</h2>
            <p>{registering
              ? 'Choose your role profile — professional registrations and supplier credentials mount the correct command centre.'
              : 'Use your organisation credentials to mount the V8 shell.'}</p>
          </div>
          <div className="v8-mode-switch" role="tablist" aria-label="Authentication mode">
            <button type="button" role="tab" aria-selected={!registering} onClick={() => onModeChange('signin')}>Sign in</button>
            <button type="button" role="tab" aria-selected={registering} onClick={() => onModeChange('register')}>Create account</button>
          </div>
          <div className={`v8-morph-zone ${registering ? 'open' : ''}`} aria-hidden={!registering}>
            <div>
              <label>Full name<input name="name" aria-label="Full name" placeholder="John Doe" autoComplete="name" disabled={!registering} required={registering} /></label>
              <label>Organisation name<input name="organization_name" aria-label="Organisation name" placeholder="Your practice or organisation" autoComplete="organization" disabled={!registering} required={registering} /></label>
              <label>Role profile<select name="role" aria-label="Role profile" value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)} disabled={!registering} required={registering}>
                <option value="" disabled>Select your role profile…</option>
                {REGISTRATION_ROLE_GROUPS.map(({ group, roleKeys }) => (
                  <optgroup key={group} label={group}>
                    {roleKeys.map((roleKey) => {
                      const role = ROLES.find((entry) => entry.key === roleKey);
                      return role ? <option key={roleKey} value={roleKey}>{role.label}</option> : null;
                    })}
                  </optgroup>
                ))}
              </select></label>
              <div className={`v8-morph-zone v8-role-fields ${selectedRole ? 'open' : ''}`} aria-hidden={!selectedRole} key={selectedRole || 'empty'}>
                <div>
                  {roleFields.map((field) => field.options ? (
                    <label key={field.name}>{field.label}<select name={field.name} aria-label={field.label} defaultValue="" disabled={!registering} required={registering && field.required}>
                      <option value="" disabled>Select…</option>
                      {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select></label>
                  ) : (
                    <label key={field.name}>{field.label}<input name={field.name} aria-label={field.label} placeholder={field.placeholder} disabled={!registering} required={registering && Boolean(field.required)} /></label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <label>Email address<input name="email" aria-label="Email address" type="email" placeholder="name@example.com" autoComplete="email" required /></label>
          <label>Password<input name="password" aria-label="Password" type="password" placeholder="••••••••" minLength={registering ? 12 : undefined} autoComplete={registering ? 'new-password' : 'current-password'} required /></label>
          <div className="v8-form-meta"><label><input type="checkbox" /> Keep this device trusted</label><button type="button">Recover access</button></div>
          <button className="v8-enter-button" disabled={pending}>{pending ? 'Working…' : registering ? 'Create account' : 'Enter workspace'} <ArrowRight size={17} /></button>
          {(notice || error) && <p role="alert">{notice ?? error}</p>}
          <p className="v8-auth-note"><ShieldCheck size={15} /> Protected by role-based access and immutable session logging.</p>
        </form>
      </section>
    </div>
  );
}
