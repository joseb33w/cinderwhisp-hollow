import './styles.css';
import { supabase } from './lib/supabase';
import { createAuthGate } from './components/AuthGate';
import { createHome, type HomeHandle } from './pages/Home';

const root = document.getElementById('app')!;
const shell = document.createElement('main');
shell.className = 'min-h-dvh w-full flex items-center justify-center px-4 py-8 sm:py-12 safe-area';
root.appendChild(shell);

let currentHome: HomeHandle | null = null;
let currentGate: HTMLElement | null = null;

function mountGate() {
  if (currentHome) { currentHome.destroy(); currentHome = null; }
  if (currentGate) return;
  const gate = createAuthGate();
  currentGate = gate.el;
  shell.appendChild(gate.el);
}

function mountHome(userId: string, email: string | null) {
  if (currentGate) { currentGate.remove(); currentGate = null; }
  if (currentHome) return;
  const home = createHome({ id: userId, email });
  currentHome = home;
  shell.appendChild(home.el);
}

async function bootstrap() {
  const { data, error } = await supabase.auth.getSession();
  if (error) console.error(error);
  const session = data.session;
  if (session?.user) mountHome(session.user.id, session.user.email ?? null);
  else mountGate();
  supabase.auth.onAuthStateChange((_event, sess) => {
    if (sess?.user) mountHome(sess.user.id, sess.user.email ?? null);
    else mountGate();
  });
}

void bootstrap();
