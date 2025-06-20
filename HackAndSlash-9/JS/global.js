class Global {
    constructor() {
        this.monedas = 0; // Cantidad de monedas del jugador
        this.vidas = 3;   // Número de vidas del jugador
        this.actualizarHUD();
    }

    agregarMonedas(cantidad) {
        this.monedas += cantidad;
        this.actualizarHUD();
    }

    perderVida() {
        this.vidas -= 1;
        this.actualizarHUD();
    }

    actualizarHUD() {
        const vidasSpan = document.getElementById("vidas");
        const monedasSpan = document.getElementById("monedas");
        if (vidasSpan) vidasSpan.textContent = `❤️ x ${this.vidas}`;
        if (monedasSpan) monedasSpan.textContent = `💰 x ${this.monedas}`;
    }

    perderVida() {
        this.vidas--;
        this.actualizarHUD();

        if (this.vidas <= 0) {
        this.mostrarGameOver();}
    }

    mostrarGameOver() {
        const overlay = document.createElement("div");
        overlay.id = "gameOver";
        overlay.style.position = "absolute";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = "rgba(0,0,0,0.8)";
        overlay.style.display = "flex";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";
        overlay.style.color = "white";
        overlay.style.fontSize = "2em";
        overlay.style.zIndex = "9999";
        overlay.innerText = "Game Over";

        document.body.appendChild(overlay);


        if (window.cancelAnimationFrame && window.idAnimacion) {
            cancelAnimationFrame(window.idAnimacion);
        }
    }
}

export default new Global(); // ← el singleton
