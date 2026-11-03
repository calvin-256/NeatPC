// ===========================================
// NeatPC — Login Page
// ===========================================
// Target of NextAuth's `pages.signIn` / `pages.error`. Lists whichever
// providers are configured; dev login only exists in development.

'use client';

import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProviders, signIn, type ClientSafeProvider } from 'next-auth/react';
import { Button, Input } from '@/components/ui';
import styles from './login.module.css';

const isDev = process.env.NODE_ENV === 'development';

function LoginForm() {
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') || '/';
  const error = params.get('error');
  const [providers, setProviders] = useState<ClientSafeProvider[] | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    getProviders().then((p) => setProviders(Object.values(p ?? {})));
  }, []);

  const oauth = (providers ?? []).filter((p) => p.type === 'oauth');
  const hasDev = isDev && (providers ?? []).some((p) => p.id === 'dev-login');

  function devLogin(e: FormEvent) {
    e.preventDefault();
    signIn('dev-login', { email, name, callbackUrl });
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Sign in to NeatPC</h1>
      {error && (
        <p className={styles.error} role="alert">
          Sign in failed. Please try again.
        </p>
      )}

      {oauth.map((p) => (
        <Button key={p.id} variant="outline" fullWidth onClick={() => signIn(p.id, { callbackUrl })}>
          Continue with {p.name}
        </Button>
      ))}

      {hasDev && (
        <form onSubmit={devLogin} className={styles.form}>
          <Input label="Email" type="email" placeholder="dev@neatpc.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Name" placeholder="Dev User" value={name} onChange={(e) => setName(e.target.value)} />
          <Button type="submit" fullWidth>Dev Login</Button>
        </form>
      )}

      {providers && oauth.length === 0 && !hasDev && (
        <p className={styles.hint}>No sign-in methods are configured. Set Google or GitHub OAuth keys in your environment.</p>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
