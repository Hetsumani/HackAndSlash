class Global {
    constructor() {
        this.monedas = 0; // Cantidad de monedas del jugador
        this.vidas = 3;   // Número de vidas del jugador
    }

    agregarMonedas(cantidad) {
        this.monedas += cantidad;
    }
}

export default new Global(); // ← el singleton