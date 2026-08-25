'use client';

import { FormEvent, ReactNode, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { PublicLandingPage } from './PublicLandingPage';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Factory,
  Hammer,
  HardHat,
  LockKeyhole,
  ShieldCheck,
  Users,
} from 'lucide-react';

type AccessView = 'landing' | 'roles' | 'register' | 'role-login' | 'signin';

const roles = [
  { name: 'Client', description: 'I want to hire professionals for my building project', icon: Users },
  { name: 'Freelancer', description: 'I am a specialist or consultant (Engineer, etc.)', icon: BriefcaseBusiness },
  { name: 'BEP / Design Team', description: 'Architects, engineers, QSs, technologists, and design-team leads', icon: Building2 },
  { name: 'Contractor', description: 'I manage construction delivery, tendering, and site work', icon: HardHat },
  { name: 'Subcontractor', description: 'I deliver a trade package, evidence, and close-out items', icon: Hammer },
  { name: 'Supplier', description: 'I supply materials, products, deliveries, or warranties', icon: Factory },
];

export function AccessGateway({ children }: { children: ReactNode }) {
  const { status, login, register, error } = useAuth();
  const [view, setView] = useState<AccessView>('landing');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const enterWorkspace = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await login(String(form.get('email') ?? ''), String(form.get('password') ?? '')).catch(() => undefined);
  };

  const createAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const result = await register({
        name: String(form.get('name') ?? ''),
        organization_name: String(form.get('organization_name') ?? ''),
        email: String(form.get('email') ?? ''),
        password: String(form.get('password') ?? ''),
      });
      setNotice(result.verification_token
        ? `Prototype verification token: ${result.verification_token}`
        : 'Registration received. Check your email to verify the account.');
    } catch (registrationError) {
      setNotice(registrationError instanceof Error ? registrationError.message : 'Registration failed');
    }
  };

  if (status === 'restoring') return <div className="access-shell" role="status" aria-live="polite"><span className="access-kicker">Restoring secure session…</span></div>;
  if (status === 'authenticated') return <>{children}</>;

  if (view === 'landing') {
    return <PublicLandingPage onSignIn={() => setView('signin')} onSignUp={() => setView('roles')} />;
  }

  if (view === 'signin') {
    return <V8SignIn onBack={() => setView('landing')} onSubmit={enterWorkspace} error={error} />;
  }

  return (
    <div className="access-shell">
      <section className="access-console">
        <button className="access-cancel" onClick={() => setView('landing')}>Cancel</button>
        {(view === 'register' || view === 'role-login') && (
          <button className="access-back" onClick={() => setView('roles')}><ArrowLeft size={16} /> Back</button>
        )}
        <div className="access-console-head">
          <Brand />
          <div className="access-kicker"><span /> Secure workspace boot</div>
          <div className="access-console-title">
            <div>
              <h1>{view === 'roles' ? 'Join Architex' : view === 'register' ? 'Create your account' : 'Welcome Back'}</h1>
              <p>{view === 'roles' ? 'Select a role profile to mount the correct command centre, evidence stream, and project controls.' : 'Authenticate into the selected Architex OS workspace.'}</p>
            </div>
            <div className="access-system-pills"><span>Role kernel</span><span>Audit layer</span><span>AI co-pilot</span></div>
          </div>
        </div>

        {view === 'roles' ? (
          <div className="access-role-body">
            <div className="access-role-grid">
              {roles.map(({ name, description, icon: Icon }) => {
                const selected = selectedRole === name;
                return (
                  <button className={`access-role-card ${selected ? 'selected' : ''}`} key={name} onClick={() => setSelectedRole(name)}>
                    <span className="access-role-icon"><Icon size={27} /></span>
                    <strong>{name}</strong><span>{description}</span>
                    <small>{selected ? 'Selected' : 'Select role'} <ArrowRight size={15} /></small>
                  </button>
                );
              })}
            </div>
            <div className="access-role-actions">
              <button disabled={!selectedRole}>Sign in with Google</button>
              <div><button disabled={!selectedRole} onClick={() => setView('role-login')}>Login with Email</button><button disabled={!selectedRole} onClick={() => setView('register')}>Sign Up with Email</button></div>
            </div>
          </div>
        ) : (
          <AccessForm register={view === 'register'} role={selectedRole} onSubmit={view === 'register' ? createAccount : enterWorkspace} onBack={() => setView('roles')} message={notice ?? error} />
        )}
      </section>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className={`access-brand ${compact ? 'compact' : ''}`}><img src="/logo.png" alt="Architex" /><div><strong>{compact ? 'ARCHITEX' : 'Architex OS'}</strong>{!compact && <span>Built environment access</span>}</div></div>;
}

function AccessForm({ register, role, onSubmit, onBack, message }: { register: boolean; role: string | null; onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>; onBack: () => void; message: string | null }) {
  return (
    <form className="access-form" onSubmit={onSubmit}>
      <div className="access-form-role"><ShieldCheck size={18} /><span>Role profile</span><strong>{role}</strong></div>
      {register && <label>Full name<input name="name" aria-label="Full name" placeholder="John Doe" required /></label>}
      {register && <label>Organisation name<input name="organization_name" aria-label="Organisation name" placeholder="Your practice or organisation" required /></label>}
      <label>Email address<input name="email" aria-label="Email address" type="email" placeholder="name@example.com" required /></label>
      <label>Password<input name="password" aria-label="Password" type="password" placeholder="••••••••••••" minLength={12} required /></label>
      {message && <p role="alert">{message}</p>}
      <button className="access-form-submit">{register ? 'Create Account' : 'Login'}</button>
      <button type="button" className="access-form-google">Sign in with Google</button>
      <button type="button" className="access-form-back" onClick={onBack}>Back to Options</button>
    </form>
  );
}

function V8SignIn({ onBack, onSubmit, error }: { onBack: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>; error: string | null }) {
  return (
    <div className="v8-signin">
      <button className="v8-signin-back" onClick={onBack}><ArrowLeft size={16} /> Back to landing</button>
      <section className="v8-signin-panel">
        <div className="v8-signin-identity">
          <Brand />
          <div className="v8-access-badge"><LockKeyhole size={14} /> V8 secure access</div>
          <h1>Welcome back</h1>
          <p>Resume your governed workspace with project context, evidence controls, and role permissions intact.</p>
          <div className="v8-status-stack"><span><i /> Identity boundary active</span><span><i /> Audit trail ready</span><span><i /> Workspace encrypted</span></div>
        </div>
        <form className="v8-signin-form" onSubmit={onSubmit}>
          <div><span className="v8-step">01 / Authenticate</span><h2>Enter Architex OS</h2><p>Use your organisation credentials to mount the V8 shell.</p></div>
          <label>Email address<input name="email" aria-label="Email address" type="email" placeholder="name@example.com" required /></label>
          <label>Password<input name="password" aria-label="Password" type="password" placeholder="••••••••" required /></label>
          <div className="v8-form-meta"><label><input type="checkbox" /> Keep this device trusted</label><button type="button">Recover access</button></div>
          <button className="v8-enter-button">Enter workspace <ArrowRight size={17} /></button>
          {error && <p role="alert">{error}</p>}
          <p className="v8-auth-note"><ShieldCheck size={15} /> Protected by role-based access and immutable session logging.</p>
        </form>
      </section>
    </div>
  );
}
