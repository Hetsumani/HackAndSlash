// ─────────────────────────────────────────────────────────────────────────────
// main.js — Punto de entrada del juego
// ─────────────────────────────────────────────────────────────────────────────

// 1. Importaciones de módulos
import fisica from "./fisica/mundo.js"; // Importación del mundo físico
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

    const renderizador = Matter.Render.create({
        canvas: canvas,
        engine: fisica.motor,
        options: {
            width: gameWidth,
            height: gameHeight,
            wireframes: true, // Desactivar wireframes para ver el mapa
            background: 'rgba(0, 0, 0, 0)', // Fondo transparente
        }
    });

    // Matter.Render.run(renderizador); // Iniciar el renderizado de Matter.js    

    function update(dt) {
        fisica.update(dt); // Actualizar el mundo físico
        jugador.update(input.lastKey, dt);
    }

    function draw() {
        context.clearRect(0, 0, gameWidth, gameHeight); // Borrar frame anterior        
        
        // 1. Dibujar el fondo/mapa
        mapa.dibujarMapa(context);

        // 2. Dibujar entidades encima del mapa
        jugador.draw(context);

        fisica.draw(context); // Dibujar el mundo físico        
    }

    function gameLoop(time) {
        const deltaTime = (time - tiempoInicio);
        tiempoInicio = time;

        update(deltaTime);
        draw();

        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
};