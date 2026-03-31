class ShipStats {
    constructor(id, hp, initiative, computer, shield, dice, damage) {
        this.id = id;
        this.hp = hp;
        this.maxHp = hp;
        this.initiative = initiative;
        this.computer = computer;
        this.shield = shield;
        this.dice = dice; // Liczba strzałów
        this.damage = damage; // Obrażenia z jednego strzału
    }
}

function rollDie() { return Math.floor(Math.random() * 6) + 1; }

// Funkcja bitwy z opcjonalnym logowaniem
function simulateBattle(countA, statsA, countB, statsB, isLogging = false) {
    let fleetA = Array.from({ length: countA }, (_, i) => ({ ...statsA, name: `A#${i+1}` }));
    let fleetB = Array.from({ length: countB }, (_, i) => ({ ...statsB, name: `B#${i+1}` }));
    let log = [];

    while (fleetA.length > 0 && fleetB.length > 0) {
        let turnOrder = [];
        fleetA.forEach(s => turnOrder.push({ ship: s, side: 'A' }));
        fleetB.forEach(s => turnOrder.push({ ship: s, side: 'B' }));

        turnOrder.sort((a, b) => b.ship.initiative - a.ship.initiative);

        for (let unit of turnOrder) {
            if (unit.ship.hp <= 0) continue;

            let enemies = unit.side === 'A' ? fleetB : fleetA;
            if (enemies.length === 0) break;

            if (isLogging) log.push(`<div class="log-entry">Statki ${unit.side} (${unit.ship.name}) strzela:</div>`);

            // Pętla dla każdego działa (kości)
            for (let d = 0; d < unit.ship.dice; d++) {
                if (enemies.length === 0) break;

                let target = enemies[0];
                let roll = rollDie();
                let isHit = false;

                if (roll === 6) isHit = true;
                else if (roll === 1) isHit = false;
                else if ((roll + unit.ship.computer - target.shield) >= 6) isHit = true;

                if (isHit) {
                    target.hp -= unit.ship.damage;
                    if (isLogging) log.push(`<span class="log-hit">  - Kostka ${roll}: TRAFIENIE! (Cel: ${target.name}, HP: ${Math.max(0, target.hp)})</span><br>`);

                    if (target.hp <= 0) {
                        if (isLogging) log.push(`<span class="log-death">  [!] Statek ${target.name} został zniszczony!</span><br>`);
                        enemies.shift();
                        if (enemies.length > 0) target = enemies[0];
                    }
                } else {
                    if (isLogging) log.push(`<span class="log-miss">  - Kostka ${roll}: Pudło</span><br>`);
                }
            }
        }
    }
    return { winner: fleetA.length > 0 ? 'A' : 'B', log: log };
}

function getVal(id) { return parseInt(document.getElementById(id).value) || 0; }

function getInputs() {
    return {
        cA: getVal('a-count'),
        sA: new ShipStats('A', getVal('a-hp'), getVal('a-init'), getVal('a-comp'), getVal('a-shield'), getVal('a-dice'), getVal('a-dmg')),
        cB: getVal('b-count'),
        sB: new ShipStats('B', getVal('b-hp'), getVal('b-init'), getVal('b-comp'), getVal('b-shield'), getVal('b-dice'), getVal('b-dmg'))
    };
}

function runMonteCarlo() {
    const data = getInputs();
    const resultsDiv = document.getElementById("results");
    document.getElementById("battle-log").style.display = "none";
    resultsDiv.innerHTML = "Symulowanie...";

    setTimeout(() => {
        let winsA = 0;
        const sims = 10000;
        for (let i = 0; i < sims; i++) {
            if (simulateBattle(data.cA, data.sA, data.cB, data.sB).winner === 'A') winsA++;
        }
        let pA = (winsA / sims * 100).toFixed(1);
        resultsDiv.innerHTML = `<strong>Wynik (10k bitew):</strong> Flota A: ${pA}% | Flota B: ${(100 - pA).toFixed(1)}%`;
    }, 50);
}

function showExampleBattle() {
    const data = getInputs();
    const logDiv = document.getElementById("battle-log");
    const result = simulateBattle(data.cA, data.sA, data.cB, data.sB, true);

    logDiv.style.display = "block";
    logDiv.innerHTML = `<h3>Przebieg przykładowej bitwy:</h3>` + result.log.join("");
    logDiv.innerHTML += `<br><strong>ZWYCIĘZCA: FLOTA ${result.winner}</strong>`;
}