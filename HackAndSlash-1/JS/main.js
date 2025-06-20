// ─────────────────────────────────────────────────────────────────────────────
// main.js — Punto de entrada del juego
// ─────────────────────────────────────────────────────────────────────────────

// 1. Importaciones de módulos
import Jugador from "./Clases/jugador.js";
import InputHandler from "./Clases/stateMachine/input.js";
import Mapa from "./Clases/mapa.js";

// 2. Esperar a que todo el DOM esté cargado.
window.onload = function () {

    // ────────────────── Configuración básica del canvas ──────────────────
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    const gameWidth = canvas.width;
    const gameHeight = canvas.height;

      

    // Reloj para delta-time
    let tiempoInicio = 0;

    // Creación de objetos principales del juego
    const jugador = new Jugador(gameWidth, gameHeight);
    const input = new InputHandler();
    const mapa = new Mapa();

    function update(dt) {
        jugador.update(input.lastKey, dt);
    }

    /**
     * CAMBIO 5: La función draw() ahora también llama a dibujarMapa().
     */
    function draw() {
        context.clearRect(0, 0, gameWidth, gameHeight); // Borrar frame anterior

        // 1. Dibujar el fondo/mapa
        mapa.dibujarMapa(context);

        // 2. Dibujar entidades encima del mapa
        jugador.draw(context);
    }

    function gameLoop() {
        const tiempoActual = Date.now();
        const deltaTime = (tiempoActual - tiempoInicio) / 1000;
        tiempoInicio = tiempoActual;

        update(deltaTime);
        draw();

        requestAnimationFrame(gameLoop);
    }


    requestAnimationFrame(gameLoop);

};