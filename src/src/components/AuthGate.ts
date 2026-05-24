import { signInWithPassword, signUpWithPassword } from '../lib/supabase';

export interface AuthGateHandle { el: HTMLElement; }
type Mode = 'signin' | 'signup';

export function createAuthGate(): AuthGateHandle {
  const wrap = document.createElement('div');
  wrap.className = 'w-full max-w-md mx-auto rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 sm:p-8 shadow-2xl';

  let mode: Mode = 'signin';

  wrap.innerHTML = `
    <div class="flex flex-col items-center text-center gap-2 mb-6">
      <div class="text-4xl">🪙</div>
      <h1 data-title class="text-2xl font-bold tracking-tight">Sign in</h1>
      <p data-subtitle class="text-sm text-slate-400">Welcome back — sign in to keep flipping.</p>
    </div>
    <div class="flex bg-white/5 border border-white/10 rounded-lg p-1 mb-5" role="tablist">
      <button data-tab="signin" type="button" role="tab" class="flex-1 text-sm font-medium rounded-md py-2 transition bg-white/10 text-slate-100">Sign in</button>
      <button data-tab="signup" type="button" role="tab" class="flex-1 text-sm font-medium rounded-md py-2 transition text-slate-400 hover:text-slate-200">Sign up</button>
    </div>
    <form data-form class="flex flex-col gap-3" novalidate>
      <label class="flex flex-col gap-1.5">
        <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Email</span>
        <input data-email type="email" required autocomplete="email" inputmode="email" placeholder="you@example.com" class="rounded-lg bg-slate-900/60 border border-white/10 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-transparent transition" />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Password</span>
        <input data-password type="password" required minlength="6" autocomplete="current-password" placeholder="At least 6 characters" class="rounded-lg bg-slate-900/60 border border-white/10 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-transparent transition" />
      </label>
      <button data-submit type="submit" class="mt-1 rounded-lg px-4 py-3 font-semibold text-slate-900 bg-gradient-to-br from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-amber-500/20 disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 disabled:shadow-none">Sign in</button>
      <p data-status class="text-xs text-center min-h-[1rem] text-slate-400"></p>
    </form>
  `;

  const form = wrap.querySelector('[data-form]') as HTMLFormElement;
  const emailInput = wrap.querySelector('[data-email]') as HTMLInputElement;
  const passwordInput = wrap.querySelector('[data-password]') as HTMLInputElement;
  const submitBtn = wrap.querySelector('[data-submit]') as HTMLButtonElement;
  const status = wrap.querySelector('[data-status]') as HTMLElement;
  const title = wrap.querySelector('[data-title]') as HTMLElement;
  const subtitle = wrap.querySelector('[data-subtitle]') as HTMLElement;
  const tabSignIn = wrap.querySelector('[data-tab="signin"]') as HTMLButtonElement;
  const tabSignUp = wrap.querySelector('[data-tab="signup"]') as HTMLButtonElement;

  function setStatus(text: string, tone: 'idle' | 'success' | 'error') {
    status.textContent = text;
    const base = 'text-xs text-center min-h-[1rem] ';
    if (tone === 'success') status.className = base + 'text-emerald-400';
    else if (tone === 'error') status.className = base + 'text-rose-400';
    else status.className = base + 'text-slate-400';
  }

  function setMode(next: Mode) {
    mode = next;
    const activeCls = 'flex-1 text-sm font-medium rounded-md py-2 transition bg-white/10 text-slate-100';
    const inactiveCls = 'flex-1 text-sm font-medium rounded-md py-2 transition text-slate-400 hover:text-slate-200';
    if (mode === 'signin') {
      tabSignIn.className = activeCls; tabSignUp.className = inactiveCls;
      title.textContent = 'Sign in';
      subtitle.textContent = 'Welcome back — sign in to keep flipping.';
      submitBtn.textContent = 'Sign in';
      passwordInput.autocomplete = 'current-password';
      passwordInput.placeholder = 'Your password';
    } else {
      tabSignUp.className = activeCls; tabSignIn.className = inactiveCls;
      title.textContent = 'Create account';
      subtitle.textContent = 'New here? Make an account to start flipping.';
      submitBtn.textContent = 'Create account';
      passwordInput.autocomplete = 'new-password';
      passwordInput.placeholder = 'At least 6 characters';
    }
    setStatus('', 'idle');
  }

  tabSignIn.addEventListener('click', () => setMode('signin'));
  tabSignUp.addEventListener('click', () => setMode('signup'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) { setStatus('Email and password are required.', 'error'); return; }
    if (password.length < 6) { setStatus('Password must be at least 6 characters.', 'error'); return; }
    submitBtn.disabled = true; emailInput.disabled = true; passwordInput.disabled = true;
    tabSignIn.disabled = true; tabSignUp.disabled = true;
    setStatus(mode === 'signin' ? 'Signing in…' : 'Creating account…', 'idle');
    try {
      if (mode === 'signin') {
        await signInWithPassword(email, password);
        setStatus('✓ Signed in', 'success');
      } else {
        const { needsConfirmation } = await signUpWithPassword(email, password);
        if (needsConfirmation) {
          setStatus(`✓ Account created. Check ${email} to confirm.`, 'success');
          submitBtn.textContent = 'Email sent';
        } else {
          setStatus('✓ Account created', 'success');
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setStatus(msg, 'error');
      submitBtn.disabled = false; emailInput.disabled = false; passwordInput.disabled = false;
      tabSignIn.disabled = false; tabSignUp.disabled = false;
    }
  });

  return { el: wrap };
}
