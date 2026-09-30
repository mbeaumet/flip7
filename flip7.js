/* =====================================================
   FLIP 7 - CALCULATEUR
===================================================== */

let players = [];
let roundNumber = 1;
let history = [];


/* =====================================================
   CARTES
===================================================== */

const NUMBER_CARDS = [
    0, 1, 2, 3, 4, 5, 6,
    7, 8, 9, 10, 11, 12
];

const MODIFIER_CARDS = [
    "+2",
    "+4",
    "+6",
    "+8",
    "+10",
    "x2"
];

const ACTION_CARDS = [
    "Second Chance"
];


/* =====================================================
   ELEMENTS
===================================================== */

const setup =
    document.getElementById("setup");

const game =
    document.getElementById("game");

const playerName =
    document.getElementById("playerName");

const addPlayerBtn =
    document.getElementById("addPlayerBtn");

const playersSetup =
    document.getElementById("playersSetup");

const startGameBtn =
    document.getElementById("startGameBtn");

const playersArea =
    document.getElementById("playersArea");

const scoreBoard =
    document.getElementById("scoreBoard");

const roundNumberElement =
    document.getElementById("roundNumber");

const validateRoundBtn =
    document.getElementById("validateRoundBtn");

const historyElement =
    document.getElementById("history");

const undoBtn =
    document.getElementById("undoBtn");

const newGameBtn =
    document.getElementById("newGameBtn");

const winnerModal =
    document.getElementById("winnerModal");

const winnerText =
    document.getElementById("winnerText");

const closeWinnerBtn =
    document.getElementById("closeWinnerBtn");


/* =====================================================
   AJOUT JOUEUR
===================================================== */

function addPlayer() {

    const name = playerName.value.trim();

    if (!name) return;

    if (players.length >= 8) {
        alert("Maximum 8 joueurs.");
        return;
    }

    players.push({
        id: Date.now(),
        name: name,
        total: 0,
        cards: [],
        bust: false,
        flip7: false
    });

    playerName.value = "";

    renderSetup();
}


/* =====================================================
   AFFICHAGE SETUP
===================================================== */

function renderSetup() {

    playersSetup.innerHTML = "";

    // Compteur de joueurs
    const playerCount = document.getElementById("playerCount");

    if (playerCount) {
        playerCount.textContent = players.length;
    }

    // Texte "X joueurs"
    const participantLabel =
        document.getElementById("participantLabel");

    if (participantLabel) {

        if (players.length === 0) {
            participantLabel.textContent = "Aucun joueur";
        }
        else if (players.length === 1) {
            participantLabel.textContent = "1 joueur";
        }
        else {
            participantLabel.textContent =
                `${players.length} joueurs`;
        }
    }

    // Création des cartes joueurs
    players.forEach((player, index) => {

        const div = document.createElement("div");

        div.className = "setup-player";

        const colorNumber = (index % 8) + 1;

        div.innerHTML = `

            <div class="player-number player-color-${colorNumber}">
                ${index + 1}
            </div>

            <div class="player-display-name">
                ${escapeHtml(player.name)}
            </div>

            <button
                type="button"
                class="remove-player"
                onclick="removePlayer(${player.id})"
                title="Supprimer ${escapeHtml(player.name)}"
            >
                ×
            </button>

        `;

        playersSetup.appendChild(div);
    });

    // Minimum 2 joueurs pour commencer
    startGameBtn.disabled = players.length < 2;
}
/* =====================================================
   SUPPRIMER JOUEUR
===================================================== */

function removePlayer(id) {

    players =
        players.filter(player => player.id !== id);

    renderSetup();
}


/* =====================================================
   DEMARRER PARTIE
===================================================== */

function startGame() {

    if (players.length < 2) return;

    roundNumber = 1;
    history = [];

    players.forEach(player => {

        player.total = 0;
        player.cards = [];
        player.bust = false;
        player.flip7 = false;

    });

    setup.classList.add("hidden");
    game.classList.remove("hidden");

    renderGame();
}


/* =====================================================
   RENDU GENERAL
===================================================== */

function renderGame() {

    renderScoreBoard();
    renderPlayers();
    renderHistory();

    roundNumberElement.textContent =
        roundNumber;
}


/* =====================================================
   SCOREBOARD
===================================================== */

function renderScoreBoard() {

    scoreBoard.innerHTML = "";

    const sorted =
        [...players].sort(
            (a, b) => b.total - a.total
        );

    sorted.forEach((player, index) => {

        const div =
            document.createElement("div");

        div.className =
            "score-box" +
            (index === 0 ? " leader" : "");

        div.innerHTML = `
            <div class="score-name">
                #${index + 1} ${escapeHtml(player.name)}
            </div>

            <div class="score-value">
                ${player.total}
            </div>

            <small>points</small>
        `;

        scoreBoard.appendChild(div);
    });
}


/* =====================================================
   RENDU JOUEURS
===================================================== */

function renderPlayers() {

    playersArea.innerHTML = "";

    players.forEach(player => {

        const card =
            document.createElement("div");

        card.className = "player-card";

        const calculation =
            calculateScore(player);

        card.innerHTML = `
            <div class="player-header">

                <h2>
                    ${escapeHtml(player.name)}
                </h2>

                <div class="round-score">
                    ${calculation.score} pts
                </div>

            </div>

            <div class="cards-title">
                Cartes de la manche
            </div>

            <div
                class="cards-container"
                id="cards-${player.id}">
            </div>

            <div class="cards-title">
                Cartes numériques
            </div>

            <div class="card-buttons">

                ${NUMBER_CARDS.map(number => `
                    <button
                        class="card-button"
                        onclick="addCard(${player.id}, ${number})">
                        ${number}
                    </button>
                `).join("")}

            </div>

            <div class="cards-title">
                Modificateurs
            </div>

            <div class="special-buttons">

                ${MODIFIER_CARDS.map(card => {

                    const css =
                        card === "x2"
                            ? "multiply"
                            : "plus";

                    return `
                        <button
                            class="special-button ${css}"
                            onclick="addSpecialCard(
                                ${player.id},
                                '${card}'
                            )">
                            ${card}
                        </button>
                    `;

                }).join("")}

            </div>

            <div class="cards-title"
                 style="margin-top:15px">
                Carte spéciale
            </div>

            <div class="special-buttons">

                <button
                    class="special-button second"
                    onclick="addSpecialCard(
                        ${player.id},
                        'Second Chance'
                    )">
                    ♥ Second Chance
                </button>

            </div>

            ${renderStatus(player, calculation)}

        `;

        playersArea.appendChild(card);

        renderPlayerCards(player);
    });
}


/* =====================================================
   AJOUT CARTE NUMERIQUE
===================================================== */

function addCard(playerId, number) {

    const player =
        players.find(
            p => p.id === playerId
        );

    if (!player) return;

    if (player.bust) return;

    /*
       Vérification doublon
    */

    const alreadyHas =
        player.cards.some(
            card =>
                card.type === "number" &&
                card.value === number
        );

    if (alreadyHas) {

        /*
           Second Chance
        */

        const secondChance =
            player.cards.some(
                card =>
                    card.type === "action" &&
                    card.value === "Second Chance"
            );

        if (secondChance) {

            player.cards =
                player.cards.filter(
                    card =>
                        !(
                            card.type === "action" &&
                            card.value === "Second Chance"
                        )
                );

            alert(
                `${player.name} utilise sa Second Chance !`
            );

            renderGame();

            return;
        }

        /*
           BUST
        */

        player.cards.push({
            type: "number",
            value: number,
            duplicate: true
        });

        player.bust = true;

        renderGame();

        return;
    }

    /*
       Ajout carte normale
    */

    player.cards.push({
        type: "number",
        value: number
    });

    /*
       Vérification Flip 7
    */

    const uniqueNumbers =
        getUniqueNumbers(player);

    if (uniqueNumbers.length >= 7) {

        player.flip7 = true;

        alert(
            `🎉 ${player.name} réalise un FLIP 7 !`
        );
    }

    renderGame();
}


/* =====================================================
   AJOUT CARTES SPECIALES
===================================================== */

function addSpecialCard(playerId, value) {

    const player =
        players.find(
            p => p.id === playerId
        );

    if (!player || player.bust) return;


    /*
       Second Chance
    */

    if (value === "Second Chance") {

        const alreadyHas =
            player.cards.some(
                card =>
                    card.type === "action" &&
                    card.value === "Second Chance"
            );

        if (alreadyHas) {

            alert(
                "Ce joueur possède déjà une Second Chance."
            );

            return;
        }

        player.cards.push({
            type: "action",
            value: value
        });

        renderGame();

        return;
    }


    /*
       Modificateur
    */

    player.cards.push({
        type: "modifier",
        value: value
    });

    renderGame();
}


/* =====================================================
   RECUPERATION NUMEROS UNIQUES
===================================================== */

function getUniqueNumbers(player) {

    return [
        ...new Set(
            player.cards
                .filter(card =>
                    card.type === "number"
                )
                .map(card =>
                    card.value
                )
        )
    ];
}


/* =====================================================
   CALCUL SCORE
===================================================== */

function calculateScore(player) {

    /*
       Bust = 0
    */

    if (player.bust) {

        return {
            score: 0,
            numberTotal: 0,
            modifiers: 0,
            flip7Bonus: 0
        };
    }


    /*
       Total cartes numériques
    */

    const numbers =
        player.cards
            .filter(
                card =>
                    card.type === "number"
            )
            .map(
                card =>
                    Number(card.value)
            );

    const numberTotal =
        numbers.reduce(
            (sum, value) =>
                sum + value,
            0
        );


    /*
       x2
    */

    const hasX2 =
        player.cards.some(
            card =>
                card.type === "modifier" &&
                card.value === "x2"
        );

    let score =
        hasX2
            ? numberTotal * 2
            : numberTotal;


    /*
       Modificateurs +X
    */

    const modifiers =
        player.cards
            .filter(
                card =>
                    card.type === "modifier" &&
                    card.value !== "x2"
            )
            .reduce(
                (sum, card) =>
                    sum + Number(
                        card.value.replace("+", "")
                    ),
                0
            );

    score += modifiers;


    /*
       Flip 7
       Le bonus de 15 est ajouté
       au score final.
    */

    const flip7Bonus =
        player.flip7
            ? 15
            : 0;

    score += flip7Bonus;


    return {
        score,
        numberTotal,
        modifiers,
        flip7Bonus
    };
}


/* =====================================================
   AFFICHAGE CARTES
===================================================== */

function renderPlayerCards(player) {

    const container =
        document.getElementById(
            `cards-${player.id}`
        );

    if (!container) return;

    container.innerHTML = "";

    player.cards.forEach(
        (card, index) => {

            const div =
                document.createElement("div");

            let className =
                "card-item";

            if (card.type === "modifier") {
                className += " modifier";
            }

            if (card.type === "action") {
                className += " action";
            }

            if (card.duplicate) {
                className += " duplicate";
            }

            div.className =
                className;

            div.innerHTML = `
                ${card.value}

                <button
                    class="remove-card"
                    onclick="removeCard(
                        ${player.id},
                        ${index}
                    )">
                    ×
                </button>
            `;

            container.appendChild(div);
        }
    );
}


/* =====================================================
   SUPPRESSION CARTE
===================================================== */

function removeCard(playerId, index) {

    const player =
        players.find(
            p => p.id === playerId
        );

    if (!player) return;

    player.cards.splice(index, 1);

    /*
       Recalcul de l'état
    */

    player.bust = false;
    player.flip7 = false;

    const numbers =
        player.cards
            .filter(
                card =>
                    card.type === "number"
            )
            .map(
                card =>
                    card.value
            );

    const duplicates =
        numbers.some(
            (value, index) =>
                numbers.indexOf(value) !== index
        );

    if (duplicates) {
        player.bust = true;
    }

    if (getUniqueNumbers(player).length >= 7) {
        player.flip7 = true;
    }

    renderGame();
}


/* =====================================================
   STATUT
===================================================== */

function renderStatus(player, calculation) {

    if (player.bust) {

        return `
            <div class="player-status status-bust">
                💥 BUST — 0 point
            </div>
        `;
    }

    if (player.flip7) {

        return `
            <div class="player-status status-flip7">
                🎉 FLIP 7 — Bonus +15
            </div>
        `;
    }

    return `
        <div class="player-status status-normal">
            Score actuel : ${calculation.score} points
        </div>
    `;
}


/* =====================================================
   VALIDATION MANCHE
===================================================== */

function validateRound() {

    const roundData = [];

    players.forEach(player => {

        const calculation =
            calculateScore(player);

        roundData.push({
            playerId: player.id,
            score: calculation.score
        });

        player.total +=
            calculation.score;
    });


    history.push({
        round: roundNumber,
        scores: roundData
    });


    /*
       Réinitialisation manche
    */

    players.forEach(player => {

        player.cards = [];
        player.bust = false;
        player.flip7 = false;

    });


    roundNumber++;

    renderGame();

    checkWinner();
}


/* =====================================================
   VERIFICATION VICTOIRE
===================================================== */

function checkWinner() {

    const winners =
        players.filter(
            player =>
                player.total >= 200
        );

    if (winners.length === 0) {
        return;
    }

    const winner =
        [...winners].sort(
            (a, b) =>
                b.total - a.total
        )[0];

    winnerText.innerHTML = `
        <strong>
            ${escapeHtml(winner.name)}
        </strong>
        atteint
        <strong>
            ${winner.total}
        </strong>
        points !
    `;

    winnerModal.classList.remove("hidden");
}


/* =====================================================
   HISTORIQUE
===================================================== */

function renderHistory() {

    historyElement.innerHTML = "";

    if (history.length === 0) {

        historyElement.innerHTML =
            "<p>Aucune manche enregistrée.</p>";

        return;
    }


    const header =
        document.createElement("div");

    header.className =
        "history-row history-header";

    header.innerHTML =
        `<div>Manche</div>` +

        players.map(
            player =>
                `<div>
                    ${escapeHtml(player.name)}
                 </div>`
        ).join("");

    historyElement.appendChild(header);


    history.forEach(round => {

        const row =
            document.createElement("div");

        row.className =
            "history-row";

        let html =
            `<div>${round.round}</div>`;

        players.forEach(player => {

            const result =
                round.scores.find(
                    score =>
                        score.playerId === player.id
                );

            html += `
                <div>
                    ${result ? result.score : 0}
                </div>
            `;
        });

        row.innerHTML = html;

        historyElement.appendChild(row);
    });
}


/* =====================================================
   ANNULER MANCHE
===================================================== */

function undoLastRound() {

    if (history.length === 0) {
        return;
    }

    const lastRound =
        history.pop();

    lastRound.scores.forEach(result => {

        const player =
            players.find(
                p =>
                    p.id === result.playerId
            );

        if (player) {

            player.total -=
                result.score;
        }
    });

    roundNumber =
        Math.max(
            1,
            roundNumber - 1
        );

    renderGame();
}


/* =====================================================
   NOUVELLE PARTIE
===================================================== */

function newGame() {

    if (
        !confirm(
            "Voulez-vous vraiment commencer une nouvelle partie ?"
        )
    ) {
        return;
    }

    players = [];
    history = [];
    roundNumber = 1;

    winnerModal.classList.add("hidden");
    game.classList.add("hidden");
    setup.classList.remove("hidden");

    renderSetup();
}


/* =====================================================
   UTILITAIRE
===================================================== */

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* =====================================================
   EVENEMENTS
===================================================== */

addPlayerBtn.addEventListener(
    "click",
    addPlayer
);

playerName.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {
            addPlayer();
        }
    }
);

startGameBtn.addEventListener(
    "click",
    startGame
);

validateRoundBtn.addEventListener(
    "click",
    validateRound
);

undoBtn.addEventListener(
    "click",
    undoLastRound
);

newGameBtn.addEventListener(
    "click",
    newGame
);

closeWinnerBtn.addEventListener(
    "click",
    () => {
        winnerModal.classList.add("hidden");
    }
);


/* =====================================================
   INITIALISATION
===================================================== */

renderSetup();