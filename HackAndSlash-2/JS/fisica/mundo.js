class MundoFisico {
    constructor() {
        this.motor = Matter.Engine.create();
        this.mundo = this.motor.world;
    }

    update(dt) {
        Matter.Engine.update(this.motor, dt * 1000); // Matter.js espera tiempo en milisegundos
    }
}

export default new MundoFisico();   // ← el singleton