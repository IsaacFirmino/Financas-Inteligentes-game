
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function freshState() {
    return {
        balance: 1000,
        reserve: 0,
        score: 0,
        debt: 0,
        investmentReturn: 0,
        stepIndex: 0,
        started: false,
        finished: false,
        history: [],
        unlockedBadges: new Set()
    };
}

let state = freshState();

const ui = {
    balance: document.getElementById("balance-display"),
    reserve: document.getElementById("reserve-display"),
    score: document.getElementById("score-display"),
    round: document.getElementById("round-display"),
    levelName: document.getElementById("level-name"),
    levelBadge: document.getElementById("level-badge"),
    progressFill: document.getElementById("progress-fill"),
    progressPercent: document.getElementById("progress-percent"),
    progressLabel: document.getElementById("progress-label"),
    badgeCount: document.getElementById("badge-count"),
    badgesList: document.getElementById("badges-list"),
    rankingList: document.getElementById("ranking-list"),
    gameCard: document.getElementById("game-card"),
    phaseKicker: document.getElementById("phase-kicker"),
    stageTitle: document.getElementById("stage-title"),
    conceptTag: document.getElementById("concept-tag"),
    conceptText: document.getElementById("concept-text"),
    restartButton: document.getElementById("restart-button"),
    themeButton: document.getElementById("theme-button"),
    themeIcon: document.getElementById("theme-icon")
};

const levels = [
    { min: 0, name: "Novato Financeiro", label: "Nível 1" },
    { min: 180, name: "Planejador do Mês", label: "Nível 2" },
    { min: 360, name: "Guardião da Reserva", label: "Nível 3" },
    { min: 560, name: "Investidor Consciente", label: "Nível 4" },
    { min: 760, name: "Mestre das Finanças", label: "Nível 5" }
];

const badges = [
    { id: "start", icon: "▶", name: "Primeiro Passo", description: "Iniciou a jornada financeira." },
    { id: "budget", icon: "▦", name: "Orçamento Vivo", description: "Criou um plano antes de gastar." },
    { id: "needs", icon: "✓", name: "Prioridades", description: "Separou necessidade de desejo." },
    { id: "reserve", icon: "◆", name: "Reserva Ativa", description: "Guardou dinheiro para imprevistos." },
    { id: "credit", icon: "!", name: "Cartão no Controle", description: "Evitou juros do rotativo." },
    { id: "emergency", icon: "🛡", name: "Proteção", description: "Usou a reserva com inteligência." },
    { id: "quiz", icon: "?", name: "Sabe-Juros", description: "Acertou um conceito financeiro." },
    { id: "investor", icon: "▲", name: "Dinheiro Trabalhando", description: "Escolheu investir com objetivo." }
];

const baseRanking = [
    { name: "Ana", score: 820 },
    { name: "Rafa", score: 690 },
    { name: "Bia", score: 560 },
    { name: "Leo", score: 420 }
];

const STORAGE_KEYS = {
    theme: "theme",
    playerName: "playerName",
    // histórico de tentativas no ranking
    ranking: "rankingTop5"
};

let playerName = "";


const steps = [
    {
        phase: "Fase 1 · Planejamento",
        title: "Seu salário caiu: como você começa o mês?",
        conceptTag: "Orçamento",
        conceptText: "Um orçamento transforma renda em plano. Antes de gastar, defina limites para necessidades, desejos, reserva e objetivos.",
        prompt: "Você recebeu R$ 1.000,00. A primeira decisão é organizar o dinheiro para evitar escolhas impulsivas.",
        choices: [
            { icon: "▦", title: "Usar a regra 50-30-20", description: "Separar o mês em necessidades, desejos e poupança antes de comprar qualquer coisa.", impact: "+90 XP", score: 90, badges: ["start", "budget"], tone: "good", feedbackTitle: "Ótimo começo.", feedback: "Você criou uma referência para decidir e reduziu compras por impulso.", learning: "Regra prática: 50% necessidades, 30% desejos e 20% poupança ou dívidas. Ela pode ser adaptada à sua realidade." },
            { icon: "≡", title: "Anotar só no fim do mês", description: "Gastar normalmente e conferir depois para onde o dinheiro foi.", impact: "+35 XP", score: 35, badges: ["start"], tone: "warn", feedbackTitle: "Ajuda, mas chega tarde.", feedback: "Registrar gastos é útil, mas só no fim do mês não impede decisões ruins durante o caminho.", learning: "Controle financeiro funciona melhor quando orienta a decisão antes do gasto acontecer." },
            { icon: "×", title: "Decidir tudo na hora", description: "Confiar na memória e lidar com os gastos conforme aparecem.", impact: "+10 XP", score: 10, badges: ["start"], tone: "risk", feedbackTitle: "Risco de descontrole.", feedback: "Sem plano, pequenos gastos competem com contas importantes.", learning: "A memória costuma subestimar gastos pequenos. O orçamento tira essa carga da cabeça." }
        ]
    },
    {
        phase: "Fase 2 · Gastos Variáveis",
        title: "Alimentação da semana: qual estratégia você escolhe?",
        conceptTag: "Gasto variável",
        conceptText: "Gastos variáveis mudam conforme seus hábitos. Eles são bons pontos para economizar sem cortar tudo.",
        prompt: "Alimentação pesa no orçamento, mas dá para equilibrar economia, saúde e praticidade.",
        choices: [
            { icon: "⌂", title: "Planejar marmitas", description: "Comprar ingredientes e preparar refeições em casa durante a semana.", impact: "-R$ 220 · +85 XP", balanceDelta: -220, score: 85, badges: ["needs"], tone: "good", feedbackTitle: "Escolha eficiente.", feedback: "Você reduziu o custo recorrente sem eliminar alimentação de qualidade.", learning: "Planejamento de compras evita desperdício e diminui a dependência de delivery." },
            { icon: "◐", title: "Misturar casa e delivery", description: "Cozinhar alguns dias e pedir comida quando a rotina apertar.", impact: "-R$ 390 · +50 XP", balanceDelta: -390, score: 50, tone: "warn", feedbackTitle: "Equilibrado, mas exige limite.", feedback: "Você manteve conforto, porém gastou bem mais. Funciona se houver teto semanal.", learning: "Definir um limite para delivery evita que a exceção vire regra." },
            { icon: "$", title: "Pedir comida quase todo dia", description: "Priorizar praticidade, mesmo com custo alto ao longo do mês.", impact: "-R$ 610 · +15 XP", balanceDelta: -610, score: 15, tone: "risk", feedbackTitle: "Praticidade cara.", feedback: "O gasto consumiu uma parte grande da renda e reduziu sua margem para objetivos.", learning: "Uma despesa pequena repetida muitas vezes vira uma despesa grande." }
        ]
    },
    {
        phase: "Fase 3 · Mobilidade",
        title: "Como você vai se deslocar este mês?",
        conceptTag: "Custo total",
        conceptText: "O custo real de uma escolha inclui dinheiro, tempo, manutenção e previsibilidade.",
        prompt: "Transporte é uma decisão recorrente. Compare conforto, preço e impacto no orçamento.",
        choices: [
            { icon: "▣", title: "Transporte público + caminhada", description: "Usar bilhete mensal e caminhar em trajetos curtos.", impact: "-R$ 120 · +80 XP", balanceDelta: -120, score: 80, badges: ["needs"], tone: "good", feedbackTitle: "Custo previsível.", feedback: "Você escolheu uma alternativa barata e controlável, liberando dinheiro para metas.", learning: "Custos previsíveis facilitam o orçamento porque reduzem surpresas no fim do mês." },
            { icon: "◇", title: "Aplicativos em dias corridos", description: "Usar app de transporte quando estiver atrasado ou chovendo.", impact: "-R$ 260 · +45 XP", balanceDelta: -260, score: 45, tone: "warn", feedbackTitle: "Conforto com atenção.", feedback: "A escolha pode funcionar, mas precisa de limite para não virar gasto invisível.", learning: "Gastos por conveniência devem ter teto mensal definido." },
            { icon: "⬢", title: "Carro para tudo", description: "Usar carro em todos os deslocamentos, incluindo trajetos curtos.", impact: "-R$ 430 · +20 XP", balanceDelta: -430, score: 20, tone: "risk", feedbackTitle: "Custo alto e recorrente.", feedback: "Combustível, estacionamento e manutenção pressionam bastante o orçamento.", learning: "O custo total do carro vai além do combustível." }
        ]
    },
    {
        phase: "Fase 4 · Segurança",
        title: "Você vai montar uma reserva de emergência?",
        conceptTag: "Reserva de emergência",
        conceptText: "Reserva é dinheiro separado para imprevistos reais. Ela protege seu orçamento e reduz dependência de crédito caro.",
        prompt: "Guardar parece difícil no começo, mas uma reserva pequena já muda suas opções quando algo inesperado acontece.",
        choices: [
            { icon: "◆", title: "Guardar R$ 200 agora", description: "Separar o valor logo no início, antes que ele vire gasto comum.", impact: "-R$ 200 saldo · +R$ 200 reserva · +95 XP", balanceDelta: -200, reserveDelta: 200, score: 95, badges: ["reserve"], tone: "good", feedbackTitle: "Reserva criada.", feedback: "Você se pagou primeiro. Isso aumenta sua segurança para lidar com imprevistos.", learning: "Guardar no início do mês costuma funcionar melhor do que esperar sobrar." },
            { icon: "◒", title: "Guardar R$ 100", description: "Começar com uma reserva menor para manter mais flexibilidade no mês.", impact: "-R$ 100 saldo · +R$ 100 reserva · +60 XP", balanceDelta: -100, reserveDelta: 100, score: 60, badges: ["reserve"], tone: "warn", feedbackTitle: "Bom começo.", feedback: "Mesmo uma reserva pequena ajuda, mas talvez não cubra emergências maiores.", learning: "Consistência importa. Reservas crescem com aportes mensais." },
            { icon: "○", title: "Não guardar nada", description: "Deixar para poupar só se sobrar dinheiro no final.", impact: "+10 XP", score: 10, tone: "risk", feedbackTitle: "Sem proteção.", feedback: "Você manteve saldo no bolso, mas ficou vulnerável a qualquer emergência.", learning: "Se poupar depende apenas de sobrar, geralmente não sobra." }
        ]
    },
    {
        phase: "Fase 5 · Crédito",
        title: "A fatura do cartão chegou em R$ 180. O que fazer?",
        conceptTag: "Juros",
        conceptText: "Crédito pode ajudar no fluxo de caixa, mas juros altos transformam compras pequenas em dívidas grandes.",
        prompt: "O cartão não é renda extra. A decisão aqui afeta seu mês atual e os próximos.",
        choices: [
            { icon: "✓", title: "Pagar a fatura completa", description: "Quitar tudo agora e evitar juros do rotativo.", impact: "-R$ 180 · +90 XP", balanceDelta: -180, score: 90, badges: ["credit"], tone: "good", feedbackTitle: "Juros evitados.", feedback: "Você manteve o cartão como ferramenta, não como dívida.", learning: "Pagar a fatura integral é uma das formas mais simples de evitar juros caros." },
            { icon: "◐", title: "Parcelar a fatura", description: "Pagar menos agora, mas assumir custo adicional no futuro.", impact: "-R$ 90 · +R$ 45 dívida · +30 XP", balanceDelta: -90, debtDelta: 45, score: 30, tone: "warn", feedbackTitle: "Alívio com custo.", feedback: "Você ganhou fôlego no mês, mas carregou dívida para frente.", learning: "Parcelar dívida pode ser necessário, mas precisa de plano de saída." },
            { icon: "!", title: "Pagar só o mínimo", description: "Resolver o aperto de hoje e deixar o restante no rotativo.", impact: "-R$ 40 · +R$ 110 dívida · +5 XP", balanceDelta: -40, debtDelta: 110, score: 5, tone: "risk", feedbackTitle: "Sinal de alerta.", feedback: "O rotativo costuma ter juros muito altos e pode virar bola de neve.", learning: "Quando a dívida cresce sozinha, ela passa a mandar no orçamento." }
        ]
    },
    {
        phase: "Fase 6 · Imprevisto",
        title: "Seu celular quebrou e o conserto custa R$ 250.",
        conceptTag: "Proteção financeira",
        conceptText: "Imprevistos testam o planejamento. Reserva reduz o impacto emocional e financeiro da urgência.",
        prompt: "Agora o jogo mostra por que guardar dinheiro antes parecia tão importante.",
        choices: [
            { icon: "🛡", title: "Usar a reserva primeiro", description: "Cobrir o máximo possível com a reserva e pagar o restante com saldo.", impact: "Reserva protege o saldo · +95 XP", customApply: useReserveForEmergency, score: 95, badges: ["emergency"], tone: "good", feedbackTitle: "A reserva cumpriu o papel dela.", feedback: "Você usou dinheiro preparado para urgências, sem transformar o problema em dívida cara.", learning: "Reserva de emergência não é fracasso quando usada. Ela existe exatamente para isso." },
            { icon: "$", title: "Pagar tudo com saldo", description: "Não mexer na reserva e pagar o conserto direto do dinheiro disponível.", impact: "-R$ 250 · +45 XP", balanceDelta: -250, score: 45, tone: "warn", feedbackTitle: "Resolveu, mas apertou o mês.", feedback: "Você evitou dívida, porém reduziu bastante o dinheiro livre.", learning: "Quando há reserva, use-a para preservar o funcionamento do orçamento." },
            { icon: "!", title: "Colocar no cartão sem plano", description: "Adiar o pagamento e lidar com a conta depois.", impact: "+R$ 280 dívida · +5 XP", debtDelta: 280, score: 5, tone: "risk", feedbackTitle: "Emergência virou dívida.", feedback: "Você preservou o saldo hoje, mas criou uma obrigação maior para o futuro.", learning: "Crédito sem plano troca um problema atual por um problema maior depois." }
        ]
    },
    {
        phase: "Fase 7 · Quiz Rápido",
        title: "Qual alternativa define melhor juros compostos?",
        conceptTag: "Juros compostos",
        conceptText: "Juros compostos são juros sobre juros. Eles podem trabalhar a favor nos investimentos ou contra nas dívidas.",
        prompt: "Hora de ganhar XP pelo conceito que mais aparece em investimentos e dívidas.",
        choices: [
            { icon: "✓", title: "Juros que também incidem sobre rendimentos anteriores", description: "O valor cresce porque cada período considera o montante acumulado.", impact: "+100 XP", score: 100, badges: ["quiz"], tone: "good", feedbackTitle: "Resposta correta.", feedback: "Você identificou o efeito de crescimento acumulado dos juros compostos.", learning: "No investimento, tempo ajuda. Na dívida, tempo sem pagamento costuma piorar a situação." },
            { icon: "×", title: "Juros cobrados só uma vez na compra", description: "Um custo único que não muda com o passar do tempo.", impact: "+20 XP", score: 20, tone: "risk", feedbackTitle: "Quase, mas não é isso.", feedback: "Esse seria um custo fixo. Juros compostos se acumulam a cada período.", learning: "Sempre observe se a taxa é mensal, anual e se incide sobre o saldo acumulado." },
            { icon: "?", title: "Desconto dado para quem paga à vista", description: "Uma redução no preço final por antecipar o pagamento.", impact: "+15 XP", score: 15, tone: "warn", feedbackTitle: "Conceito diferente.", feedback: "Desconto é redução de preço. Juros compostos são crescimento do valor ao longo do tempo.", learning: "Comparar desconto à vista com rendimento do dinheiro ajuda a tomar decisões melhores." }
        ]
    },
    {
        phase: "Fase 8 · Investimento",
        title: "Sobrou algum dinheiro. Qual destino combina com seu objetivo?",
        conceptTag: "Investimento com objetivo",
        conceptText: "Investir não é apostar. A escolha deve combinar prazo, risco, liquidez e objetivo.",
        prompt: "A decisão final mostra que dinheiro parado, reserva e investimento têm papéis diferentes.",
        choices: [
            { icon: "▲", title: "Investir parte em CDB de liquidez diária", description: "Aplicar 70% do saldo livre e manter uma margem para o dia a dia.", impact: "+rendimento simulado · +105 XP", customApply: investSmart, score: 105, badges: ["investor"], tone: "good", feedbackTitle: "Estratégia equilibrada.", feedback: "Você colocou o dinheiro para render sem travar toda a liquidez.", learning: "Liquidez diária é útil para objetivos curtos e para parte da reserva." },
            { icon: "▣", title: "Deixar tudo na conta corrente", description: "Manter o dinheiro disponível, sem buscar rendimento.", impact: "+25 XP", score: 25, tone: "warn", feedbackTitle: "Seguro, mas perde força.", feedback: "Você preservou liquidez, mas abriu mão de rendimento e perdeu poder de compra para a inflação.", learning: "Dinheiro parado pode parecer seguro, mas tende a valer menos com o tempo." },
            { icon: "!", title: "Investir tudo em algo arriscado", description: "Buscar retorno rápido sem separar reserva ou entender o risco.", impact: "risco alto · +10 XP", score: 10, tone: "risk", feedbackTitle: "Risco sem plano.", feedback: "Retorno alto prometido sem clareza pode colocar seu dinheiro em perigo.", learning: "Antes de investir, entenda prazo, risco, liquidez e custos." }
        ]
    }
];
function money(value) {
    return currency.format(value);
}

function level() {
    return levels.reduce((current, item) => state.score >= item.min ? item : current, levels[0]);
}

function updateDashboard() {
    const progress = state.finished ? 100 : Math.round((state.stepIndex / steps.length) * 100);
    const currentLevel = level();

    ui.balance.textContent = money(state.balance);
    ui.balance.style.color = state.balance < 0 ? "var(--danger)" : "var(--text)";
    ui.reserve.textContent = money(state.reserve);
    ui.score.textContent = `${state.score} XP`;
    ui.round.textContent = `${Math.min(state.stepIndex, steps.length)}/${steps.length}`;
    ui.levelName.textContent = currentLevel.name;
    ui.levelBadge.textContent = currentLevel.label;
    ui.progressFill.style.width = `${progress}%`;
    ui.progressPercent.textContent = `${progress}%`;
    ui.progressLabel.textContent = state.finished
        ? "Jornada concluída. Revise seu relatório e tente melhorar o ranking."
        : state.started
            ? `Rodada ${Math.min(state.stepIndex + 1, steps.length)} de ${steps.length}`
            : "Complete decisões para subir de nível.";

    renderBadges();
    renderRanking();
}

function applyTheme(isDark) {
    document.body.classList.toggle("dark-theme", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
    ui.themeButton.setAttribute("aria-label", isDark ? "Alternar para tema claro" : "Alternar para tema escuro");
    ui.themeButton.setAttribute("aria-pressed", isDark ? "true" : "false");
    ui.themeIcon.textContent = isDark ? "☀" : "☾";
}

function initializeTheme() {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme ? savedTheme === "dark" : prefersDark;
    applyTheme(isDark);
    ui.themeButton.addEventListener("click", () => applyTheme(!document.body.classList.contains("dark-theme")));
}

function renderBadges() {
    ui.badgeCount.textContent = `${state.unlockedBadges.size}/${badges.length}`;
    ui.badgesList.innerHTML = badges.map((badge) => {
        const unlocked = state.unlockedBadges.has(badge.id);
        return `
            <div class="badge-item ${unlocked ? "unlocked" : ""}">
                <span class="medal-icon" aria-hidden="true">${unlocked ? badge.icon : "·"}</span>
                <span class="badge-text">
                    <strong>${badge.name}</strong>
                    <span>${badge.description}</span>
                </span>
            </div>`;
    }).join("");
}

function normalizeName(name) {
    return String(name || "")
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 24);
}

async function fetchLeaderboard() {
    const url = "http://127.0.0.1:5000/api/leaderboard";
    try {
        const res = await fetch(url, { method: "GET", cache: "no-store" });
        if (!res.ok) return [];
        const data = await res.json();
        const top5 = Array.isArray(data?.top5) ? data.top5 : [];
        return top5
            .filter((p) => p && typeof p.name === "string" && typeof p.score === "number")
            .map((p) => ({ name: p.name, score: p.score }));
    } catch {
        return [];
    }
}

async function submitScoreToBackend(finalScore) {
    const url = "http://127.0.0.1:5000/api/score";
    if (!playerName) return false;

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: playerName, score: finalScore })
        });
        return res.ok;
    } catch {
        return false;
    }
}

let rankingInFlight = false;

async function renderRanking() {
    // fallback visual enquanto backend não responde
    const stored = await fetchLeaderboard();
    const currentPlayerEntry = playerName
        ? { name: playerName, score: state.score, current: true }
        : null;

    const ranking = [
        ...baseRanking,
        ...stored,
        ...(currentPlayerEntry ? [currentPlayerEntry] : [])
    ]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    ui.rankingList.innerHTML = ranking.map((player, index) => `
        <li class="${player.current ? "current-player" : ""}">
            <span class="rank-name">${index + 1}. ${player.name}</span>
            <span class="rank-score">${player.score} XP</span>
        </li>`).join("");
}

async function renderRankingSafe() {
    if (rankingInFlight) return;
    rankingInFlight = true;
    try {
        await renderRanking();
    } finally {
        rankingInFlight = false;
    }
}




function setStage(step) {
    ui.phaseKicker.textContent = step.phase;
    ui.stageTitle.textContent = step.title;
    ui.conceptTag.textContent = step.conceptTag;
    ui.conceptText.textContent = step.conceptText;
}

function renderWelcome() {
    ui.phaseKicker.textContent = "Bem-vindo";
    ui.stageTitle.textContent = "Dashboard gamificado de educação financeira";
    ui.conceptTag.textContent = "Aprendizagem ativa";
    ui.conceptText.textContent = "Você aprende melhor quando decide, vê consequência e recebe feedback claro sobre a escolha.";

    ui.gameCard.innerHTML = `
        <div class="game-content hero-grid fade-in">
            <div>
                <p class="eyebrow">Simulador educativo</p>
                <h2 class="hero-title">Construa um mês financeiro inteligente.</h2>
                <p class="hero-copy">Tome decisões sobre orçamento, consumo, reserva, crédito e investimento. Cada escolha altera seu saldo, XP, nível, medalhas e posição no ranking.</p>
                <div class="hero-actions">
                    <button class="primary-button" type="button" data-action="start">Começar jornada</button>
                    <button class="secondary-button" type="button" data-action="simulate">Ver exemplo de pontuação</button>
                </div>
            </div>
            <div class="dashboard-preview" aria-hidden="true">
                <div class="preview-tile"><strong>8</strong><span>rodadas educativas</span></div>
                <div class="preview-tile"><strong>5</strong><span>níveis de evolução</span></div>
                <div class="preview-tile"><strong>8</strong><span>medalhas desbloqueáveis</span></div>
            </div>
        </div>`;
}

function renderStep() {
    if (state.stepIndex >= steps.length) {
        finishGame();
        return;
    }

    const step = steps[state.stepIndex];
    setStage(step);
    ui.gameCard.innerHTML = `
        <div class="game-content fade-in">
            <div class="step-topline">
                <div>
                    <span class="step-number">Rodada ${state.stepIndex + 1}/${steps.length}</span>
                    <h2 class="step-title">${step.title}</h2>
                    <p class="step-copy">${step.prompt}</p>
                </div>
            </div>
            <div class="choice-grid">
                ${step.choices.map((choice, index) => `
                    <button class="choice-button" type="button" data-choice-index="${index}">
                        <span class="choice-icon" aria-hidden="true">${choice.icon}</span>
                        <h3>${choice.title}</h3>
                        <p>${choice.description}</p>
                        <span class="choice-meta"><span>Impacto</span><strong>${choice.impact}</strong></span>
                    </button>`).join("")}
            </div>
        </div>`;
}

function applyChoice(choice) {
    if (typeof choice.customApply === "function") {
        choice.customApply();
    } else {
        state.balance += choice.balanceDelta || 0;
        state.reserve += choice.reserveDelta || 0;
        state.debt += choice.debtDelta || 0;
    }

    state.score = Math.max(0, state.score + choice.score);
    const unlockedNow = unlockBadges(choice.badges || []);
    state.history.push({ phase: steps[state.stepIndex].phase, title: choice.title, learning: choice.learning });
    renderFeedback(choice, unlockedNow);
    updateDashboard();
}

function unlockBadges(ids) {
    const unlockedNow = [];
    ids.forEach((id) => {
        if (!state.unlockedBadges.has(id)) {
            state.unlockedBadges.add(id);
            const badge = badges.find((item) => item.id === id);
            if (badge) unlockedNow.push(badge);
        }
    });
    return unlockedNow;
}

function renderFeedback(choice, unlockedNow) {
    ui.gameCard.innerHTML = `
        <div class="game-content fade-in">
            <div class="feedback-box ${choice.tone}">
                <p class="feedback-label">Feedback da decisão</p>
                <h3>${choice.feedbackTitle}</h3>
                <p class="feedback-copy">${choice.feedback}</p>
                <p class="feedback-copy"><strong>Aprendizado:</strong> ${choice.learning}</p>
                ${unlockedNow.length ? `<div class="achievement-toast"><span aria-hidden="true">${unlockedNow[0].icon}</span><span>Medalha desbloqueada: ${unlockedNow.map((badge) => badge.name).join(", ")}</span></div>` : ""}
                <div class="hero-actions"><button class="primary-button" type="button" data-action="next">Continuar</button></div>
            </div>
        </div>`;
}
function useReserveForEmergency() {
    const emergencyCost = 250;
    const fromReserve = Math.min(state.reserve, emergencyCost);
    const remaining = emergencyCost - fromReserve;
    state.reserve -= fromReserve;
    state.balance -= remaining;
}

function investSmart() {
    const investable = Math.max(0, state.balance * 0.7);
    const simulatedReturn = investable * 0.012;
    state.investmentReturn += simulatedReturn;
    state.balance += simulatedReturn;
}

function finishGame() {
    state.finished = true;
    state.stepIndex = steps.length;
    unlockFinalBadges();

    // envia score ao backend (ranking ao vivo)
    submitScoreToBackend(state.score).finally(() => updateDashboard());

    const health = financialHealth();

    ui.phaseKicker.textContent = "Relatório final";
    ui.stageTitle.textContent = health.title;
    ui.conceptTag.textContent = "Revisão";
    ui.conceptText.textContent = "O relatório final conecta escolhas do jogo com atitudes que podem ser usadas na vida real.";

    ui.gameCard.innerHTML = `
        <div class="game-content fade-in">
            <p class="eyebrow">Fim da jornada</p>
            <h2 class="step-title">${health.title}</h2>
            <p class="result-copy">${health.message}</p>
            <div class="result-grid">
                <div class="result-stat"><span>Saldo final</span><strong>${money(state.balance)}</strong></div>
                <div class="result-stat"><span>Reserva</span><strong>${money(state.reserve)}</strong></div>
                <div class="result-stat"><span>Dívidas</span><strong>${money(state.debt)}</strong></div>
                <div class="result-stat"><span>Rendimento</span><strong>${money(state.investmentReturn)}</strong></div>
            </div>
            <div class="coach-panel">
                <h3>Mentor financeiro</h3>
                <ul>${coachTips().map((tip) => `<li>${tip}</li>`).join("")}</ul>
            </div>
            <div class="result-actions">
                <button class="primary-button" type="button" data-action="restart">Jogar novamente</button>
                <button class="secondary-button" type="button" data-action="review">Rever minhas decisões</button>
            </div>
        </div>`;
}

function unlockFinalBadges() {
    if (state.balance > 0 && state.debt === 0) unlockBadges(["needs"]);
    if (state.reserve > 0) unlockBadges(["reserve"]);
    if (state.investmentReturn > 0) unlockBadges(["investor"]);
}

function financialHealth() {
    if (state.debt > 150 || state.balance < 0) {
        return {
            title: "Você terminou o mês em zona de atenção.",
            message: "Algumas escolhas resolveram problemas no curto prazo, mas criaram pressão para o próximo mês. O foco agora é reduzir dívida e reconstruir margem."
        };
    }

    if (state.reserve >= 100 && state.balance > 0 && state.score >= 560) {
        return {
            title: "Excelente: você construiu segurança e aprendizado.",
            message: "Seu mês teve planejamento, proteção contra imprevistos e decisões conscientes. Esse comportamento melhora com repetição."
        };
    }

    return {
        title: "Bom progresso: ainda dá para otimizar.",
        message: "Você tomou algumas boas decisões, mas pode melhorar reserva, controle de gastos e estratégia de investimento nas próximas tentativas."
    };
}

function coachTips() {
    const tips = [];
    if (state.debt > 0) tips.push("Priorize quitar dívidas caras antes de buscar investimentos mais sofisticados.");
    if (state.reserve < 100) tips.push("Crie uma meta inicial de reserva, mesmo que pequena, e guarde no começo do mês.");
    if (state.balance < 150) tips.push("Revise gastos variáveis como alimentação, transporte por aplicativo e lazer para recuperar margem.");
    if (state.investmentReturn <= 0 && state.balance > 0) tips.push("Depois da reserva, coloque parte do dinheiro em uma aplicação simples e líquida para não ficar parado.");
    tips.push("Use percentuais do salário para comparar escolhas: isso revela quando um gasto está grande demais para sua renda.");
    return tips.slice(0, 4);
}

function renderReview() {
    ui.phaseKicker.textContent = "Revisão";
    ui.stageTitle.textContent = "Suas decisões da jornada";
    ui.conceptTag.textContent = "Metacognição";
    ui.conceptText.textContent = "Rever decisões ajuda a transformar tentativa em aprendizado. O objetivo não é acertar tudo, é entender o impacto.";

    ui.gameCard.innerHTML = `
        <div class="game-content fade-in">
            <p class="eyebrow">Histórico</p>
            <h2 class="step-title">O que suas escolhas mostram?</h2>
            <div class="coach-panel">
                <ul>${state.history.map((item) => `<li><strong>${item.phase}:</strong> ${item.title}. ${item.learning}</li>`).join("")}</ul>
            </div>
            <div class="result-actions">
                <button class="primary-button" type="button" data-action="restart">Jogar novamente</button>
                <button class="secondary-button" type="button" data-action="final">Voltar ao relatório</button>
            </div>
        </div>`;
}

function showNameModal() {
    ui.gameCard.innerHTML = `
        <div class="game-content fade-in">
            <div class="feedback-box">
                <p class="feedback-label">Antes de começar</p>
                <h3>Digite seu nome</h3>
                <p class="feedback-copy">Isso vai aparecer no ranking quando você terminar.</p>

                <div class="name-modal">
                    <input id="player-name-input" class="name-input" type="text" maxlength="24" placeholder="Ex.: Maria" value="${playerName || ""}" />
                    <button id="player-name-save" class="primary-button" type="button">Continuar</button>
                </div>

                <p class="feedback-copy" style="margin-top: 12px;"><strong>Dica:</strong> use o nome da turma.</p>
            </div>
        </div>`;

    const input = document.getElementById("player-name-input");
    const button = document.getElementById("player-name-save");
    input && input.focus();

    const saveAndStart = () => {
        const name = normalizeName(input.value);
        if (!name) {
            input.focus();
            return;
        }

        playerName = name;
        try {
            localStorage.setItem(STORAGE_KEYS.playerName, playerName);
        } catch {
            // ignore
        }

        state = freshState();
        state.started = true;
        unlockBadges(["start"]);
        updateDashboard();
        renderStep();
    };

    button && button.addEventListener("click", saveAndStart);
    input && input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") saveAndStart();
    });
}

function startGame() {
    // garante que o aluno colocou o nome antes de iniciar
    if (!playerName) {
        showNameModal();
        return;
    }

    state = freshState();
    state.started = true;
    state.finished = false;
    state.stepIndex = 0;
    state.history = [];
    state.unlockedBadges = new Set();

    unlockBadges(["start"]);
    updateDashboard();
    renderStep();
}



function nextStep() {
    state.stepIndex += 1;
    updateDashboard();
    renderStep();
}

function showScoreExample() {
    ui.gameCard.innerHTML = `
        <div class="game-content fade-in">
            <div class="feedback-box good">
                <p class="feedback-label">Como funciona</p>
                <h3>XP mede aprendizado, não só dinheiro sobrando.</h3>
                <p class="feedback-copy">Você ganha mais pontos quando planeja, evita juros, monta reserva, entende conceitos e investe com objetivo. O ranking muda em tempo real conforme suas decisões.</p>
                <p class="feedback-copy"><strong>Dica:</strong> a melhor jogada nem sempre é gastar o mínimo. O ideal é equilibrar qualidade de vida, segurança e futuro.</p>
                <div class="hero-actions">
                    <button class="primary-button" type="button" data-action="start">Começar jornada</button>
                    <button class="secondary-button" type="button" data-action="welcome">Voltar</button>
                </div>
            </div>
        </div>`;
}

function handleGameClick(event) {
    // evita múltiplos cliques em botões do modal

    const choiceButton = event.target.closest("[data-choice-index]");
    const actionButton = event.target.closest("[data-action]");

    if (choiceButton) {
        const step = steps[state.stepIndex];
        const choice = step.choices[Number(choiceButton.dataset.choiceIndex)];
        applyChoice(choice);
        return;
    }

    if (!actionButton) return;
    const action = actionButton.dataset.action;

    if (action === "start") {
        showNameModal();
    }

    if (action === "next") nextStep();
    if (action === "restart") startGame();
    if (action === "review") renderReview();
    if (action === "final") finishGame();
    if (action === "simulate") showScoreExample();
    if (action === "welcome") renderWelcome();
}

function init() {
    // carrega nome salvo (se existir)
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.playerName);
        if (saved) playerName = normalizeName(saved);
    } catch {
        // ignore
    }

    ui.restartButton.addEventListener("click", () => {
        // volta para o modal se quiser trocar nome antes de reiniciar
        showNameModal();
    });

    ui.gameCard.addEventListener("click", handleGameClick);
    initializeTheme();
    renderWelcome();
    updateDashboard();

    // ranking ao vivo (polling)
    setInterval(() => {
        // atualiza sem criar múltiplas requisições em paralelo
        renderRankingSafe();
    }, 2000);

}



init();
