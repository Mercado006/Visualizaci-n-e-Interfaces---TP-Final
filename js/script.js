/* HEADER Y FOOTER */
function loadComponent(selector, url) {
    const element = document.getElementById(selector);
    if (!element) return;

    fetch(url)
        .then(response => response.text())
        .then(html => {
            element.innerHTML = html;

            const estaLogueado = localStorage.getItem("logueado") === "true";

            /* Link de "Iniciar sesión" / "Mi perfil" (siempre el mismo texto
               con sesión iniciada, sin importar en qué página estés) */
            const loginLink = document.getElementById("login-link");

            if (loginLink) {

                if (estaLogueado) {
                    loginLink.textContent = "Mi perfil";
                    loginLink.href = "../pages/perfil.html";
                } else {
                    loginLink.textContent = "Iniciar sesión";
                    loginLink.href = "../pages/login.html";
                }
            }

            /* Botón "Sacar turno": sin sesión te manda a loguearte primero */
            const turnoLink = document.getElementById("turno-link");

            if (turnoLink) {
                turnoLink.href = estaLogueado
                    ? "../pages/sacar-turno.html"
                    : "../pages/login.html";
            }
        });
}
function initLayout() {
    loadComponent('header', '../components/header.txt');
    loadComponent('footer', '../components/footer.txt');
}

/* SIDEBAR SCROLL */
function initSidebarScrollSpy() {
    const nav = document.querySelector('.sidebar-nav');
    if (!nav) return;

    const links = document.querySelectorAll('.sidebar-link[href^="#"]');
    const sections = document.querySelectorAll('section[id]');

    console.log("Links:", links.length, "Sections:", sections.length);

    if (!links.length || !sections.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            console.log("Visible:", entry.target.id);

            links.forEach(link => {
                link.classList.toggle(
                    'active',
                    link.getAttribute('href') === `#${entry.target.id}`
                );
            });
        });
    }, {
        threshold: 0.5
    });

    sections.forEach(section => observer.observe(section));
}


/* LOGIN SCRIPT */
function initLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    const toggleBtn = document.getElementById('togglePw');
    const pwInput = document.getElementById('password');
    const eyeOpen = document.getElementById('eye-open');
    const eyeClosed = document.getElementById('eye-closed');
    const emailInput = document.getElementById('email');
    const fieldEmail = document.getElementById('field-email');
    const fieldPw = document.getElementById('field-password');

    /* Mostrar / ocultar contraseña */
    if (!toggleBtn || !pwInput) return;

    toggleBtn.addEventListener('click', () => {
        const visible = pwInput.type === 'text';

        pwInput.type = visible ? 'password' : 'text';
        eyeOpen.style.display = visible ? 'block' : 'none';
        eyeClosed.style.display = visible ? 'none' : 'block';

        toggleBtn.setAttribute(
            'aria-label',
            visible ? 'Mostrar contraseña' : 'Ocultar contraseña'
        );
    });

    /* Validación básica del formulario */
    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let valid = true;

        fieldEmail.classList.remove('has-error');
        fieldPw.classList.remove('has-error');

        if (!isValidEmail(emailInput.value.trim())) {
            fieldEmail.classList.add('has-error');
            valid = false;
        }

        if (pwInput.value.trim() === '') {
            fieldPw.classList.add('has-error');
            valid = false;
        }

        if (valid) {
            // Aquí irá la llamada al backend
            localStorage.setItem("logueado", "true");
            window.location.href = 'perfil.html';
        }
    });

    /* Limpiar error al escribir */
    emailInput.addEventListener('input', () => {
        fieldEmail.classList.remove('has-error');
    });

    pwInput.addEventListener('input', () => {
        fieldPw.classList.remove('has-error');
    });
}

/* SIGN UP */
function initRegistro() {
    const reg = document.querySelector('.form-panel');
    if (!reg) return;

    /* ── estado ──────────────────────────────── */
    let currentStep = 1;
    const TOTAL = 4;

    /* ── helpers de UI ──────────────────────── */
    const $ = id => document.getElementById(id);

    function goTo(n) {
        $('step' + currentStep).classList.remove('active');
        currentStep = n;
        if (n <= TOTAL) {
            $('step' + n).classList.add('active');
            updateProgress(n);
            updateSideSteps(n);
        }
    }

    function updateProgress(n) {
        document.querySelectorAll('.progress-seg').forEach((s, i) => {
            s.classList.toggle('filled', i < n);
        });
    }

    function updateSideSteps(n) {
        document.querySelectorAll('.reg-step-item').forEach(item => {
            const s = parseInt(item.dataset.step);
            const bubble = item.querySelector('.step-bubble');
            item.classList.remove('done', 'current');
            bubble.classList.remove('done', 'current');
            if (s < n) {
                item.classList.add('done');
                bubble.classList.add('done');
                bubble.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
            } else if (s === n) {
                item.classList.add('current');
                bubble.classList.add('current');
                bubble.textContent = s;
            } else {
                bubble.textContent = s;
            }
        });
    }

    function showError(fieldId, show) {
        const f = $(fieldId);
        if (f) f.classList.toggle('has-error', show);
    }

    function clearError(fieldId) { showError(fieldId, false); }

    function esMayorDe18(fecha) {
        const nacimiento = new Date(fecha);
        const hoy = new Date();

        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();

        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }

        return edad >= 18;
    }

    function validateStep1() {
        let ok = true;
        const nombreRe = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;

        if (!nombreRe.test($('nombre').value.trim())) {
            showError('f-nombre', true);
            ok = false;
        }
        if (!nombreRe.test($('apellido').value.trim())) {
            showError('f-apellido', true);
            ok = false;
        }
        if (!/^\d{7,8}$/.test($('dni').value.trim())) {
            showError('f-dni', true); ok = false;
        }
        if (
            !$('nacimiento').value ||
            !esMayorDe18($('nacimiento').value)
        ) {
            showError('f-nacimiento', true);
            ok = false;
        }
        if (!$('sexo').value) {
            showError('f-sexo', true); ok = false;
        }
        return ok;
    }

    function validateStep2() {
        let ok = true;

        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const telefonoRe = /^\d{8,10}$/;

        if (!emailRe.test($('email').value.trim())) {
            showError('f-email', true);
            ok = false;
        }

        if (!telefonoRe.test($('telefono').value.trim())) {
            showError('f-telefono', true);
            ok = false;
        }

        return ok;
    }

    function validateStep3() {
        const tieneOS = document.querySelector('input[name="cobertura"]:checked').value === 'si';
        if (!tieneOS) return true;

        let ok = true;
        const afiliadoRe = /^\d{6,14}$/;

        if (!$('obraSocial').value) {
            showError('f-obraSocial', true);
            ok = false;
        }

        if (!afiliadoRe.test($('afiliado').value.trim())) {
            showError('f-afiliado', true);
            ok = false;
        }
        return ok;
    }

    function validateStep4() {
        let ok = true;
        if ($('password').value.length < 8) { showError('f-password', true); ok = false; }
        if ($('confirm').value !== $('password').value || !$('confirm').value) { showError('f-confirm', true); ok = false; }
        if (!$('terms').checked) { $('termsError').classList.add('visible'); ok = false; }
        return ok;
    }

    $('next1').addEventListener('click', () => { if (validateStep1()) goTo(2); });
    $('next2').addEventListener('click', () => { if (validateStep2()) goTo(3); });
    $('next3').addEventListener('click', () => { if (validateStep3()) goTo(4); });

    $('back2').addEventListener('click', () => goTo(1));
    $('back3').addEventListener('click', () => goTo(2));
    $('back4').addEventListener('click', () => goTo(3));

    $('submitBtn').addEventListener('click', () => {
        if (!validateStep4()) return;

        // El registro exitoso también inicia sesión
        localStorage.setItem("logueado", "true");

        $('step4').classList.remove('active');
        $('progressBar').style.display = 'none';
        $('loginPrompt').style.display = 'none';

        const nombre = $('nombre').value.trim();
        $('welcomeName').textContent = nombre;

        $('successScreen').classList.add('active');
        updateSideSteps(5);
    });

    document.querySelectorAll('input[name="cobertura"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const tieneOS = radio.value === 'si';
            $('radio-si').classList.toggle('selected', tieneOS);
            $('radio-no').classList.toggle('selected', !tieneOS);
            $('coverageExtra').classList.toggle('visible', tieneOS);
        });
    });

    function setupToggle(btnId, inputId, openId, closedId) {
        $(btnId).addEventListener('click', () => {
            const el = $(inputId);
            const visible = el.type === 'text';
            el.type = visible ? 'password' : 'text';
            $(openId).style.display = visible ? 'block' : 'none';
            $(closedId).style.display = visible ? 'none' : 'block';
        });
    }

    setupToggle('togglePw1', 'password', 'eye1-open', 'eye1-closed');
    setupToggle('togglePw2', 'confirm', 'eye2-open', 'eye2-closed');

    $('password').addEventListener('input', function () {
        const v = this.value;
        let score = 0;

        if (v.length >= 8) score++;
        if (/[A-Z]/.test(v) && /[0-9]/.test(v)) score++;
        if (/[^a-zA-Z0-9]/.test(v)) score++;

        const bars = [$('sb1'), $('sb2'), $('sb3')];
        const labels = ['', 'Débil', 'Media', 'Fuerte'];
        const cls = ['', 'weak', 'medium', 'strong'];

        bars.forEach((b, i) => {
            b.className = 'strength-bar';
            if (i < score && v.length > 0) b.classList.add(cls[score]);
        });

        $('strengthLabel').textContent = v.length ? labels[score] : '';
        $('strengthLabel').style.color =
            score === 1 ? '#e07a5f' :
                score === 2 ? '#b08020' :
                    score === 3 ? 'var(--success)' :
                        'var(--muted)';
    });

    [
        ['nombre', 'f-nombre'],
        ['apellido', 'f-apellido'],
        ['dni', 'f-dni'],
        ['nacimiento', 'f-nacimiento'],
        ['email', 'f-email'],
        /*        ['telefono', 'f-telefono'], */
        ['password', 'f-password'],
        ['confirm', 'f-confirm']
    ].forEach(([id, fid]) => {
        const el = $(id);
        if (el) el.addEventListener('input', () => clearError(fid));
    });

    $('sexo').addEventListener('change', () => clearError('f-sexo'));
    $('obraSocial').addEventListener('change', () => clearError('f-obraSocial'));
    $('afiliado').addEventListener('input', () => clearError('f-afiliado'));
    $('terms').addEventListener('change', () => $('termsError')
        .classList.remove('visible'));
    $('telefono').addEventListener('input', e => {
        e.target.value = e.target.value
            .replace(/\D/g, '')
            .slice(0, 10);
        clearError('f-telefono');
    });
    $('afiliado').addEventListener('input', e => {
        e.target.value = e.target.value
            .replace(/\D/g, '')
            .slice(0, 14);
        clearError('f-afiliado');
    });
}

/* HISTORIAL CLÍNICO - FILTRO POR ESPECIALIDAD */
function initHistorialFilter() {
    const wrap = document.getElementById('filterWrap');
    if (!wrap) return;

    const btn = document.getElementById('filterBtn');
    const menu = document.getElementById('filterMenu');
    const label = document.getElementById('filterLabel');
    const emptyNote = document.getElementById('filterEmptyNote');
    const items = document.querySelectorAll('#timelineList .timeline-item');
    const options = menu.querySelectorAll('.filter-option');

    function closeMenu() {
        wrap.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
    }

    function toggleMenu() {
        const isOpen = wrap.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(isOpen));
    }

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    document.addEventListener('click', (e) => {
        if (!wrap.contains(e.target)) closeMenu();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    options.forEach(option => {
        option.addEventListener('click', () => {
            const specialty = option.dataset.specialty;

            let visibleCount = 0;
            items.forEach(item => {
                const match = specialty === 'all' || item.dataset.specialty === specialty;
                item.style.display = match ? '' : 'none';
                if (match) visibleCount++;
            });

            options.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');

            label.textContent = specialty === 'all'
                ? 'Filtrar por especialidad'
                : option.textContent.trim();

            if (emptyNote) emptyNote.classList.toggle('visible', visibleCount === 0);

            closeMenu();
        });
    });
}

/* SEGURIDAD */
function initSecurityForm() {
    const form = document.getElementById('securityPasswordForm');
    if (!form) return;

    const $ = id => document.getElementById(id);

    /* Mostrar / ocultar contraseña */
    function setupToggle(btnId, inputId, openId, closedId) {
        const toggleBtn = $(btnId);
        const input = $(inputId);
        if (!toggleBtn || !input) return;

        toggleBtn.addEventListener('click', () => {
            const visible = input.type === 'text';
            input.type = visible ? 'password' : 'text';
            $(openId).style.display = visible ? 'block' : 'none';
            $(closedId).style.display = visible ? 'none' : 'block';
            toggleBtn.setAttribute(
                'aria-label',
                visible ? 'Mostrar contraseña' : 'Ocultar contraseña'
            );
        });
    }

    setupToggle('toggleNewPw', 'newPassword', 'newPwEyeOpen', 'newPwEyeClosed');
    setupToggle('toggleConfirmPw', 'confirmNewPassword', 'confirmPwEyeOpen', 'confirmPwEyeClosed');

    /* El formulario de cambio de contraseña todavía no está conectado al backend */
    form.addEventListener('submit', (e) => {
        e.preventDefault();
    });

    /* Toggle de verificación en dos pasos */
    const twoFaToggle = $('twoFaToggle');
    const twoFaDetail = $('twoFaDetail');
    if (twoFaToggle) {
        twoFaToggle.addEventListener('click', () => {
            const active = twoFaToggle.getAttribute('aria-checked') === 'true';
            twoFaToggle.setAttribute('aria-checked', String(!active));
            if (twoFaDetail) twoFaDetail.classList.toggle('visible', !active);
        });
    }

    /* El cierre de sesiones todavía no está conectado al backend */
}

/* CERRAR SESIÓN (link del sidebar en perfil.html) */
function initLogout() {
    const logoutLink = document.getElementById('logout');
    if (!logoutLink) return;

    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('logueado');
        window.location.href = 'home.html';
    });
}

/* --------- CANCELACION DE TURNOS --------- */
function initCancelarTurno() {

    const botonesCancelar = document.querySelectorAll(".btnCancelarTurno");
    const modal = document.getElementById("modalCancelar");

    if (!botonesCancelar.length || !modal) return;

    const btnNo = document.getElementById("btnNoCancelar");
    const btnSi = document.getElementById("btnConfirmarCancelar");
    const mensaje = document.getElementById("mensajeCancelado");

    let turnoSeleccionado = null;

    botonesCancelar.forEach(btn => {

        btn.addEventListener("click", function () {

            turnoSeleccionado = this.closest(".appt-row");
            modal.classList.add("open");

        });

    });

    btnNo.addEventListener("click", function () {

        modal.classList.remove("open");

    });

    btnSi.addEventListener("click", function () {

    // Cambia el texto mientras "procesa"
    btnSi.disabled = true;
    btnSi.textContent = "Cancelando...";

    setTimeout(() => {

        modal.classList.remove("open");

        if (turnoSeleccionado) {

            turnoSeleccionado.classList.add("cancelado");

            const badge = turnoSeleccionado.querySelector(".badge");
            badge.textContent = "Turno cancelado";
            badge.className = "badge badge-cancelado";

            turnoSeleccionado.querySelector(".appt-actions").style.display = "none";
        }

        mensaje.classList.add("show");

        // Restaurar el botón por si se vuelve a abrir el modal
        btnSi.disabled = false;
        btnSi.textContent = "Confirmar cancelación";

    }, 600);

});

}

document.addEventListener('DOMContentLoaded', () => {
    initLayout();
    initSidebarScrollSpy();
    initLoginForm();
    initRegistro();
    initHistorialFilter();
    initSecurityForm();
    initCancelarTurno();
    initLogout();
});