// Klasa definiująca statki
class Ship {
    constructor(name, hp, initiative, computer, shield, damage) {
        this.name = name;
        this.hp = hp;
        this.initiative = initiative;
        this.computer = computer;
        this.shield = shield;
        this.damage = damage;
    }
}

// Funkcja symulująca rzut kością (1-6)
function rollDie() {
    return Math.floor(Math.random() * 6) + 1;
}

// Funkcja symulująca pojedynek dwóch statków
function simulateDuel(ship1, ship2) {
    let s1 = { ...ship1 };
    let s2 = { ...ship2 };

    let attacker = s1.initiative > s2.initiative ? s1 : s2;
    let defender = s1.initiative > s2.initiative ? s2 : s1;

    while (s1.hp > 0 && s2.hp > 0) {
        let roll = rollDie();
        let isHit = false;

        if (roll === 6) {
            isHit = true;
        } else if (roll === 1) {
            isHit = false;
        } else {
            let hitResult = roll + attacker.computer - defender.shield;
            if (hitResult >= 6) {
                isHit = true;
            }
        }

        if (isHit) {
            defender.hp -= attacker.damage;
        }

        if (defender.hp <= 0) break;

        let temp = attacker;
        attacker = defender;
        defender = temp;
    }

    return s1.hp > 0 ? s1.name : s2.name;
}

// Główna funkcja metody Monte Carlo
function runMonteCarlo() {
    // Pobieramy element ze strony, do którego wrzucimy wyniki
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "Obliczam...";

    const interceptorA = new Ship("Standardowy Myśliwiec", 1, 2, 0, 0, 1);
    const interceptorB = new Ship("Myśliwiec z Komputerem (+1)", 1, 2, 1, 0, 1);

    const simulations = 10000;
    let winsA = 0;
    let winsB = 0;

    for (let i = 0; i < simulations; i++) {
        let winner = simulateDuel(interceptorA, interceptorB);
        if (winner === interceptorA.name) {
            winsA++;
        } else {
            winsB++;
        }
    }

    // Obliczanie procentów
    const percentA = (winsA / simulations * 100).toFixed(2);
    const percentB = (winsB / simulations * 100).toFixed(2);

    // Wyświetlanie wyników na stronie
    resultsDiv.innerHTML = `
        <p>Przeprowadzono bitew: <strong>${simulations}</strong></p>
        <p style="color: #ff6b6b;">${interceptorA.name} wygrał: <strong>${percentA}%</strong></p>
        <p style="color: #4cd137;">${interceptorB.name} wygrał: <strong>${percentB}%</strong></p>
    `;
}