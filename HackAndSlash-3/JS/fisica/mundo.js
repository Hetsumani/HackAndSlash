class MundoFisico {
    constructor() {
        this.motor = Matter.Engine.create();
        this.mundo = this.motor.world;
        this.render = Matter.Render;        
    }

    update(dt) {
        Matter.Engine.update(this.motor, dt); // Matter.js espera tiempo en milisegundos
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
                context.fillStyle = 'rgba(0, 255, 0, 0.25)';
                context.fill();
                context.closePath();
            }
        });
    }
}

export default new MundoFisico();   // ← el singleton