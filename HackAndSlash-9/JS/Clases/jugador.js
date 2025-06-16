// ─────────────────────────────────────────────────────────────────────────────
// jugador.js
// Clase que encapsula TODA la lógica y el renderizado del personaje
// principal.  Gestiona estados (parado, agachado, caminar, saltar, caer),
// animación por spritesheet, movimiento horizontal, salto y gravedad.
// ─────────────────────────────────────────────────────────────────────────────

// Importamos cada clase-estado que compone la máquina de estados del jugador.
// Cada estado sabe:
//  • enter()       → qué hacer al activarse (p. ej. cambiar spritesheet)
//  • handleInput() → cómo reaccionar a teclado/cursor
//  • exit()        → (opcional) limpieza al abandonar el estado
import {
  ParadoIzq, ParadoDer,
  AgachadoDer, AgachadoIzq,
  CaminarDer, CaminarIzq,
  SaltarIzq, SaltarDer,
  CaerIzq, CaerDer,
  AtaqueDer, AtaqueIzq
} from "./stateMachine/state.js";

import MundoFisico from "../fisica/mundo.js"; // Importamos el singleton del mundo físico
import global from "../global.js"; // Importamos el singleton global

export default class Jugador {
  /**
   * @param {number} anchoJuego  Anchura lógica del canvas
   * @param {number} altojuego   Altura lógica del canvas
   */
  constructor(anchoJuego, altojuego) {
    // ───────────── Parámetros de entorno ─────────────
    this.anchoJuego = anchoJuego;  // Límite horizontal del mundo visible
    this.altojuego = altojuego;   // Límite vertical (= suelo)

    this.mundo = MundoFisico.mundo; // Acceso al mundo físico
    this.motor = MundoFisico.motor; // Acceso al motor físico

    // ───────────── Máquina de estados ────────────────
    // Creamos una instancia de cada estado y las guardamos en un array
    // para poder referirnos a ellas por índice.
    this.estados = [
      new ParadoIzq(this), new ParadoDer(this),
      new AgachadoIzq(this), new AgachadoDer(this),
      new CaminarIzq(this), new CaminarDer(this),
      new SaltarIzq(this), new SaltarDer(this),
      new CaerIzq(this), new CaerDer(this), 
      new AtaqueDer(this), new AtaqueIzq(this)
    ];
    this.estadoActual = this.estados[1];  // Arrancamos “ParadoDerecha”

    // ───────────── Datos del spritesheet ─────────────
    this.spriteSheet = document.getElementById("paradoDerecha"); // <img …>
    this.anchoSprite = 42;   // Anchura de un frame, en px
    this.altoSprite = 64;   // Altura  de un frame, en px
    this.columna = 0;    // Frame X actual en la hoja
    this.fila = 0;    // Frame Y actual en la hoja
    this.maxFrames = 3;    // Nº total de frames de la animación paradoDerecha
    this.FPS = 8;    // Velocidad de animación
    this.frameTimer = 0;    // Acumulador de tiempo para avanzar de frame
    this.ajusteTiempo = 1000 / this.FPS; // Duración (ms) de cada frame'
    this.caerEstilo = false;
    this.direccionCaida = 0;
    this.anchoColisionador = this.anchoSprite - 10; // Ancho del cuerpo de colisión


    // ───────────── Propiedades físicas ───────────────
    this.x = 100;                          // Posición X inicial
    this.y = 260;  // Posición Y inicial (sobre suelo)

    this.velocidad = 0;    // Velocidad horizontal
    this.maxVelocidad = 4;  // Límite horizontal px/seg
    this.maxVelocidadSalto = -6; // Empuje inicial del salto (negativo = arriba)
    this.velocidadSalto = 0;    // Velocidad vertical
    this.gravedad = 750;  // Aceleración hacia abajo px/s²
    this.saltando = false;// Flag de salto (lo usan los estados)

    // ------------- Inicialización de físcas -------------
    // Añadimos el jugador al mundo físico como un cuerpo estático
    this.cuerpo = Matter.Bodies.rectangle(
      this.x + this.anchoSprite / 2, // Centrado en X
      this.y + this.altoSprite / 2,   // Centrado en Y
      this.anchoColisionador,               // Ancho del cuerpo
      this.altoSprite,                // Alto del cuerpo
      {
        label: "jugador",
        inertia: Infinity,         // bloquea la rotación
        friction: 0.1,             // deslizamiento lateral
        frictionAir: 0.02,         // “peso” en el aire
        restitution: 0.02,           // sin rebote
        width: this.anchoColisionador, // Ancho del cuerpo
        height: this.altoSprite, // Alto del cuerpo
      }
    );
    Matter.Body.setStatic(this.cuerpo, false); // Hacerlo dinámico
    // Añadimos el cuerpo al mundo
    Matter.World.add(this.mundo, this.cuerpo);
  }

  /**
   * draw(ctx)
   * -------------------------------------------------------------------------
   * Renderiza el frame actual del sprite en la posición (x, y) del canvas.
   * @param {CanvasRenderingContext2D} context
   */
  draw(context) {
    context.drawImage(
      this.spriteSheet,
      this.columna * this.anchoSprite, // Origen X dentro del sheet
      this.fila * this.altoSprite,  // Origen Y dentro del sheet
      this.anchoSprite,                // Size del recorte
      this.altoSprite,
      this.x,                          // Destino en pantalla
      this.y,
      this.anchoSprite,                // Escalamos 1:1
      this.altoSprite
    );
  }

  /**
   * update(input, dt)
   * -------------------------------------------------------------------------
   * Lógica por fotograma: animación, cambio de estado, movimiento y física.
   * @param {string}  input Última tecla registrada por el InputHandler
   * @param {number}  dt    Δt en segundos desde el frame anterior
   */
  update(input, dt) {

    if (this.estadoActual.update) {
      this.estadoActual.update(dt); // Actualizar lógica del estado
    }
    // ───── 1. Animación del sprite ─────
    if (this.frameTimer > this.ajusteTiempo) {
      // Avanzar al siguiente frame (cíclico)
      this.columna = (this.columna < this.maxFrames - 1) ? this.columna + 1 : 0;
      this.frameTimer = 0;             // Reiniciar temporizador
    } else {
      this.frameTimer += dt;    // Acumular tiempo en ms
    }

    this.estadoActual.handleInput(input);    

    this.x = Math.round(this.cuerpo.position.x - this.anchoSprite / 2); // Centrado en X
    this.y = this.cuerpo.position.y - this.altoSprite / 2;   // Centrado en Y

    this.detectarColision();
  }

  /**
   * setState(estado)
   * -------------------------------------------------------------------------
   * Cambia el estado actual de la máquina de estados.
   * @param {number} estado Índice del nuevo estado en this.estados[]
   */
  setState(estado) {
    this.columna = 0;            // Reiniciar frame de animación

    // Llamar al exit() del estado anterior si existe
    if (this.estadoActual.exit) this.estadoActual.exit();

    // Activar nuevo estado + enter()
    this.estadoActual = this.estados[estado];
    this.estadoActual.enter();

    this.ajusteTiempo = 1000 / this.FPS;
  }

  /**
   * enSuelo()
   * -------------------------------------------------------------------------
   * Comprueba si el personaje está tocando el suelo.
   * @returns {boolean}
   */
  enSuelo() {
    let chocado = false;
    this.mundo.bodies.forEach(element => {
      if (element.label !== "jugador" && element.tipo === "piso") {
        let choquesitos = Matter.Collision.collides(this.cuerpo, element);
        if (choquesitos)
          chocado = choquesitos.collided;
      }
    });
    return chocado;
  }

  detectarColision() {
    this.mundo.bodies.forEach(element => {
      if (element.label !== "jugador" && element.tipo === "moneda") {
        let colisionColeccionable = Matter.Collision.collides(this.cuerpo, element);
        let moneda = element.entidad; // Referencia a la moneda
        if (colisionColeccionable) { // Si hay colisión con una moneda
          global.agregarMonedas(moneda.valor); // Agregar valor de la moneda
          moneda.remover();
        }
      }
    });
  }
}

