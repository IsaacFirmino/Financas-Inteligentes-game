```markdown
# 🪙 Finanças Inteligentes | Dashboard Gamificado

> Um simulador de decisões financeiras em ambiente gamificado focado em aprendizagem ativa e conscientização orçamentária.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Local Storage](https://img.shields.io/badge/Local_Storage-007ACC?style=for-the-badge&logo=mdnwebdocs&logoColor=white)

---

## 📌 Sobre o Projeto

O **Finanças Inteligentes** é uma aplicação web interativa voltada para a educação financeira de estudantes e jovens adultos[cite: 3]. O projeto funciona por meio da **aprendizagem ativa**: o usuário vivencia a simulação de um mês financeiro completo, onde cada decisão sobre consumo, mobilidade, crédito e reserva gera impactos diretos e imediatos no seu saldo, na sua pontuação de experiência (XP) e na sua resiliência a imprevistos[cite: 3, 4].

O grande diferencial didático do simulador é mostrar que **pontuar mais (XP) não significa necessariamente guardar o máximo de dinheiro possível**, mas sim aprender a equilibrar qualidade de vida, planejamento estratégico e proteção de futuro[cite: 4].

---

## 🎮 Funcionalidades Principais

*   **Identificação Inicial (Modal Dinâmico):** Formulário integrado para inserção do nome do estudante antes do início da jornada, garantindo a personalização da experiência[cite: 2, 4].
*   **Simulador em 8 Rodadas:** Passos guiados que cobrem conceitos cruciais como:
    *   Regra Orçamentária (50-30-20)[cite: 4].
    *   Gestão de Custos Variáveis (Alimentação e Transporte)[cite: 4].
    *   Criação de Reserva de Emergência[cite: 4].
    *   Uso Consciente de Crédito e Perigos dos Juros Rotativos[cite: 4].
    *   Princípio de Juros Compostos e Investimentos com Liquidez[cite: 4].
*   **Dashboard em Tempo Real:** Atualização dinâmica de indicadores de Saldo, Reserva, Rodada atual e Nível de Evolução (de *Novato Financeiro* a *Mestre das Finanças*)[cite: 3, 4].
*   **Sistema de Medalhas (Conquistas):** 8 insígnias colecionáveis desbloqueadas de acordo com as boas práticas adotadas pelo jogador durante a partida[cite: 4].
*   **Ranking Top 5 Persistente:** Tabela competitiva local que armazena os melhores desempenhos utilizando o `localStorage` do navegador[cite: 2, 4].
*   **Relatório e Mentoria Final:** Análise da saúde financeira com base no histórico de decisões do jogador e feedbacks personalizados de um "Mentor Financeiro"[cite: 4].
*   **Interface Responsiva com Dark Mode:** Suporte completo a temas claro/escuro e adaptação fluida para dispositivos móveis[cite: 1, 3].

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando tecnologias nativas da Web (**Vanilla Web Stack**) com foco em performance, acessibilidade e semântica pura, livre de frameworks ou dependências externas:

1.  **HTML5 Semântico:** Uso correto de tags estruturais (`<main>`, `<aside>`, `<section>`, `<article>`, `<header>`) otimizando a leitura de acessibilidade por leitores de tela[cite: 3].
2.  **CSS3 Avançado (Modern Layouts):**
    *   Arquitetura de estilização baseada em **Variáveis CSS (Custom Properties)** para controle dinâmico de temas (*Dark Mode*)[cite: 1].
    *   Layout responsivo estruturado com **CSS Grid** e **Flexbox**[cite: 1].
    *   Uso de funções matemáticas modernas como `clamp()` e `min()` para tipografia e espaçamento fluidos[cite: 1].
3.  **JavaScript Assíncrono e Orientado a Estados:**
    *   Controle centralizado através de uma árvore de estado único (`state`), garantindo previsibilidade e reatividade na interface baseada nas escolhas do usuário[cite: 4].
    *   Persistência de dados local com `localStorage` para retenção do tema padrão, nome e ranking global[cite: 2, 4].

---

## 🗂️ Estrutura do Código

```yaml
.
├── index.html      # Estrutura semântica do app shell, sidebar e stage principal[cite: 3]
├── styles.css      # Sistema de design, variáveis de cores, temas e responsividade[cite: 1]
└── script.js       # Estado da aplicação, dados das fases, feedbacks e lógica de ranking[cite: 4]

```

---

## 🚀 Como Executar o Projeto Localmente

Por se tratar de uma aplicação puramente estática Front-End, você não precisa instalar compiladores ou servidores pesados.

1. Clone o repositório para a sua máquina:

```bash
    git clone [https://github.com/seu-usuario/financas-inteligentes.git](https://github.com/seu-usuario/financas-inteligentes.git)
    ```
2.  Navegue até a pasta do projeto:
```bash
    cd financas-inteligentes
    ```
3.  Abra o arquivo `index.html` diretamente em qualquer navegador moderno ou utilize a extensão **Live Server** no VS Code para uma melhor experiência de desenvolvimento.

---

## 🧠 Metodologia de Negócio & Algoritmos Aplicados

### Lógica de Consumo da Reserva
O motor do jogo calcula inteligentemente as situações de imprevisto[cite: 4]. Na fase do celular quebrado (Fase 6), o script prioriza o uso dos fundos acumulados na reserva para mitigar o impacto negativo no fluxo de caixa primário:
```javascript
function useReserveForEmergency() {
    const emergencyCost = 250;
    const fromReserve = Math.min(state.reserve, emergencyCost);
    const remaining = emergencyCost - fromReserve;
    state.reserve -= fromReserve;
    state.balance -= remaining;
}

```

### Motor do Ranking Global (`localStorage`)

Para manter a competitividade sem a necessidade de um banco de dados externo, o sistema consolida os resultados locais, mescla com os perfis de IA base do sistema, ordena de forma decrescente e armazena os 5 maiores records:

```javascript
function updateTop5ForPlayer(finalScore) {
    const stored = loadRankingFromStorage();
    const currentEntry = { name: playerName || "Aluno", score: finalScore };
    const merged = [...stored, currentEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    saveRankingToStorage(merged);
    return merged;
}

```

---

## 📝 Licença

Este projeto é de código aberto e está disponível para fins educacionais. Sinta-se livre para clonar, sugerir melhorias via Pull Requests ou utilizá-lo em salas de aula.

---

Desvolvido por **Isaac Firmino]** 🚀

```

```
