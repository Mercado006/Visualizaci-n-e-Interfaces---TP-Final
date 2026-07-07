function initVideoConsulta() {

    /* ── referencias ──────────────────────────────── */
    const screenWait  = document.getElementById('screenWait');
    const screenCall  = document.getElementById('screenCall');
    const screenEnded = document.getElementById('screenEnded');

    /* ── helpers ──────────────────────────────────── */
    function showScreen(el) {
        [screenWait, screenCall, screenEnded].forEach(s => s.classList.remove('active'));
        el.classList.add('active');
    }

    /* ── SALA DE ESPERA ────────────────────────────── */
    let prevMicOn = true,
        prevCamOn = true;

    document.getElementById('prevMicBtn').addEventListener('click', function () {
        prevMicOn = !prevMicOn;
        this.classList.toggle('off', !prevMicOn);
        this.querySelector('svg').style.opacity = prevMicOn ? '1' : '.5';
    });

    document.getElementById('prevCamBtn').addEventListener('click', function () {
        prevCamOn = !prevCamOn;
        this.classList.toggle('off', !prevCamOn);
        this.querySelector('svg').style.opacity = prevCamOn ? '1' : '.5';
    });

    document.getElementById('btnJoin').addEventListener('click', () => {
        showScreen(screenCall);
        startTimer();

        // sincronizar estados mic/cam del preview
        micOn = prevMicOn;
        camOn = prevCamOn;

        applyMicState();
        applyCamState();
    });

    /* ── TIMER ─────────────────────────────────────── */
    let seconds = 0,
        timerInterval = null;

    function startTimer() {
        timerInterval = setInterval(() => {
            seconds++;
            const m = String(Math.floor(seconds / 60)).padStart(2, '0');
            const s = String(seconds % 60).padStart(2, '0');
            document.getElementById('callTimer').textContent = `${m}:${s}`;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        document.getElementById('finalDuration').textContent = `${m}:${s}`;
    }

    /* ── MIC ────────────────────────────────────────── */
    let micOn = true;

    const micBtn   = document.getElementById('micBtn');
    const micLabel = document.getElementById('micLabel');

    function applyMicState() {
        micBtn.classList.toggle('active', micOn);
        micBtn.classList.toggle('off', !micOn);

        document.getElementById('micOn').style.display  = micOn ? 'block' : 'none';
        document.getElementById('micOff').style.display = micOn ? 'none' : 'block';

        micLabel.textContent = micOn ? 'Micrófono' : 'Silenciado';
    }

    micBtn.addEventListener('click', () => {
        micOn = !micOn;
        applyMicState();
    });

    /* ── CAM ────────────────────────────────────────── */
    let camOn = true;

    const camBtn   = document.getElementById('camBtn');
    const camLabel = document.getElementById('camLabel');
    const selfPip  = document.getElementById('selfPip');

    function applyCamState() {
        camBtn.classList.toggle('active', camOn);
        camBtn.classList.toggle('off', !camOn);

        document.getElementById('camOn').style.display  = camOn ? 'block' : 'none';
        document.getElementById('camOff').style.display = camOn ? 'none' : 'block';

        camLabel.textContent = camOn ? 'Cámara' : 'Sin cámara';
        selfPip.classList.toggle('cam-off', !camOn);
    }

    camBtn.addEventListener('click', () => {
        camOn = !camOn;
        applyCamState();
    });

/* mover el pv del video del usuario */
    function arrastrarVideo() {
        let arrastrando = false;
        let offsetX = 0;
        let offsetY = 0;

        const margen = 12;

        selfPip.addEventListener("pointerdown", (e) => {
            arrastrando = true;

            offsetX = e.clientX - selfPip.offsetLeft;
            offsetY = e.clientY - selfPip.offsetTop;

            selfPip.setPointerCapture(e.pointerId);
        });

        selfPip.addEventListener("pointermove", (e) => {
            if (!arrastrando) return;

            let x = e.clientX - offsetX;
            let y = e.clientY - offsetY;

            // Límites de la ventana
            const minX = margen;
            const minY = margen;

            const maxX = window.innerWidth - selfPip.offsetWidth - margen;
            const maxY = window.innerHeight - selfPip.offsetHeight - margen;

            x = Math.max(minX, Math.min(x, maxX));
            y = Math.max(minY, Math.min(y, maxY));

            selfPip.style.left = `${x}px`;
            selfPip.style.top = `${y}px`;
        });

        selfPip.addEventListener("pointerup", (e) => {
            arrastrando = false;
            selfPip.releasePointerCapture(e.pointerId);
        });
    }

    arrastrarVideo();

    /* ── COMPARTIR PANTALLA ─────────────────────────── */
    let shareOn = false;

    const shareBtn = document.getElementById('shareBtn');

    shareBtn.addEventListener('click', () => {
        shareOn = !shareOn;
        shareBtn.classList.toggle('active', shareOn);
    });

    /* ── CHAT ───────────────────────────────────────── */
    const chatPanel    = document.getElementById('chatPanel');
    const chatToggle   = document.getElementById('chatToggle');
    const chatClose    = document.getElementById('chatClose');
    const chatInput    = document.getElementById('chatInput');
    const chatSend     = document.getElementById('chatSend');
    const chatMessages = document.getElementById('chatMessages');

    function openChat() {
        chatPanel.classList.add('open');
        chatToggle.classList.add('active');
    }

    function closeChat() {
        chatPanel.classList.remove('open');
        chatToggle.classList.remove('active');
    }

    chatToggle.addEventListener('click', () => {
        chatPanel.classList.contains('open') ? closeChat() : openChat();
    });

    chatClose.addEventListener('click', closeChat);

    function sendMessage() {
        const txt = chatInput.value.trim();
        if (!txt) return;

        const msg = document.createElement('div');
        msg.className = 'msg me';
        msg.innerHTML = `
            <div class="msg-sender">Vos</div>
            <div class="msg-bubble">${txt}</div>
        `;

        chatMessages.appendChild(msg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        chatInput.value = '';
    }

    chatSend.addEventListener('click', sendMessage);

    chatInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    /* ── FINALIZAR ──────────────────────────────────── */
    document.getElementById('endCall').addEventListener('click', () => {
        stopTimer();
        showScreen(screenEnded);
    });

}

document.addEventListener('DOMContentLoaded', () => {
    initVideoConsulta();
});