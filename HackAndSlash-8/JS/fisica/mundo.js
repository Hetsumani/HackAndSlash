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