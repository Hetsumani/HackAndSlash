import MundoFisico from "../fisica/mundo.js";

export default class Moneda {
    constructor(coleccionable) {
        this.mundo = MundoFisico.mundo; // Acceso al mundo físico
        this.motor = MundoFisico.motor; // Acceso al motor físico
        this.cuerpo = Matter.Bodies.rectangle(coleccionable.x + coleccionable.width / 2,
            coleccionable.y + coleccionable.height / 2,
            coleccionable.width, coleccionable.height, {
            width: coleccionable.width,
            height: coleccionable.height,
            tipo: coleccionable.type,
            isSensor: true // Hacemos que los coleccionables sean sensores
        });
        
        Matter.Body.setStatic(this.cuerpo, true);
        Matter.World.add(this.mundo, this.cuerpo);

        this.x = coleccionable.x;
        this.y = coleccionable.y;
        this.width = coleccionable.width;
        this.height = coleccionable.height;

        this.cuerpo.entidad = this; // Referencia a la entidad para colisiones

        this.activa = true; // Flag para activar/desactivar la moneda
        this.valor = 1; // Valor de la moneda
    }

    remover() {
        Matter.World.remove(this.mundo, this.cuerpo);
        this.activa = false; // Desactivar la moneda
    }
}