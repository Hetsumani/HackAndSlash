import mundoFisico from "../fisica/mundo.js";

export default class Fantasma {
    constructor(x = 500, y = 265) {
        // ───────────── Parámetros de entorno ─────────────
        this.anchoJuego = 640;  // Límite horizontal del mundo visible
        this.altoJuego = 360;   // Límite vertical (= suelo)

        // ───────────── Datos del spritesheet ─────────────
        this.spriteSheet = document.getElementById("fantasmaIdle"); // <img …>
        this.anchoSprite = 45;   // Anchura de un frame, en px
        this.altoSprite = 60;   // Altura  de un frame, en px
        this.columna = 0;    // Frame X actual en la hoja
        this.fila = 0;    // Frame Y actual en la hoja
        this.maxFrames = 6;    // Nº total de frames de la animación idle
        this.FPS = 8;    // Velocidad de animación
        this.frameTimer = 0;    // Acumulador de tiempo para avanzar de frame
        this.ajusteTiempo = 1000 / this.FPS; // Duración (ms) de cada frame

        // ───────────── Propiedades físicas ───────────────
        this.x = x;
        this.y = y;

        this.mundo = mundoFisico.mundo; // Acceso al mundo físico
        this.motor = mundoFisico.motor; // Acceso al motor físico

        this.cuerpo = Matter.Bodies.rectangle(
            this.x + this.anchoSprite / 2, // Centro X del cuerpo
            this.y + this.altoSprite / 2,   // Centro Y del cuerpo
            this.anchoSprite,           // Ancho del cuerpo de colisión
            this.altoSprite,            // Altura del cuerpo de colisión
            {
                label: "fantasma",           // Etiqueta para depuración
                inertia: Infinity,         // bloquea la rotación
                friction: 0.1,             // deslizamiento lateral
                frictionAir: 0.02,         // “peso” en el aire
                restitution: 0.02,           // sin rebote  
                width: this.anchoSprite, // Ancho del cuerpo
                height: this.altoSprite, // Altura del cuerpo              
            }
        );
        Matter.Body.setStatic(this.cuerpo, true); // Asegurarnos de que no es estático
        Matter.World.add(this.mundo, this.cuerpo); // Añadir al mundo físico
        this.cuerpo.entidad = this; // Por si luego necesitas saber qué fantasma tocó algo

        this.tiempo = 0;
        this.origenX = this.cuerpo.position.x;
        this.origenY = this.cuerpo.position.y; // Guardar la posición original
    }

    update(dt) {
        // Actualizar el temporizador de frames
        this.frameTimer += dt;

        // Cambiar de frame si ha pasado el tiempo suficiente
        if (this.frameTimer > this.ajusteTiempo) {
            this.columna = (this.columna + 1) % this.maxFrames; // Ciclar entre frames
            this.frameTimer = 0; // Reiniciar el temporizador
        }

        // 1. Tiempo acumulado (más estable que llamar a performance.now() cada vez)
        this.tiempo += dt; // Asegúrate de inicializar this.tiempo = 0 en el constructor

        // 2. Parámetros del vaivén
        const amplitud = 2;      // píxeles
        const velocidad = .25;     // grados por segundo

        // 3. Posición X basada en seno
        const nuevoX = this.origenX +
            Math.sin(this.tiempo * (velocidad * Math.PI / 180)) * amplitud;

        const nuevoY = this.origenY + Math.cos(this.tiempo * (velocidad * Math.PI / 180)) * amplitud;

        // 4. Aplicar posición al body (mantiene la Y)
        Matter.Body.setPosition(this.cuerpo, {
            x: nuevoX,
            y: nuevoY
        });

        // 5. Sincronizar sprite con body
        this.x = Math.round(nuevoX - this.anchoSprite / 2);
        this.y = Math.round(nuevoY - this.altoSprite / 2);
    }

    draw(context) {
        // Dibujar el fantasma en su posición actual
        context.drawImage(
            this.spriteSheet,
            this.columna * this.anchoSprite, // X del frame actual
            this.fila * this.altoSprite,     // Y del frame actual
            this.anchoSprite,                // Anchura del frame
            this.altoSprite,                 // Altura del frame
            this.x,                          // Posición X en el canvas
            this.y,                          // Posición Y en el canvas
            this.anchoSprite,                // Anchura a dibujar
            this.altoSprite                  // Altura a dibujar
        );
    }
}