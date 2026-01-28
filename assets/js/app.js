// assets/js/app.js - KOMPLETNÍ VERZE S DIAGNOSTIKOU
const fb = window.fbAuth;
const sb = window.sbClient;

console.log("Kontrola inicializace:", { fb: !!fb, sb: !!sb });

if (!fb || !sb) {
  console.error("Chyba: Firebase nebo Supabase nejsou správně nastaveny v app.html");
} else {
  window.showView = (viewName) => {
    document.querySelectorAll('div[id$="-view"]').forEach(div => div.classList.add('hidden'));
    const target = document.getElementById(`${viewName}-view`);
    if (target) target.classList.remove('hidden');
  };

  // --- MONITORING ---
  fb.onAuthStateChanged(fb.auth, async (user) => {
    if (user) {
      console.log("Uživatel přihlášen ve Firebase:", user.email);
      try {
        // Kontrola Supabase
        const { data: profile, error } = await sb
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.uid)
          .single();

        if (!profile) {
          console.log("Profil v DB nenalezen, vytvářím nový...");
          const { error: insErr } = await sb.from('user_profiles').insert([{
            user_id: user.uid,
            age: 45,
            gender: 'male',
            primary_goal: 'longevity'
          }]);
          if (insErr) console.error("Chyba zápisu do Supabase:", insErr);
        }

        console.log("Vše OK, přesměrovávám...");
        window.location.href = "http://127.0.0.1:5500/app/";
      } catch (e) {
        console.error("Neočekávaná chyba v auth loopu:", e);
      }
    } else {
      window.showView('login');
    }
  });

  // --- LOGIN FORM ---
  document.getElementById("login-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email-address").value;
    const pass = document.getElementById("password").value;
    console.log("Pokus o login:", email);
    fb.signInWithEmailAndPassword(fb.auth, email, pass).catch(err => {
      console.error("Login Error:", err.code);
      document.getElementById("error-message").innerText = "Chyba: " + err.message;
    });
  });

  // --- REGISTER FORM ---
  document.getElementById("register-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("register-email").value;
    const pass = document.getElementById("register-password").value;
    const pass2 = document.getElementById("password-confirm").value;

    if (pass !== pass2) {
      document.getElementById("register-error-message").innerText = "Hesla nesouhlasí.";
      return;
    }

    console.log("Pokus o registraci ve Firebase:", email);
    fb.createUserWithEmailAndPassword(fb.auth, email, pass).catch(err => {
      console.error("Register Error:", err.code);
      document.getElementById("register-error-message").innerText = "Chyba: " + err.message;
    });
  });

  // --- GOOGLE ---
  const startGoogle = () => {
    console.log("Spouštím Google Popup...");
    fb.signInWithPopup(fb.auth, fb.googleProvider).catch(err => console.error("Google Error:", err));
  };
  document.getElementById("google-login-btn")?.addEventListener("click", startGoogle);
  document.getElementById("google-register-btn")?.addEventListener("click", startGoogle);

  // --- PŘEPÍNAČE ---
  document.getElementById("show-register-link")?.addEventListener("click", (e) => { e.preventDefault(); window.showView('register'); });
  document.getElementById("show-login-link")?.addEventListener("click", (e) => { e.preventDefault(); window.showView('login'); });
}
const profileBtn = document.getElementById('profileBtn');
const profileDropdown = document.getElementById('profileDropdown');

// Po kliku na fotku se menu ukáže/schová
profileBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  profileDropdown.classList.toggle('hidden');
});

// Když klikneš kamkoliv jinam, menu se schová
window.addEventListener('click', () => {
  profileDropdown.classList.add('hidden');
});