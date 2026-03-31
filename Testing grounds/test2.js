class ShipStats {
    constructor(hp, initiative, computer, shield, dice, damage) {
        this.hp = hp;
        this.initiative = initiative;
        this.computer = computer;
        this.shield = shield;
        this.dice = dice;
        this.damage = damage;
    }
}

function rollDie() { return Math.floor(Math.random() * 6) + 1; }

function simulateBattle(countA, statsA, countB, statsB, isLogging = false) {
    let fleetA = Array.from({ length: countA }, (_, i) => ({ ...statsA, name: `A#${i+1}`, side: 'A' }));
    let fleetB = Array.from({ length: countB }, (_, i) => ({ ...statsB, name: `B#${i+1}`, side: 'B' }));
    let log = [];

    while (fleetA.length > 0 && fleetB.length > 0) {
        let turnOrder = [...fleetA, ...fleetB];

        // SORTOWANIE Z REMISEM: B (Obrońca) ma priorytet przy tej samej inicjatywie
        turnOrder.sort((a, b) => {
            if (b.initiative !== a.initiative) {
                return b.initiative - a.initiative;
            }
            if (a.side === 'B') return -1; // B idzie wcześniej
            if (b.side === 'B') return 1;
            return 0;
        });

        for (let unit of turnOrder) {
            if (unit.hp <= 0) continue;
            let enemies = unit.side === 'A' ? fleetB : fleetA;
            if (enemies.length === 0) break;

            if (isLogging) log.push(`<span class="log-turn">${unit.name} strzela (${unit.dice}k):</span>`);

            for (let d = 0; d < unit.dice; d++) {
                if (enemies.length === 0) break;
                let target = enemies[0];
                let roll = rollDie();
                let isHit = false;

                if (roll === 6) isHit = true;
                else if (roll === 1) isHit = false;
                else if ((roll + unit.computer - target.shield) >= 6) isHit = true;

                if (isHit) {
                    target.hp -= unit.damage;
                    if (isLogging) log.push(`<span class="log-hit">&nbsp;&nbsp;k${roll} -> Trafienie! (Cel: ${target.name}, HP: ${Math.max(0, target.hp)})</span><br>`);
                    if (target.hp <= 0) {
                        if (isLogging) log.push(`<span class="log-death">&nbsp;&nbsp;[X] ${target.name} zniszczony!</span><br>`);
                        enemies.shift();
                        if (enemies.length > 0) target = enemies[0];
                    }
                } else {
                    if (isLogging) log.push(`<span class="log-miss">&nbsp;&nbsp;k${roll} -> Pudło</span><br>`);
                }
            }
        }
    }
    return { winner: fleetA.length > 0 ? 'A' : 'B', log: log };
}

function getVal(id) { return parseInt(document.getElementById(id).value) || 0; }

function executeAll() {
    const resultsDiv = document.getElementById("results");
    const logsArea = document.getElementById("logs-area");

    // Pobranie danych
    const cA = getVal('a-count'), cB = getVal('b-count');
    const sA = new ShipStats(getVal('a-hp'), getVal('a-init'), getVal('a-comp'), getVal('a-shield'), getVal('a-dice'), getVal('a-dmg'));
    const sB = new ShipStats(getVal('b-hp'), getVal('b-init'), getVal('b-comp'), getVal('b-shield'), getVal('b-dice'), getVal('b-dmg'));

    resultsDiv.innerHTML = "Trwa obliczanie 20 000 symulacji...";
    logsArea.style.display = "none";

    // setTimeout pozwala przeglądarce odświeżyć UI przed ciężkimi obliczeniami
    setTimeout(() => {
        const sims = 20000;
        let winsA = 0;

        for (let i = 0; i < sims; i++) {
            if (simulateBattle(cA, sA, cB, sB).winner === 'A') winsA++;
        }

        const pA = (winsA / sims * 100).toFixed(1);
        const pB = (100 - pA).toFixed(1);

        resultsDiv.innerHTML = `
            <span style="color:#ff4757">Flota A: ${pA}%</span> 
            | 
            <span style="color:#2ed573">Flota B: ${pB}%</span>
        `;

        // Generowanie 3 przykładowych logów
        for (let j = 1; j <= 3; j++) {
            const res = simulateBattle(cA, sA, cB, sB, true);
            const logCol = document.getElementById(`log-${j}`);
            logCol.innerHTML = `<div class="log-header">BITWA PRZYKŁADOWA #${j}</div>` + res.log.join("") + `<br><strong>Zwycięzca: ${res.winner}</strong>`;
        }

        logsArea.style.display = "grid";
    }, 50);
}