// Klasa bazowa statku
class ShipStats {
    constructor(hp, initiative, computer, shield, damage) {
        this.hp = hp;
        this.initiative = initiative;
        this.computer = computer;
        this.shield = shield;
        this.damage = damage;
    }
}

// Funkcja rzutu kością
function rollDie() {
    return Math.floor(Math.random() * 6) + 1;
}

// Funkcja symulująca bitwę wielu statków (Flota vs Flota)
function simulateBattle(countA, statsA, countB, statsB) {
    // Tworzenie konkretnych statków dla tej jednej bitwy
    let fleetA = Array.from({ length: countA }, () => ({ ...statsA }));
    let fleetB = Array.from({ length: countB }, () => ({ ...statsB }));

    // Walka trwa dopóki obie floty mają statki
    while (fleetA.length > 0 && fleetB.length > 0) {

        // Zbieramy wszystkie ocalałe statki i przypisujemy im stronę konfliktu
        let turnOrder = [];
        fleetA.forEach(s => turnOrder.push({ ship: s, side: 'A' }));
        fleetB.forEach(s => turnOrder.push({ ship: s, side: 'B' }));

        // Sortowanie statków malejąco po Inicjatywie (najszybsi strzelają pierwsi)
        turnOrder.sort((a, b) => b.ship.initiative - a.ship.initiative);

        // Wykonujemy ataki w ustalonej kolejności
        for (let unit of turnOrder) {
            // Jeśli statek zginął wcześniej w tej rundzie, nie może już strzelić
            if (unit.ship.hp <= 0) continue;

            let enemies = unit.side === 'A' ? fleetB : fleetA;
            if (enemies.length === 0) break; // Przeciwnik zniszczony całkowicie

            // Celujemy zawsze w pierwszy dostępny statek przeciwnika (najprostsza taktyka)
            let target = enemies[0];

            let roll = rollDie();
            let isHit = false;

            // Logika trafień
            if (roll === 6) {
                isHit = true;
            } else if (roll === 1) {
                isHit = false;
            } else {
                let hitResult = roll + unit.ship.computer - target.shield;
                if (hitResult >= 6) isHit = true;
            }

            // Zadawanie obrażeń
            if (isHit) {
                target.hp -= unit.ship.damage;
                if (target.hp <= 0) {
                    enemies.shift(); // Usuwa zniszczony statek z początku tablicy wroga
                }
            }
        }
    }

    // Zwracamy, kto przetrwał (A czy B)
    return fleetA.length > 0 ? 'A' : 'B';
}

// Pobieranie wartości z inputów na stronie
function getVal(id) {
    return parseInt(document.getElementById(id).value) || 0;
}

// Główna funkcja uruchamiająca silnik Game Changer
function runMonteCarlo() {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "Przeliczanie w toku...";

    // Ułamek sekundy przerwy, aby przeglądarka zdążyła pokazać napis "Przeliczanie..."
    setTimeout(() => {
        // Zbieranie danych Floty A
        const countA = getVal('a-count');
        const statsA = new ShipStats(getVal('a-hp'), getVal('a-init'), getVal('a-comp'), getVal('a-shield'), getVal('a-dmg'));

        // Zbieranie danych Floty B
        const countB = getVal('b-count');
        const statsB = new ShipStats(getVal('b-hp'), getVal('b-init'), getVal('b-comp'), getVal('b-shield'), getVal('b-dmg'));

        const simulations = 10000;
        let winsA = 0;
        let winsB = 0;

        // Główna pętla Monte Carlo
        for (let i = 0; i < simulations; i++) {
            let winner = simulateBattle(countA, statsA, countB, statsB);
            if (winner === 'A') winsA++;
            else winsB++;
        }

        const percentA = (winsA / simulations * 100).toFixed(1);
        const percentB = (winsB / simulations * 100).toFixed(1);

        resultsDiv.innerHTML = `
            <p>Rozegrano <strong>${simulations.toLocaleString()}</strong> symulacji.</p>
            <p style="color: #ff6b6b; font-size: 24px;">Flota A wygrała: <strong>${percentA}%</strong></p>
            <p style="color: #4cd137; font-size: 24px;">Flota B wygrała: <strong>${percentB}%</strong></p>
        `;
    }, 50);
}