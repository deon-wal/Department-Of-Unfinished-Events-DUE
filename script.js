/**
 * DUE WORKSTATION V5.0
 * Core Archive Logic & Cinematic Environment
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- STATE & AUDIO ---
    let archiveData = [];
    let audioCtx = null;
    let mainHum = null;
    
    const stabilityDisplay = document.getElementById('stability-display');
    const eventDisplay = document.getElementById('event-display');
    const mistCanvas = document.getElementById('memory-mist-canvas');
    const ctx = mistCanvas.getContext('2d');

    const lore = {
        types: ["Wedding", "Graduation", "Funeral", "Political Speech", "Concert", "Birthday Party", "School Assembly", "Court Hearing", "Secret Meeting"],
        locations: ["Municipal Hall", "Suburban Church", "Red Ink Vault", "The Stacks", "Zone 06", "Abandoned Cinema", "Pangea-Ex Transit"],
        failures: ["opening speech", "exchange of rings", "moment of applause", "closing remarks", "initial handshake", "the toast"],
        anomalies: [
            { text: "applause begins 12 seconds before speech", crit: false },
            { text: "chairs multiply indefinitely upon sitting", crit: false },
            { text: "guests arrive before invitations exist", crit: true },
            { text: "Agent Aiden spotted in back row (Recursive)", crit: true },
            { text: "walls bleed Vellum Gold / Blood-Ink", crit: true },
            { text: "Time repeats every 14 seconds", crit: true },
            { text: "Gravity desynchronizes with 12Hz perception mode", crit: true }
        ],
        statuses: ["Narrative Collapse", "Temporal Recursion", "Memory Contamination", "Suture Breach", "Signal Arrested"]
    };

    // --- AUDIO ENGINE ---
    function initAudio() {
        if (audioCtx) return;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        mainHum = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        mainHum.type = 'sine';
        mainHum.frequency.setValueAtTime(50, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime);
        mainHum.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        mainHum.start();
    }

    function playStaticBurst() {
        if (!audioCtx) return;
        const bufferSize = audioCtx.sampleRate * 0.08;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        noise.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);
        noise.start();
    }

    // --- MEMORY MIST ---
    let particles = [];
    function resize() {
        if(mistCanvas) {
            mistCanvas.width = window.innerWidth;
            mistCanvas.height = window.innerHeight;
        }
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * (mistCanvas ? mistCanvas.width : window.innerWidth);
            this.y = Math.random() * (mistCanvas ? mistCanvas.height : window.innerHeight);
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.size = Math.random() * 2 + 1;
            this.alpha = Math.random() * 0.4 + 0.1;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if(mistCanvas) {
                if(this.x < 0 || this.x > mistCanvas.width) this.vx *= -1;
                if(this.y < 0 || this.y > mistCanvas.height) this.vy *= -1;
            }
        }
        draw() {
            if(ctx) {
                ctx.fillStyle = `rgba(242, 230, 208, ${this.alpha})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    for(let i=0; i<80; i++) particles.push(new Particle());

    function animateMist() {
        if(ctx && mistCanvas) {
            ctx.clearRect(0, 0, mistCanvas.width, mistCanvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animateMist);
        }
    }
    animateMist();

    // --- ARCHIVE LOGIC ---
    const generateEvent = () => {
        const anomalyObj = lore.anomalies[Math.floor(Math.random() * lore.anomalies.length)];
        return {
            id: `EVT-${Math.floor(1000 + Math.random() * 8999)}-${String.fromCharCode(65 + Math.random() * 26)}`,
            type: lore.types[Math.floor(Math.random() * lore.types.length)],
            location: lore.locations[Math.floor(Math.random() * lore.locations.length)],
            failure: lore.failures[Math.floor(Math.random() * lore.failures.length)],
            anomaly: anomalyObj.text,
            isCritical: anomalyObj.crit || Math.random() > 0.9,
            status: lore.statuses[Math.floor(Math.random() * lore.statuses.length)],
            timestamp: new Date().toLocaleTimeString()
        };
    };

    const renderArchive = () => {
        if(!eventDisplay) return;
        const search = document.getElementById('archive-search').value.toLowerCase();
        const filter = document.getElementById('archive-filter').value;
        
        let filtered = archiveData.filter(e => {
            const matchesSearch = e.id.toLowerCase().includes(search) || e.type.toLowerCase().includes(search);
            const matchesFilter = filter === 'all' || (filter === 'CRITICAL' && e.isCritical);
            return matchesSearch && matchesFilter;
        });
        
        eventDisplay.innerHTML = filtered.map(e => `
            <div class="archive-entry ${e.isCritical ? 'critical' : ''}" onclick="viewDocument('${e.id}')">
                <div class="flex justify-between items-start text-[8px] opacity-40 uppercase mb-1 font-bold">
                    <span>ID: ${e.id}</span>
                    <span>RECOVERED: ${e.timestamp}</span>
                </div>
                <div class="text-[12px] font-black ${e.isCritical ? 'text-red-500' : 'text-gray-300'} uppercase tracking-wider">
                    ${e.type} // ${e.location}
                </div>
                <div class="text-[10px] mt-1 opacity-60">Anomaly detected during ${e.failure}. State: ${e.status}</div>
            </div>
        `).join('') || '<div class="p-16 text-center text-[10px] opacity-30 uppercase font-bold tracking-[0.5rem]">Void_Empty</div>';
    };

    window.viewDocument = (id) => {
        const evt = archiveData.find(e => e.id === id);
        if(!evt) return;
        
        playStaticBurst();
        document.getElementById('modal-content').innerHTML = `
            <h1 class="text-4xl font-black uppercase mb-2 tracking-tighter">RECOVERY LOG: ${evt.id}</h1>
            <p class="text-[10px] mb-10 font-black opacity-60 uppercase border-b border-black/10 pb-4">DUE Station 04 // Level_04_Clearance_Required</p>
            
            <div class="grid grid-cols-2 gap-8 mb-10 text-xs font-black uppercase">
                <div class="flex flex-col"><span class="opacity-40 mb-1">Event Type</span> ${evt.type}</div>
                <div class="flex flex-col"><span class="opacity-40 mb-1">Status</span> ${evt.status}</div>
                <div class="flex flex-col"><span class="opacity-40 mb-1">Location</span> ${evt.location}</div>
                <div class="flex flex-col"><span class="opacity-40 mb-1">Failure Point</span> ${evt.failure}</div>
            </div>

            <div class="font-serif italic text-lg leading-relaxed text-black/80 space-y-6">
                <p>Observers noted that the <strong>${evt.type}</strong> failed to compile properly. Reality integrity collapsed at the <strong>${evt.failure}</strong>.</p>
                <p class="bg-black/5 p-6 border-l-4 border-black not-italic font-sans text-sm">
                    "${evt.anomaly}"
                </p>
                <p>Agent Aiden sightings recorded within the recursion loop. It is recommended that all present narrative fragments be treated with <strong>Closure Pills</strong> and archived under the 1979 Halloween protocols.</p>
            </div>
        `;
        document.getElementById('document-modal').classList.remove('hidden');
        triggerFlash();
    };

    // --- EVENTS (Only attach if elements exist on current page) ---
    if(document.getElementById('generate-event')) {
        document.getElementById('generate-event').addEventListener('click', () => {
            archiveData.unshift(generateEvent());
            renderArchive();
            triggerFlash();
            playStaticBurst();
        });

        document.getElementById('generate-batch').addEventListener('click', () => {
            for(let i=0; i<10; i++) archiveData.unshift(generateEvent());
            renderArchive();
            triggerFlash();
            playStaticBurst();
        });

        document.getElementById('clear-archive').addEventListener('click', () => {
            archiveData = [];
            renderArchive();
            playStaticBurst();
        });

        document.getElementById('archive-search').addEventListener('input', renderArchive);
        document.getElementById('archive-filter').addEventListener('change', renderArchive);
    }

    if(document.getElementById('close-modal')) {
        document.getElementById('close-modal').addEventListener('click', () => {
            document.getElementById('document-modal').classList.add('hidden');
        });
    }

    // --- PAGE SPECIFIC INIT LOGIC ---
    // Start audio on first click anywhere
    document.body.addEventListener('click', initAudio, { once: true });

    // Stacks logic
    function spawnFragments() {
        const layer = document.getElementById('fragment-layer');
        if(!layer) return;
        layer.innerHTML = '';
        for(let i=0; i<45; i++) {
            const f = document.createElement('div');
            f.className = 'fragment';
            f.style.width = (Math.random()*25 + 5) + 'px';
            f.style.height = (Math.random()*35 + 10) + 'px';
            f.style.left = Math.random() * 100 + '%';
            f.style.top = Math.random() * 100 + '%';
            f.style.transform = `rotate(${Math.random()*360}deg)`;
            f.style.opacity = Math.random() * 0.4 + 0.1;
            layer.appendChild(f);
        }
    }
    if(window.location.pathname.includes('stacks')) spawnFragments();

    // Breach logic
    function startBreachSim() {
        const stats = document.getElementById('breach-stats');
        if(!stats) return;
        let count = 0;
        const interval = setInterval(() => {
            stats.innerHTML = `
                BREACH_UID: 0x${Math.random().toString(16).slice(2,10).toUpperCase()}<br>
                INK_OVERFLOW: ${count++}%<br>
                SIGNAL_DRIFT: ${(Math.random() * 10).toFixed(4)}Hz<br>
                DIRECTIVE: SUTURE_IMMEDIATE
            `;
            if(count > 100) count = 0;
            if(Math.random() > 0.9) triggerFlash(0.02);
        }, 100);
    }
    if(window.location.pathname.includes('breach')) startBreachSim();

    // --- SYSTEM UPDATES ---
    setInterval(() => {
        const val = (91 + Math.random() * 8.99).toFixed(2);
        if(stabilityDisplay) stabilityDisplay.innerText = `SIGNAL_STABILITY: ${val}%`;
        const distNixie = document.getElementById('dist-nixie');
        if(distNixie) distNixie.innerText = `${val}%`;
        
        if(val < 93) {
            document.body.style.filter = `contrast(${1 + Math.random()*0.1}) brightness(${1 + Math.random()*0.1})`;
            setTimeout(() => document.body.style.filter = '', 50);
        }
    }, 1200);

    function triggerFlash(amt = 0.08) {
        const f = document.getElementById('erasure-flash');
        if(f) {
            f.style.opacity = amt;
            setTimeout(() => f.style.opacity = '0', 80);
        }
    }

    // Parallax Interaction
    window.addEventListener('mousemove', (e) => {
        const hero = document.getElementById('hero-parallax');
        const skyline = document.getElementById('bg-skyline');
        const x = (e.clientX - window.innerWidth / 2) / 50;
        const y = (e.clientY - window.innerHeight / 2) / 50;
        if(hero) hero.style.transform = `translate(${x}px, ${y}px)`;
        if(skyline) skyline.style.transform = `translate(${x * -0.6}px, ${y * -0.6}px)`;
    });

    const clearanceToggle = document.getElementById('clearance-toggle');
    if(clearanceToggle) {
        clearanceToggle.addEventListener('change', (e) => {
            document.body.classList.toggle('clearance-active', e.target.checked);
            playStaticBurst();
            triggerFlash();
        });
    }

    // Init Data if on Archive page
    if(eventDisplay) {
        archiveData = [generateEvent(), generateEvent(), generateEvent()];
        renderArchive();
    }
});
