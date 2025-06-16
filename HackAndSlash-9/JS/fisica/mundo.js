class MundoFisico {
    constructor() {
        this.motor = Matter.Engine.create();
        this.mundo = this.motor.world;
        // module aliases
        this.Render = Matter.Render;
        this.Runner = Matter.Runner;
        this.Bodies = Matter.Bodies;
        this.Composite = Matter.Composite;

        this.render = this.Render.create({
            element: document.getElementById('canvas'), // Elemento del DOM donde se renderiza
            engine: this.motor, // Motor de física
            options: {
                width: 640, // Ancho del canvas
                height: 360, // Alto del canvas
                wireframes: false, // Desactivar wireframes para ver el mapa
                background: 'rgba(0, 0, 0, 0)' // Fondo transparente
            }
        });

        this.runner = this.Runner.create(); // Crea un runner para el motor de física

        this.Runner.run(this.runner, this.motor); // Inicia el motor de física

        Matter.Events.on(this.motor, "collisionStart", (evt) => {            
            evt.pairs.forEach(p => {
                const a = p.bodyA;
                const b = p.bodyB;
                
                // Lógica para el par (a, b)
                if (a.label === "hitbox_espada" && b.entidad?.tipo === "enemigo") {
                    console.log("Colisión con hitbox_espada y enemigo B");
                    // Nos aseguramos de que el método exista antes de llamarlo
                    if (typeof b.entidad.recibirDanio === 'function') {
                        b.entidad.recibirDanio(1);
                    }
                }
                // Lógica para el par (b, a), por si el orden es inverso
                if (b.label === "hitbox_espada" && a.entidad?.tipo === "enemigo") {
                    console.log("Colisión con hitbox_espada y enemigo A", a);
                    if (typeof a.entidad.recibirDanio === 'function') {
                        a.entidad.recibirDanio(1);
                    }
                }
            });
        });
    }

    draw(context) {
        // Dibujamos los cuerpos del mundo físico
        // Para depurar
        const bodies = Matter.Composite.allBodies(this.mundo);
        bodies.forEach(body => {
            if (body.render.visible) {
                context.beginPath();
                context.rect(body.position.x - body.width / 2,
                    body.position.y - body.height / 2,
                    body.bounds.max.x - body.bounds.min.x,
                    body.bounds.max.y - body.bounds.min.y);
                context.fillStyle = 'rgba(0, 255, 0, 0.6)';
                context.fill();
                context.closePath();
            }
        });
    }

}



export default new MundoFisico();   // ← el singleton