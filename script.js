let allChemicalsData = [];
let chartInstances = {};
let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
let isDarkMode = localStorage.getItem('theme') === 'dark';
let soundEnabled = localStorage.getItem('sound') !== 'disabled';

// Audio context for sound effects
let audioCtx = null;

function playSound(type) {
    if (!soundEnabled) return;
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        if (type === 'click') {
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.1;
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.05);
        } else if (type === 'success') {
            oscillator.frequency.value = 523;
            gainNode.gain.value = 0.15;
            oscillator.start();
            setTimeout(() => oscillator.frequency.value = 659, 100);
            setTimeout(() => oscillator.frequency.value = 784, 200);
            oscillator.stop(audioCtx.currentTime + 0.3);
        } else if (type === 'hover') {
            oscillator.frequency.value = 600;
            gainNode.gain.value = 0.05;
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.03);
        }
    } catch (e) {}
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('sound', soundEnabled ? 'enabled' : 'disabled');
    const btn = document.getElementById('sound-btn');
    if (soundEnabled) {
        btn.innerHTML = '<i class="fas fa-volume-up"></i>';
        btn.classList.remove('muted');
    } else {
        btn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        btn.classList.add('muted');
    }
}

const quotes = {
    "benzene": "Benzene is highly flammable and a known carcinogen.",
    "mercury": "Mercury is liquid at room temperature and toxic to the nervous system.",
    "aspirin": "Aspirin was first synthesized from willow bark extract.",
    "lead": "Lead has been used in paints and gasoline in the past.",
    "arsenic": "Arsenic contamination is a global health concern.",
    "ammonia": "Ammonia is commonly used as fertilizer.",
    "chlorine": "Chlorine gas was used as a weapon in World War I.",
    "cyanide": "Cyanide can prevent cells from using oxygen.",
    "ethanol": "Ethanol is the type of alcohol in drinks.",
    "carbon monoxide": "Carbon monoxide is odorless and highly poisonous.",
    "formaldehyde": "Formaldehyde is used to preserve biological specimens.",
    "sodium hydroxide": "Sodium hydroxide is highly caustic and corrosive.",
    "acetone": "Acetone is commonly found in nail polish remover.",
    "hydrogen peroxide": "Hydrogen peroxide breaks down into water and oxygen.",
    "sodium chloride": "Table salt is essential but toxic in high amounts.",
    "caffeine": "Caffeine is a stimulant found in coffee and energy drinks.",
    "pesticide-chlorpyrifos": "Chlorpyrifos is an insecticide linked to neurological damage.",
    "dichloromethane": "Dichloromethane is used in paint stripping.",
    "toluene": "Toluene is found in paints and adhesives.",
    "sulfuric acid": "Sulfuric acid is highly corrosive and used in batteries.",
    "nicotine": "Nicotine is a highly addictive stimulant in tobacco."
};

const safetyTips = {
    "benzene": ["Use in well-ventilated areas", "Wear protective gloves", "Avoid inhalation", "Known carcinogen - minimize exposure"],
    "mercury": ["Never heat mercury directly", "Wear protective equipment", "Keep away from children", "Proper disposal required"],
    "aspirin": ["Keep out of reach of children", "Do not exceed dosage", "Take with food", "Low environmental impact"],
    "lead": ["Wash hands after handling", "Avoid dust formation", "Lead-free alternatives preferred", "Neurotoxic - handle with care"],
    "arsenic": ["Extremely toxic - avoid contact", "Use proper protective gear", "Monitor water contamination", "Professional handling required"],
    "ammonia": ["Use in ventilated areas", "Wear eye protection", "Never mix with bleach", "Common in fertilizers - moderate hazard"],
    "chlorine": ["Never mix with ammonia", "Use in ventilated areas", "Wear respiratory protection", "Used for sanitation - handle with care"],
    "cyanide": ["Extremely toxic - lethal", "Professional handling only", "Antidote required for exposure", "Never handle alone"],
    "ethanol": ["Highly flammable", "Keep away from open flames", "Not for drinking (industrial grade)", "Low toxicity but precautions needed"],
    "carbon monoxide": ["Never use indoors without ventilation", "Install CO detectors", "Odorless - extra caution needed", "Prevents blood oxygen transport"],
    "formaldehyde": ["Use in fume hood", "Wear protective gloves and goggles", "Avoid skin contact", "Known carcinogen - limit exposure"],
    "sodium hydroxide": ["Wear acid-resistant gloves", "Avoid contact with eyes", "Add to water slowly (not water to base)", "Corrosive to tissues"],
    "acetone": ["Keep away from heat sources", "Use in ventilated area", "Highly flammable", "Avoid prolonged skin contact"],
    "hydrogen peroxide": ["Store in dark container", "Keep away from flammable materials", "Use protective eyewear", "Concentrated form is corrosive"],
    "sodium chloride": ["Generally safe in food amounts", "Avoid excessive intake", "Not for industrial use without testing", "Low toxicity but monitor intake"],
    "caffeine": ["Limit to 400mg daily for adults", "Avoid combining with alcohol", "May cause insomnia", "Keep away from pets"],
    "pesticide-chlorpyrifos": ["Keep away from food preparation areas", "Wear protective clothing", "Wash hands after handling", "Banned in many countries - use alternatives"],
    "dichloromethane": ["Use in well-ventilated area", "Wear respiratory protection", "Avoid skin contact", "Suspected carcinogen - minimize exposure"],
    "toluene": ["Use in well-ventilated areas", "Wear respirator mask", "Avoid prolonged skin contact", "Neurotoxic - handle with care"],
    "sulfuric acid": ["Always add acid to water slowly", "Wear acid-resistant gloves and goggles", "Corrosive to metals", "Can cause severe burns"],
    "nicotine": ["Highly toxic in pure form", "Keep locked away from children", "Wear protective gloves", "Absorbs through skin - avoid contact"]
};

const detailedInfo = {
    "benzene": {
        overview: "Benzene is a colorless and highly flammable liquid with a sweet smell. It is a natural constituent of crude oil and is one of the most commonly used chemicals in the world. However, it is also a known carcinogen.",
        safety: "Benzene exposure can occur through inhalation, skin absorption, and ingestion. Long-term exposure can cause leukemia and other blood disorders. Always use in well-ventilated areas with proper PPE.",
        environmental: "Benzene evaporates quickly and can persist in the atmosphere for days. It contributes to smog formation and can contaminate groundwater through industrial waste."
    },
    "mercury": {
        overview: "Mercury is the only metal that is liquid at room temperature. It is silvery-white and dense. Historically used in thermometers and barometers, its toxicity is now well-documented.",
        safety: "Mercury vapors are extremely dangerous when inhaled. Chronic exposure affects the nervous system, kidneys, and liver. Never heat mercury and always use appropriate safety equipment.",
        environmental: "Mercury persists in ecosystems for decades and bioaccumulates in fish and wildlife. Industrial discharge and improper disposal are major sources of environmental contamination."
    },
    "aspirin": {
        overview: "Aspirin (acetylsalicylic acid) is one of the most widely used medications in the world. It was originally derived from willow bark and is used for pain relief, fever reduction, and anti-inflammation.",
        safety: "Relatively safe when used as directed. Overdose can cause stomach bleeding, ringing in the ears, and in severe cases, respiratory failure. Keep away from children.",
        environmental: "Aspirin has low environmental persistence and toxicity. It breaks down relatively quickly in the environment and poses minimal risk to ecosystems."
    },
    "lead": {
        overview: "Lead is a heavy metal that has been used by humans for thousands of years. Despite its toxicity, it has applications in batteries, paints, and radiation shielding.",
        safety: "Lead is a neurotoxin that affects brain development in children. It accumulates in bones and can be released during pregnancy. Always wash hands after handling and avoid creating dust.",
        environmental: "Lead persists in the environment for centuries. Historical use in gasoline and paints has left widespread contamination. It poses particular risks to children and wildlife."
    },
    "arsenic": {
        overview: "Arsenic is a metalloid that occurs naturally in the environment. It has no odor or taste, making it particularly dangerous as water contamination is invisible.",
        safety: "Arsenic poisoning causes severe gastrointestinal symptoms, cardiovascular collapse, and multi-organ failure. Chronic exposure leads to skin lesions, cancer, and cognitive impairment.",
        environmental: "Arsenic contaminates groundwater in many regions worldwide. Industrial processes and agricultural runoff contribute to environmental arsenic levels."
    },
    "ammonia": {
        overview: "Ammonia is a colorless gas with a pungent odor. It is the most important nitrogen compound in the chemical industry and is widely used in fertilizers.",
        safety: "Highly irritating to eyes, skin, and respiratory tract. Can be fatal if inhaled in high concentrations. Never mix with bleach or other cleaning products.",
        environmental: "Ammonia from agricultural runoff causes eutrophication of water bodies. It is a major contributor to air pollution and acid rain formation."
    },
    "chlorine": {
        overview: "Chlorine is a yellow-green gas with a pungent odor. It is widely used for water purification, disinfection, and as a precursor to many chemical compounds.",
        safety: "Chlorine gas is highly toxic and was used in chemical warfare. Exposure causes severe respiratory damage. Always use in well-ventilated areas with proper respiratory protection.",
        environmental: "Chlorine compounds can persist in the environment and contribute to ozone depletion. Proper handling and disposal are essential to prevent environmental damage."
    },
    "cyanide": {
        overview: "Cyanide is an extremely toxic compound that exists in various forms. It occurs naturally in some foods and is used in industrial processes including gold mining.",
        safety: "Cyanide blocks cellular respiration, preventing cells from using oxygen. Exposure can be rapidly fatal. Requires immediate medical attention and professional handling.",
        environmental: "Cyanide is relatively unstable and breaks down in sunlight, but can persist in water bodies. Industrial discharge must be carefully treated before release."
    },
    "ethanol": {
        overview: "Ethanol (ethyl alcohol) is a volatile, flammable, colorless liquid. It is best known as the type of alcohol found in alcoholic beverages and as a fuel.",
        safety: "Highly flammable and volatile. Industrial grade ethanol should never be consumed. Can cause central nervous system depression in high doses.",
        environmental: "Ethanol biodegrades quickly in the environment and is considered to have low toxicity. However, large releases can deplete oxygen in water bodies."
    },
    "carbon monoxide": {
        overview: "Carbon monoxide is a colorless, odorless, and tasteless gas. It is produced by incomplete combustion of carbon-containing fuels.",
        safety: "CO binds to hemoglobin, preventing oxygen transport in blood. Causes headache, dizziness, and can be fatal at high concentrations. Never use combustion devices indoors without ventilation.",
        environmental: "CO is a major air pollutant from vehicles and industrial processes. It contributes to ground-level ozone formation and poses risks to both human health and the environment."
    },
    "formaldehyde": {
        overview: "Formaldehyde is a colorless gas with a pungent, irritating odor. It is widely used in disinfectants, preserving biological specimens, and as an industrial chemical.",
        safety: "Formaldehyde is a known carcinogen and skin sensitizer. Use only in well-ventilated areas or fume hoods. Wear protective gloves and goggles to avoid skin and eye contact.",
        environmental: "Formaldehyde breaks down relatively quickly in the atmosphere but can contribute to air pollution. Industrial emissions are the primary environmental concern."
    },
    "sodium hydroxide": {
        overview: "Sodium hydroxide (NaOH), also known as caustic soda or lye, is a highly corrosive base. It is used in soap manufacturing, drain cleaners, and as a pH regulator.",
        safety: "Sodium hydroxide causes severe chemical burns to skin and eyes. Always add it slowly to water (never water to base) and wear acid-resistant gloves and goggles.",
        environmental: "Sodium hydroxide is relatively low in environmental persistence. It neutralizes in soil but can cause harm to aquatic life in high concentrations."
    },
    "acetone": {
        overview: "Acetone is a colorless, volatile liquid with a characteristic sweet smell. It is commonly used as a solvent in nail polish remover and paints.",
        safety: "Highly flammable - keep away from heat and open flames. Use in well-ventilated areas. Avoid prolonged skin contact which can cause dryness and irritation.",
        environmental: "Acetone biodegrades quickly in the environment and has low toxicity. However, it can contribute to air pollution through evaporation."
    },
    "hydrogen peroxide": {
        overview: "Hydrogen peroxide (H2O2) is a pale blue liquid that appears colorless in dilute solution. It is used as a disinfectant, bleaching agent, and oxidizer.",
        safety: "Concentrated hydrogen peroxide is corrosive and can cause severe burns. Store in dark containers away from flammable materials. Use protective eyewear.",
        environmental: "Hydrogen peroxide breaks down into water and oxygen, making it relatively environmentally friendly. However, concentrated releases can harm aquatic life."
    },
    "sodium chloride": {
        overview: "Sodium chloride (NaCl), commonly known as table salt, is an essential ionic compound. While vital for life, it can be toxic in excessive amounts.",
        safety: "Generally safe in food amounts. Avoid excessive intake which can lead to hypertension. Industrial grade requires proper handling and testing before use.",
        environmental: "Low toxicity but can accumulate in soil and water through evaporation and agricultural runoff, potentially affecting plant growth and aquatic ecosystems."
    },
    "caffeine": {
        overview: "Caffeine is a natural stimulant found in coffee beans, tea leaves, and energy drinks. It is the world's most widely consumed psychoactive substance.",
        safety: "Limit to 400mg daily for adults. Can cause insomnia, increased heart rate, and anxiety. High doses can be toxic - keep away from children and pets.",
        environmental: "Caffeine has low environmental persistence but trace amounts have been detected in waterways, potentially affecting aquatic organisms."
    },
    "pesticide-chlorpyrifos": {
        overview: "Chlorpyrifos is an organophosphate insecticide used in agriculture. It has been linked to neurological damage and is banned in many countries.",
        safety: "Wear full protective clothing when handling. Avoid contact with food preparation areas. Wash hands thoroughly after handling. Consider alternatives due to health concerns.",
        environmental: "Moderate environmental persistence. Can accumulate in soil and water, harming non-target species including birds and aquatic organisms."
    },
    "dichloromethane": {
        overview: "Dichloromethane (CH2Cl2) is a volatile, colorless liquid used primarily as an industrial solvent in paint stripping and degreasing.",
        safety: "Use in well-ventilated areas with respiratory protection. Avoid prolonged skin contact. Suspected carcinogen - minimize exposure whenever possible.",
        environmental: "Dichloromethane persists moderately in the environment and can leach into groundwater. Industrial discharge is the primary source of environmental contamination."
    },
    "toluene": {
        overview: "Toluene is a clear, colorless liquid with a characteristic benzene-like odor. It is used as a solvent in paints, adhesives, and as an octane booster in fuels.",
        safety: "Use in well-ventilated areas wearing a respirator mask. Avoid prolonged skin contact. Toluene is neurotoxic and can cause headaches, dizziness, and memory impairment.",
        environmental: "Toluene evaporates quickly but can persist in groundwater. Industrial排放 and automotive sources are major contributors to environmental toluene."
    },
    "sulfuric acid": {
        overview: "Sulfuric acid (H2SO4) is a highly corrosive mineral acid used in batteries, fertilizers, and chemical manufacturing. It reacts violently with water.",
        safety: "Always add acid to water slowly, never the reverse. Wear acid-resistant gloves and goggles. Corrosive to metals and can cause severe burns on contact.",
        environmental: "Sulfuric acid neutralizes in soil but can cause significant environmental damage in high concentrations through acid rain formation and waterway acidification."
    },
    "nicotine": {
        overview: "Nicotine is a naturally occurring alkaloid found in tobacco plants. In its pure form, it is extremely toxic, but it is best known as the addictive component of cigarettes.",
        safety: "Highly toxic in pure form - even small amounts can be lethal. Wear protective gloves when handling. Keep locked away from children and pets. Absorbs through skin easily.",
        environmental: "Nicotine has low environmental persistence but can still affect wildlife. Tobacco waste and agricultural runoff contribute to environmental nicotine levels."
    }
};

const quizQuestions = [
    {
        question: "Which chemical has the lowest LD50 value (most toxic)?",
        options: ["Benzene", "Mercury", "Arsenic", "Lead"],
        answer: 1
    },
    {
        question: "What should you NEVER mix with ammonia?",
        options: ["Water", "Bleach", "Salt", "Sugar"],
        answer: 1
    },
    {
        question: "Carbon monoxide is dangerous because it:",
        options: ["Causes skin irritation", "Prevents oxygen transport in blood", "Makes food toxic", "Pollutes water"],
        answer: 1
    },
    {
        question: "Which chemical is commonly used as a fertilizer?",
        options: ["Cyanide", "Benzene", "Ammonia", "Carbon monoxide"],
        answer: 2
    },
    {
        question: "Mercury is unique because it is:",
        options: ["A gas at room temperature", "The only liquid metal at room temperature", "A radioactive element", "Only found in plants"],
        answer: 1
    }
];

// Print/Export PDF functionality
function printResult() {
    const chemical = document.getElementById('chemical-select').value;
    const info = document.getElementById('chemical-info').innerText;
    const quote = document.getElementById('chemical-quote').innerText;
    const tips = document.getElementById('safety-tips').innerText;
    const img = document.getElementById('chemical-image');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Chemical Analysis Report - ${chemical}</title>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Poppins', sans-serif; padding: 40px; color: #1e293b; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; }
                .header h1 { color: #4f46e5; font-size: 2rem; margin-bottom: 10px; }
                .header p { color: #64748b; }
                .content { max-width: 800px; margin: 0 auto; }
                .section { margin: 25px 0; padding: 20px; background: #f8fafc; border-radius: 12px; }
                .section h2 { color: #4f46e5; margin-bottom: 15px; font-size: 1.2rem; }
                .section p { margin: 10px 0; line-height: 1.8; }
                .info-grid { display: flex; gap: 30px; margin: 20px 0; }
                .info-grid img { width: 300px; height: 300px; object-fit: cover; border-radius: 12px; }
                .quote { font-style: italic; color: #4f46e5; background: #eff6ff; padding: 15px; border-left: 4px solid #4f46e5; margin: 20px 0; }
                .tips { background: #ecfdf5; padding: 15px; border-radius: 8px; }
                .tips h3 { color: #10b981; margin-bottom: 10px; }
                .tips ul { margin-left: 20px; }
                .tips li { margin: 8px 0; }
                .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 0.9rem; }
                @media print { body { padding: 20px; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Chemical Toxicity Analyzer</h1>
                <p>Analysis Report for: ${chemical.charAt(0).toUpperCase() + chemical.slice(1)}</p>
                <p>Generated on: ${new Date().toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'})}</p>
            </div>
            <div class="content">
                <div class="section">
                    <h2>Chemical Information</h2>
                    <div class="info-grid">
                        <img src="${img.src}" alt="${chemical}">
                        <div>${info.replace(/\n/g, '<br>')}</div>
                    </div>
                </div>
                ${quote ? `<div class="quote">${quote}</div>` : ''}
                ${tips ? `<div class="tips"><h3>Safety Recommendations</h3>${tips}</div>` : ''}
            </div>
            <div class="footer">
                <p>Chemical Toxicity Analyzer | Interactive Learning Platform</p>
                <p>&copy; 2026 Akansha Singhal. All rights reserved.</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.onload = () => {
        printWindow.print();
    };
}

// Confetti effect
function showConfetti() {
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];

    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 10 + 5,
            h: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.2,
            drift: (Math.random() - 0.5) * 2
        });
    }

    let frame = 0;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
            p.y += p.speed;
            p.x += p.drift;
            p.angle += p.spin;
        });
        frame++;
        if (frame < 120) requestAnimationFrame(animate);
        else canvas.remove();
    }
    animate();
}

// Particle animation for header
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    const particles = [];
    for (let i = 0; i < 30; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 3 + 1,
            dx: (Math.random() - 0.5) * 0.5,
            dy: (Math.random() - 0.5) * 0.5,
            alpha: Math.random() * 0.5 + 0.2
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
            ctx.fill();
            p.x += p.dx;
            p.y += p.dy;
            if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// Load 3D molecule structure from PubChem
function loadMoleculeStructure(chemicalName) {
    const viewer = document.getElementById('molecule-viewer');
    const loading = document.getElementById('molecule-loading');
    const error = document.getElementById('molecule-error');

    if (!viewer) return;

    const cidMap = {
        'benzene': '241',
        'mercury': '24357',
        'aspirin': '2157',
        'lead': '5359237',
        'arsenic': '24410',
        'ammonia': '222',
        'chlorine': '24526',
        'cyanide': '902',
        'ethanol': '702',
        'carbon monoxide': '281'
    };

    const cid = cidMap[chemicalName.toLowerCase()];
    if (!cid) {
        loading.classList.add('hidden');
        error.classList.remove('hidden');
        return;
    }

    loading.classList.remove('hidden');
    error.classList.add('hidden');

    const imgUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG?image_size=400x400`;
    const img = document.createElement('img');
    img.src = imgUrl;
    img.alt = `${chemicalName} molecular structure`;
    img.style.cssText = 'width:100%;max-width:350px;display:block;margin:0 auto;border-radius:12px;';
    img.onload = () => {
        loading.classList.add('hidden');
        viewer.innerHTML = '';
        viewer.appendChild(img);
        const info = document.createElement('p');
        info.style.cssText = 'text-align:center;margin-top:10px;font-size:0.9rem;color:var(--text-muted);';
        info.innerHTML = `<i class="fas fa-atom"></i> ${chemicalName.charAt(0).toUpperCase() + chemicalName.slice(1)} - 3D Structure`;
        viewer.appendChild(info);
    };
    img.onerror = () => {
        loading.classList.add('hidden');
        error.classList.remove('hidden');
    };
}

// Theme initialization
if (isDarkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        document.getElementById('theme-icon').textContent = '☀️';
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        document.getElementById('theme-icon').textContent = '🌙';
    }
}

function toggleChatbot() {
    const chatbot = document.getElementById("chatbot");
    const toggleIcon = document.getElementById("chatbot-toggle");
    chatbot.classList.toggle("collapsed");
    toggleIcon.textContent = chatbot.classList.contains("collapsed") ? "▶" : "▼";
}

function updateRecentSearches(chemical) {
    recentSearches = recentSearches.filter(c => c !== chemical);
    recentSearches.unshift(chemical);
    if (recentSearches.length > 5) recentSearches.pop();
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    renderRecentSearches();
}

function renderRecentSearches() {
    const container = document.getElementById('recent-list');
    if (!container) return;
    container.innerHTML = recentSearches.length
        ? recentSearches.map(chem =>
            `<span class="recent-item" onclick="selectChemical('${chem}')"><i class="fas fa-flask"></i> ${chem.charAt(0).toUpperCase() + chem.slice(1)}</span>`
        ).join('')
        : '<span style="color: var(--text-muted);">No recent analyses - try exploring some chemicals!</span>';
}

function selectChemical(name) {
    document.getElementById('chemical-select').value = name;
    document.getElementById('analysis-form').dispatchEvent(new Event('submit'));
}

function exportResult() {
    const info = document.getElementById('chemical-info').innerText;
    const quote = document.getElementById('chemical-quote').innerText;
    const text = `Chemical Analysis Report\n${'='.repeat(40)}\n\n${info}\n\nKey Insight:\n${quote}`;
    try {
        navigator.clipboard.writeText(text);
        showToast('Results copied to clipboard!');
    } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Results copied to clipboard!');
    }
}

function shareResult() {
    const chemical = document.getElementById('chemical-select').value;
    const text = `Check out my chemical analysis for ${chemical}!`;
    try {
        if (navigator.share) {
            navigator.share({ title: 'Chemical Analysis', text });
        } else {
            navigator.clipboard.writeText(text);
            showToast('Shared text copied!');
        }
    } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Shared text copied!');
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

function showEmergencyModal() {
    const modal = document.getElementById('emergency-modal');
    const content = document.getElementById('emergency-content');
    modal.classList.remove('hidden');
    content.innerHTML = `
        <div class="emergency-warning">
            <h4><i class="fas fa-exclamation-triangle"></i> In Case of Emergency</h4>
            <p>Call your local emergency services immediately. This guide provides first-aid information only.</p>
        </div>
        <div class="emergency-section">
            <h4><i class="fas fa-lungs"></i> If Inhaled</h4>
            <ul>
                <li>Move to fresh air immediately</li>
                <li>Call emergency services if breathing is difficult</li>
                <li>Keep person warm and at rest</li>
                <li>Do NOT give anything by mouth to unconscious person</li>
            </ul>
        </div>
        <div class="emergency-section">
            <h4><i class="fas fa-eye"></i> If in Eyes</h4>
            <ul>
                <li>Rinse eyes with water for at least 15 minutes</li>
                <li>Remove contact lenses if present</li>
                <li>Continue rinsing while transporting to medical facility</li>
            </ul>
        </div>
        <div class="emergency-section">
            <h4><i class="fas fa-hand-paper"></i> If on Skin</h4>
            <ul>
                <li>Remove contaminated clothing immediately</li>
                <li>Wash affected area with soap and water for at least 15 minutes</li>
                <li>Seek medical attention if irritation persists</li>
            </ul>
        </div>
        <div class="emergency-section">
            <h4><i class="fas fa-wine-bottle"></i> If Swallowed</h4>
            <ul>
                <li>Do NOT induce vomiting unless instructed by medical professional</li>
                <li>Call poison control center immediately</li>
                <li>If person is unconscious, do NOT give anything by mouth</li>
            </ul>
        </div>
    `;
}

function closeEmergencyModal() {
    document.getElementById('emergency-modal').classList.add('hidden');
}

function showUnitConverter() {
    const modal = document.getElementById('converter-modal');
    modal.classList.remove('hidden');
    document.getElementById('convert-value').value = '';
    document.getElementById('convert-result').textContent = '0';
}

function closeConverterModal() {
    document.getElementById('converter-modal').classList.add('hidden');
}

function convertUnit() {
    const value = parseFloat(document.getElementById('convert-value').value) || 0;
    const from = document.getElementById('convert-from').value;
    let result = 0;

    // Convert to mg/kg as base unit
    if (from === 'mgkg') {
        result = value;
    } else if (from === 'ppm') {
        result = value; // 1 ppm ≈ 1 mg/kg for dilute solutions
    } else if (from === 'mgl') {
        result = value; // 1 mg/L ≈ 1 mg/kg for water
    } else if (from === 'percent') {
        result = value * 10000; // 1% = 10000 ppm
    }

    document.getElementById('convert-result').textContent = result.toFixed(2) + ' mg/kg';
}

function showGlossary() {
    const modal = document.getElementById('glossary-modal');
    modal.classList.remove('hidden');
}

function closeGlossary() {
    document.getElementById('glossary-modal').classList.add('hidden');
}

function showCaseStudies() {
    const modal = document.getElementById('cases-modal');
    modal.classList.remove('hidden');
}

function closeCasesModal() {
    document.getElementById('cases-modal').classList.add('hidden');
}

function showVideos() {
    const modal = document.getElementById('videos-modal');
    modal.classList.remove('hidden');
}

function closeVideosModal() {
    document.getElementById('videos-modal').classList.add('hidden');
}

function showTab(tabName) {
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    const chemical = document.getElementById('chemical-select').value;
    const info = detailedInfo[chemical];
    if (!info) return;

    const content = document.getElementById('tab-content');
    const labels = { overview: 'Overview', safety: 'Safety Guidelines', environmental: 'Environmental Impact' };
    content.innerHTML = `<h4>${labels[tabName]}</h4><p>${info[tabName]}</p>`;
}

function showQuizModal() {
    const modal = document.getElementById('quiz-modal');
    const content = document.getElementById('quiz-content');
    modal.classList.remove('hidden');

    const randomQ = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
    content.innerHTML = `
        <div class="quiz-question">
            <p><strong>${randomQ.question}</strong></p>
            <div class="quiz-options">
                ${randomQ.options.map((opt, i) => `
                    <button class="quiz-option" onclick="checkQuizAnswer(this, ${i === randomQ.answer})">${opt}</button>
                `).join('')}
            </div>
        </div>
    `;
}

function checkQuizAnswer(btn, correct) {
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(o => o.disabled = true);
    playSound('click');
    if (correct) {
        btn.style.background = '#10b981';
        btn.style.color = 'white';
        showToast('Correct! Well done!');
        showConfetti();
        playSound('success');
    } else {
        btn.style.background = '#ef4444';
        btn.style.color = 'white';
        showToast('Incorrect. Try another question!');
    }
    setTimeout(showQuizModal, 1500);
}

function closeQuizModal() {
    document.getElementById('quiz-modal').classList.add('hidden');
}

function showLearnMode() {
    const modal = document.getElementById('quiz-modal');
    modal.classList.remove('hidden');
    document.getElementById('quiz-content').innerHTML = `
        <div class="learn-mode">
            <h3><i class="fas fa-book-open"></i> Learn Mode</h3>
            <p>Select a chemical from the dropdown to explore detailed information including:</p>
            <ul style="text-align:left;margin:20px 0;">
                <li>Overview & History</li>
                <li>Safety Guidelines</li>
                <li>Environmental Impact</li>
                <li>Interactive Charts</li>
            </ul>
            <p><strong>Tip:</strong> Use the Safety Tips section for practical handling recommendations!</p>
        </div>
    `;
}

function showSafetyGuide() {
    const modal = document.getElementById('quiz-modal');
    modal.classList.remove('hidden');
    document.getElementById('quiz-content').innerHTML = `
        <div class="safety-guide">
            <h3><i class="fas fa-shield-alt"></i> General Safety Guidelines</h3>
            <div style="text-align:left;margin-top:20px;">
                <p><strong>1. Personal Protective Equipment (PPE)</strong></p>
                <ul>
                    <li>Always wear appropriate gloves, goggles, and lab coats</li>
                    <li>Use respiratory protection when working with gases or vapors</li>
                </ul>
                <p><strong>2. Ventilation</strong></p>
                <ul>
                    <li>Work in well-ventilated areas or fume hoods</li>
                    <li>Never inhale chemical vapors directly</li>
                </ul>
                <p><strong>3. Storage & Handling</strong></p>
                <ul>
                    <li>Store chemicals in properly labeled containers</li>
                    <li>Keep incompatible chemicals separated</li>
                    <li>Follow specific storage temperature requirements</li>
                </ul>
                <p><strong>4. Emergency Procedures</strong></p>
                <ul>
                    <li>Know the location of safety equipment (eyewash, shower, fire extinguisher)</li>
                    <li>Have emergency contact numbers readily available</li>
                </ul>
            </div>
        </div>
    `;
}

function getToxicityClass(ld50) {
    if (ld50 < 50) return 'high';
    if (ld50 < 500) return 'moderate';
    return 'low';
}

function getToxicityLabel(ld50) {
    if (ld50 < 50) return 'High Toxicity';
    if (ld50 < 500) return 'Moderate Toxicity';
    return 'Low Toxicity';
}

// Render chemical cards grid
function renderChemicalCards() {
    const grid = document.getElementById('chemical-grid');
    if (!grid || !allChemicalsData.length) return;

    grid.innerHTML = allChemicalsData.map(chem => {
        const toxicityClass = getToxicityClass(chem.ld50_oral || 1000);
        const toxicityLabel = toxicityClass === 'high' ? 'High Risk' : toxicityClass === 'moderate' ? 'Moderate' : 'Safe';
        return `
            <div class="chemical-card" onclick="selectChemical('${chem.name}')">
                <div class="toxicity-indicator ${toxicityClass}">${toxicityLabel}</div>
                <img src="${chem.image || 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400'}" alt="${chem.name}">
                <div class="chemical-card-body">
                    <h3>${chem.name.charAt(0).toUpperCase() + chem.name.slice(1)}</h3>
                    <span class="formula">${chem.formula || 'Unknown'}</span>
                    <p>${chem.description || 'Click to analyze this chemical'}</p>
                </div>
            </div>
        `;
    }).join('');
}

document.addEventListener("DOMContentLoaded", () => {
    const chemicalSelect = document.getElementById("chemical-select");
    const resultsDiv = document.getElementById("results");
    const loadingDiv = document.getElementById("loading");
    const errorDiv = document.getElementById("error");
    const quoteDiv = document.getElementById("chemical-quote");

    renderRecentSearches();
    initParticles();

    fetch("/chemicals")
        .then(res => res.json())
        .then(data => {
            chemicalSelect.innerHTML = `<option value="">Select a chemical...</option>`;
            document.getElementById("chem1").innerHTML = `<option value="">Select Chemical 1</option>`;
            document.getElementById("chem2").innerHTML = `<option value="">Select Chemical 2</option>`;
            data.forEach(chem => {
                const option = document.createElement("option");
                option.value = chem;
                option.textContent = chem.charAt(0).toUpperCase() + chem.slice(1);
                chemicalSelect.appendChild(option);

                const opt1 = document.createElement("option");
                opt1.value = chem;
                opt1.textContent = chem.charAt(0).toUpperCase() + chem.slice(1);
                const opt2 = opt1.cloneNode(true);
                document.getElementById("chem1").appendChild(opt1);
                document.getElementById("chem2").appendChild(opt2);
            });

            fetch("/all_data")
                .then(res => res.json())
                .then(full => {
                    allChemicalsData = full;
                    renderChemicalCards();
                    renderGlobalCharts(full);
                });
        })
        .catch(() => {
            errorDiv.textContent = "Failed to load chemical data.";
            errorDiv.classList.remove("hidden");
        });

    document.getElementById("analysis-form").addEventListener("submit", e => {
        e.preventDefault();
        const chemical = chemicalSelect.value;
        if (!chemical) return;
        loadingDiv.classList.remove("hidden");
        resultsDiv.classList.add("hidden");
        errorDiv.classList.add("hidden");
        fetch("/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chemical })
        })
            .then(res => res.json())
            .then(data => {
                loadingDiv.classList.add("hidden");
                if (!data.success) {
                    errorDiv.textContent = data.message;
                    errorDiv.classList.remove("hidden");
                    return;
                }
                const info = data.data;
                info.toxicity = info.toxicity || info.ld50_oral || 0;
                info.risk = info.risk || { low: 50, medium: 30, high: 20 };
                resultsDiv.classList.remove("hidden");

                document.getElementById("chemical-image").src = info.image;

                const toxicClass = getToxicityClass(info.ld50_oral);
                const toxicBadge = document.getElementById("toxicity-badge");
                toxicBadge.className = `toxicity-badge ${toxicClass}`;
                toxicBadge.textContent = getToxicityLabel(info.ld50_oral);

                document.getElementById("chemical-info").innerHTML = `
                    <p><strong><i class="fas fa-atom"></i> Formula:</strong> ${info.formula}</p>
                    <p><strong><i class="fas fa-tint"></i> LD50 Oral:</strong> ${info.ld50_oral} mg/kg</p>
                    <p><strong><i class="fas fa-leaf"></i> Environmental Persistence:</strong> ${info.environmental_persistence}</p>
                    <p><strong><i class="fas fa-info-circle"></i> Description:</strong> ${info.description}</p>
                    <p><strong><i class="fas fa-exclamation-triangle"></i> Risk Assessment:</strong> ${info.risk_assessment}</p>
                `;
                quoteDiv.innerHTML = `<i class="fas fa-lightbulb"></i> ${quotes[chemical] || ""}`;

                const tips = safetyTips[chemical];
                const tipsDiv = document.getElementById("safety-tips");
                if (tips) {
                    tipsDiv.innerHTML = `
                        <h4><i class="fas fa-shield-alt"></i> Safety Recommendations</h4>
                        <ul>${tips.map(t => `<li><i class="fas fa-check-circle"></i> ${t}</li>`).join('')}</ul>
                    `;
                }

                showTab('overview');
                updateRecentSearches(chemical);
                renderChemicalCharts(info);
                loadMoleculeStructure(chemical);
            })
            .catch(() => {
                loadingDiv.classList.add("hidden");
                errorDiv.classList.add("hidden");
            });
    });

    Chart.defaults.font.family = "Poppins";
});

function renderChemicalCharts(info) {
    if (chartInstances["toxicity"]) chartInstances["toxicity"].destroy();
    chartInstances["toxicity"] = new Chart(document.getElementById("toxicity-chart"), {
        type: "bar",
        data: {
            labels: ["Toxicity Level"],
            datasets: [{
                label: "Toxicity Score",
                data: [info.toxicity],
                backgroundColor: ["#ff7043"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, max: 10, ticks: { stepSize: 1 } }
            }
        }
    });

    if (chartInstances["risk"]) chartInstances["risk"].destroy();
    chartInstances["risk"] = new Chart(document.getElementById("risk-chart"), {
        type: "pie",
        data: {
            labels: ["Low Risk", "Medium Risk", "High Risk"],
            datasets: [{
                data: [info.risk.low, info.risk.medium, info.risk.high],
                backgroundColor: ["#66bb6a", "#ffee58", "#ef5350"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: 10 }
        }
    });
}

function renderGlobalCharts(all) {
    if (chartInstances["safetyHazard"]) chartInstances["safetyHazard"].destroy();
    chartInstances["safetyHazard"] = new Chart(document.getElementById("safety-hazard-chart"), {
        type: "bar",
        data: {
            labels: all.map(c => c.name.charAt(0).toUpperCase() + c.name.slice(1)),
            datasets: [
                { label: "Safety Score", data: all.map(c => c.safety), backgroundColor: "#10b981" },
                { label: "Hazard Score", data: all.map(c => c.hazard), backgroundColor: "#ef4444" }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: {
                y: { beginAtZero: true, max: 1000, title: { display: true, text: 'Score' } },
                x: { ticks: { maxRotation: 45, minRotation: 45 } }
            }
        }
    });

    if (chartInstances["safetyLevel"]) chartInstances["safetyLevel"].destroy();
    chartInstances["safetyLevel"] = new Chart(document.getElementById("safety-level-chart"), {
        type: "radar",
        data: {
            labels: all.map(c => c.name.charAt(0).toUpperCase() + c.name.slice(1)),
            datasets: [{
                label: "Safety Level",
                data: all.map(c => c.safety),
                backgroundColor: "rgba(16,185,129,0.3)",
                borderColor: "#10b981",
                pointBackgroundColor: "#10b981",
                pointBorderColor: "#fff",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "#10b981"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: {
                r: { beginAtZero: true, max: 1000, ticks: { stepSize: 200 } }
            }
        }
    });

    if (chartInstances["globalToxicity"]) chartInstances["globalToxicity"].destroy();
    chartInstances["globalToxicity"] = new Chart(document.getElementById("all-toxicity-chart"), {
        type: "bar",
        data: {
            labels: all.map(c => c.name.charAt(0).toUpperCase() + c.name.slice(1)),
            datasets: [{
                label: "Toxicity Level",
                data: all.map(c => c.toxicity),
                backgroundColor: all.map(c => c.ld50_oral < 50 ? '#ef4444' : c.ld50_oral < 500 ? '#f59e0b' : '#10b981'),
                borderColor: "#fff",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Toxicity Score' } },
                x: { ticks: { maxRotation: 45, minRotation: 45 } }
            }
        }
    });
}

function sendMessage() {
    const input = document.getElementById("chat-input");
    const msg = input.value.trim();
    if (!msg) return;

    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<div class="chat-message user-msg">${msg}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;

    fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
    })
        .then(res => res.json())
        .then(data => {
            if (data.reply) {
                chatBox.innerHTML += `<div class="chat-message bot-msg">${data.reply}</div>`;
            } else {
                chatBox.innerHTML += `<div class="chat-message bot-msg">No reply from server</div>`;
            }
            chatBox.scrollTop = chatBox.scrollHeight;
        })
        .catch(err => {
            chatBox.innerHTML += `<div class="chat-message bot-msg">Error connecting to server</div>`;
            chatBox.scrollTop = chatBox.scrollHeight;
        });

    input.value = "";
}

function compareChemicals() {
    const selected1 = document.getElementById("chem1").value;
    const selected2 = document.getElementById("chem2").value;

    if (!selected1 || !selected2) {
        showToast('Please select both chemicals to compare');
        return;
    }

    fetch("/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chem1: selected1, chem2: selected2 })
    })
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                showToast(data.message);
                return;
            }
            const resultDiv = document.getElementById("compare-result");
            resultDiv.classList.remove("hidden");

            const c1 = data.chem1;
            const c2 = data.chem2;

            resultDiv.innerHTML = `
                <h3 style="margin:0 0 15px 0;"><i class="fas fa-balance-scale"></i> Comparison Results</h3>
                <div class="compare-grid">
                    <div class="compare-card">
                        <div class="compare-title">${c1.formula || selected1}</div>
                        <p><strong>Risk:</strong> ${c1.risk_assessment}</p>
                        <p><strong>LD50:</strong> ${c1.ld50_oral} mg/kg</p>
                        <p><strong>Toxicity:</strong> ${c1.toxicity}</p>
                    </div>
                    <div class="compare-card">
                        <div class="compare-title">${c2.formula || selected2}</div>
                        <p><strong>Risk:</strong> ${c2.risk_assessment}</p>
                        <p><strong>LD50:</strong> ${c2.ld50_oral} mg/kg</p>
                        <p><strong>Toxicity:</strong> ${c2.toxicity}</p>
                    </div>
                </div>
                <div class="compare-highlight">${data.summary.replace(/\n/g, "<br>")}</div>
            `;

            setTimeout(() => resultDiv.classList.add("hidden"), 10000);
        })
        .catch(err => {
            console.error(err);
            showToast('Compare failed. Please try again.');
        });
}