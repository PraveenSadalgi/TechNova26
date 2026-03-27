import gsap from 'gsap';
import { supabase } from './db.js';

// ─── Entrance animations ───────────────────────────────────────────────────
gsap.from('.auth-form-container', { x: 50, opacity: 0, duration: 1, ease: 'power3.out' });
gsap.from('.image-content',       { x: -50, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.3 });

// ─── DOM refs ──────────────────────────────────────────────────────────────
const formTitle    = document.getElementById('form-title');
const formSubtitle = document.getElementById('form-subtitle');
const authForm     = document.getElementById('auth-form');
const nameGroup    = document.getElementById('name-group');
const toggleText   = document.getElementById('toggle-auth');
const authBtnText  = document.getElementById('auth-btn-text');

// Password elements
const pwInput       = document.getElementById('password');
const pwWrap        = document.getElementById('password-wrap');
const pwStrengthWrap = document.getElementById('pw-strength-wrap');
const pwFill        = document.getElementById('pw-strength-fill');
const pwLabel       = document.getElementById('pw-strength-label');
const pwChecklist   = document.getElementById('pw-checklist');
const pwSuggestion  = document.getElementById('pw-suggestion');

const isSignUp = window.location.search.includes('signup=true');
let currentMode = isSignUp ? 'signup' : 'signin';

// ─── Password visibility toggle ────────────────────────────────────────────
window.togglePasswordVisibility = function () {
  const isHidden = pwInput.type === 'password';
  pwInput.type = isHidden ? 'text' : 'password';
  document.getElementById('pw-eye-open').style.display   = isHidden ? 'none' : '';
  document.getElementById('pw-eye-closed').style.display = isHidden ? '' : 'none';
  pwInput.focus();
};

// ─── Password strength engine ──────────────────────────────────────────────
const RULES = {
  len:   { re: /.{8,}/,           id: 'chk-len',   tip: 'Use at least 8 characters' },
  upper: { re: /[A-Z]/,           id: 'chk-upper',  tip: 'Add an uppercase letter (A–Z)' },
  num:   { re: /[0-9]/,           id: 'chk-num',    tip: 'Include at least one number (0–9)' },
  sym:   { re: /[^A-Za-z0-9]/,   id: 'chk-sym',    tip: 'Add a special character e.g. !@#$%^&*' },
};

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const SUGGESTIONS = [
  'Try mixing letters, numbers and symbols.',
  'Avoid common words like "password" or "123456".',
  'Use a passphrase — e.g. "Coffee!River42Sun".',
  'The longer the better — aim for 12+ characters.',
];

window.validatePassword = function (val) {
  if (currentMode !== 'signup') return; // Only validate on sign up

  // Check each rule
  let score = 0;
  const failingTips = [];
  for (const [key, rule] of Object.entries(RULES)) {
    const pass = rule.re.test(val);
    const el   = document.getElementById(rule.id);
    el.classList.toggle('pass', pass);
    if (pass) score++;
    else failingTips.push(rule.tip);
  }

  // Update strength bar
  pwFill.setAttribute('data-level', score);
  pwLabel.setAttribute('data-level', score);
  pwLabel.textContent = val.length ? STRENGTH_LABELS[score] : '';

  // Suggestion strip
  if (val.length === 0) {
    pwSuggestion.classList.add('hidden');
    pwWrap.classList.remove('valid', 'error');
    return;
  }

  if (score < 4) {
    // Pick an actionable tip
    const tip = failingTips[0] || SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)];
    pwSuggestion.textContent = '💡 ' + tip;
    pwSuggestion.classList.remove('hidden');
    pwWrap.classList.remove('valid');
    pwWrap.classList.toggle('error', score <= 1 && val.length >= 4);
  } else {
    pwSuggestion.textContent = '✅ Great password! You\'re all set.';
    pwSuggestion.classList.remove('hidden');
    pwWrap.classList.add('valid');
    pwWrap.classList.remove('error');
  }
};

// ─── Email validation ──────────────────────────────────────────────────────
window.validateEmail = function (input) {
  const wrap    = document.getElementById('email-wrap');
  const status  = document.getElementById('email-status');
  const hint    = document.getElementById('email-hint');
  const val     = input.value.trim();
  const valid   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  if (!val) {
    wrap.classList.remove('valid', 'error');
    status.textContent = '';
    hint.textContent   = '';
    return;
  }
  if (valid) {
    wrap.classList.add('valid');
    wrap.classList.remove('error');
    status.textContent = '✓';
    hint.textContent   = '';
  } else {
    wrap.classList.add('error');
    wrap.classList.remove('valid');
    status.textContent = '✕';
    hint.textContent   = 'Enter a valid email address.';
  }
};

// ─── UI switch between Sign In / Sign Up ──────────────────────────────────
function updateUI() {
  const isUp = currentMode === 'signup';

  // Update placeholder to match mode
  pwInput.placeholder = isUp ? 'Create a strong password' : '••••••••';
  pwInput.autocomplete = isUp ? 'new-password' : 'current-password';

  if (isUp) {
    formTitle.innerText    = 'Create Account';
    formSubtitle.innerText = 'Join PlanIt and start building journeys.';
    nameGroup.classList.remove('hidden');
    document.getElementById('fullname').required = true;
    toggleText.innerHTML = `Already have an account? <a href="#" id="switch-mode">Sign in</a>`;
    authBtnText.innerText = 'SIGN UP';
    // Show strength UI
    pwStrengthWrap.classList.remove('hidden');
    pwChecklist.classList.remove('hidden');
  } else {
    formTitle.innerText    = 'Welcome Back';
    formSubtitle.innerText = 'Sign in to continue your journey.';
    nameGroup.classList.add('hidden');
    document.getElementById('fullname').required = false;
    toggleText.innerHTML = `Don't have an account? <a href="#" id="switch-mode">Sign up</a>`;
    authBtnText.innerText = 'SIGN IN';
    // Hide strength UI
    pwStrengthWrap.classList.add('hidden');
    pwChecklist.classList.add('hidden');
    pwSuggestion.classList.add('hidden');
    pwWrap.classList.remove('valid', 'error');
    // Reset fill
    pwFill.setAttribute('data-level', 0);
    pwLabel.textContent = '';
  }

  // Animate transition
  gsap.from('#auth-form > .form-group', {
    y: 10, opacity: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out'
  });
}

updateUI();

// ─── Mode switch listener ──────────────────────────────────────────────────
document.getElementById('toggle-auth').addEventListener('click', (e) => {
  if (e.target.id === 'switch-mode') {
    e.preventDefault();
    currentMode = currentMode === 'signup' ? 'signin' : 'signup';
    // Reset inputs
    authForm.reset();
    document.getElementById('email-wrap').classList.remove('valid', 'error');
    document.getElementById('email-status').textContent = '';
    document.getElementById('email-hint').textContent = '';
    pwWrap.classList.remove('valid', 'error');
    pwFill.setAttribute('data-level', 0);
    pwLabel.textContent = '';
    pwSuggestion.classList.add('hidden');
    document.querySelectorAll('.chk-item').forEach(el => el.classList.remove('pass'));
    updateUI();
  }
});

// ─── Form submission ───────────────────────────────────────────────────────
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email    = document.getElementById('email').value.trim();
  const password = pwInput.value;
  const fullname = document.getElementById('fullname').value.trim();

  // Block weak password on signup
  if (currentMode === 'signup') {
    let score = 0;
    for (const rule of Object.values(RULES)) {
      if (rule.re.test(password)) score++;
    }
    if (score < 3) {
      pwWrap.classList.add('error');
      pwSuggestion.textContent = '⚠ Your password is too weak. Please follow the requirements above.';
      pwSuggestion.classList.remove('hidden');
      pwInput.focus();
      return;
    }
  }

  const btn = document.getElementById('auth-btn');
  btn.style.opacity = '0.7';
  btn.style.pointerEvents = 'none';
  authBtnText.innerText = 'PROCESSING...';

  try {
    if (currentMode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullname } }
      });
      if (error) throw error;

      // Upsert profile so trips FK is satisfiable immediately
      if (data.user) {
        const { error: profileErr } = await supabase
          .from('profiles')
          .upsert([{ id: data.user.id, full_name: fullname }], { onConflict: 'id' });
        if (profileErr) console.error('[PlanIt] Profile creation error:', profileErr.message);
      }

      alert('Sign up successful! Check your inbox for a confirmation email.');
      currentMode = 'signin';
      authForm.reset();
      updateUI();
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.href = '/profile.html';
    }
  } catch (err) {
    alert('Authentication failed: ' + err.message);
  } finally {
    authBtnText.innerText = currentMode === 'signup' ? 'SIGN UP' : 'SIGN IN';
    btn.style.opacity = '1';
    btn.style.pointerEvents = '';
  }
});
