// ─────────────────────────────────────────────────────────────────────────────
// main.js — Punto de entrada del juego
// ─────────────────────────────────────────────────────────────────────────────

// 1. Importaciones de módulos
import mundoFisico from "./fisica/mundo.js"; // Importación del mundo físico
import Jugador from "./Clases/jugador.js";
import InputHandler from "./Clases/stateMachine/input.js";
import Mapa from "./Clases/mapa.js";
import mundo from "./fisica/mundo.js";


// 2. Esperar a que todo el DOM esté cargado.
window.onload = function () {


    // ────────────────── Configuración básica del canvas ──────────────────
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    const gameWidth = canvas.width;
    const gameHeight = canvas.height;

    console.log("width:", gameWidth, "height:", gameHeight);
    // Reloj para delta-time
    let tiempoInicio = 0;

    // Creación de objetos principales del juego
    const mapa = new Mapa();
    let jugador = null; // Inicializado después de cargar el mapa

    jugador = new Jugador(gameWidth, gameHeight);

    const input = new InputHandler();

    function update(dt) {        
        jugador.update(input.keys, dt);
    }

    function draw() {
        context.clearRect(0, 0, gameWidth, gameHeight); // Borrar frame anterior        

        // 1. Dibujar el fondo/mapa
        mapa.dibujarMapa(context);

        // 2. Dibujar entidades encima del mapa
        jugador.draw(context); 
        
        // mundoFisico.draw(context); // Dibujar el mundo físico para depuración
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