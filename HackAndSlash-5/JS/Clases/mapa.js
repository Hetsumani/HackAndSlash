// Importar el singleton de MundoFisico
import MundoFisico from "../fisica/mundo.js";

export default class Mapa {
    constructor() {
        // Declarar variables para el mapa y el tileset aquí,
        // para que sean accesibles en todo el ámbito de window.onload.
        this.mapaData = null;
        this.tilesetImage = null;
        this.colisiones = []; // Inicializamos un array para las colisiones

        this.mundo = MundoFisico.mundo; // Acceder al mundo del singleton de MundoFisico
        this.motor = MundoFisico.motor; // Acceder al motor del singleton de MundoFisico


        // ────────────────── Carga de Assets e Inicio del Juego ──────────────────
        // La lógica del juego ahora vive dentro de la carga de assets.
        fetch('Assets/Mapas/Mapa1.json')
            .then(res => res.json())
            .then(data => {
                // console.log("Mapa cargado:", data);
                this.mapaData = data; // Guardamos los datos en nuestra variable
                this.tilesetImage = document.getElementById("tilesetVerde");
                                
                if (this.mapaData && this.mapaData.layers) {                    
                    this.colisiones = this.capaColision(this.mapaData.layers);
                    this.colisiones.forEach(colisionador => {                        
                        // Añadir cuerpos de colisión al mundo físico
                        const cuerpo = Matter.Bodies.rectangle(colisionador.x + colisionador.width / 2, // Centrar el cuerpo
                            colisionador.y + colisionador.height / 2, // Centrar el cuerpo
                            colisionador.width, colisionador.height, {
                                width: colisionador.width,
                                height: colisionador.height,
                                tipo: colisionador.type
                            });                        
                        Matter.Body.setStatic(cuerpo, true); // Hacer el cuerpo estático
                        Matter.World.add(this.mundo, cuerpo);
                    });
                }
            });
    }
    /**
     * Nueva función dedicada a dibujar el mapa.
     * La mantenemos separada para que la función draw() principal esté limpia.
     */
    dibujarMapa(context) {
        if (!this.mapaData || !this.tilesetImage) return; // No dibujar si los assets no están listos

        const tileWidth = this.mapaData.tilewidth;
        const tileHeight = this.mapaData.tileheight;
        const layer = this.mapaData.layers[0];
        const mapCols = layer.width;
        const tilesetCols = this.tilesetImage.width / tileWidth;
        const layers = this.mapaData.layers;

        layers.forEach(layer => {
            if (layer.type === "tilelayer") {
                // Dibujar cada tile del layer
                this.dibujarCapa(context, layer.data, mapCols, tilesetCols, tileWidth, tileHeight);
            }
        });

        // // Dibujar las colisiones para visualización y depuración
        // this.colisiones.forEach(c => {
        //     context.fillStyle = "rgba(255, 0, 0, 0.5)"; // Color rojo semitransparente
        //     context.fillRect(c.x, c.y, c.width, c.height);
        // });
    }

    dibujarCapa(context, tileData, mapColumns, tilesetColumns, tileWidth, tileHeight) {
        for (let indiceTile = 0; indiceTile < tileData.length; indiceTile++) {
            const tileIndexEnTileset = tileData[indiceTile] - 1; // ID de tile en el tileset (ajustado, porque 0 es vacío)
            if (tileIndexEnTileset < 0) continue; // Tile vacío, no dibujar

            // Coordenadas de origen en el tileset
            const origenTilesetX = (tileIndexEnTileset % tilesetColumns) * tileWidth;
            const origenTilesetY = Math.floor(tileIndexEnTileset / tilesetColumns) * tileHeight;

            // Coordenadas destino en el canvas
            const destinoCanvasX = (indiceTile % mapColumns) * tileWidth;
            const destinoCanvasY = Math.floor(indiceTile / mapColumns) * tileHeight;

            context.drawImage(
                this.tilesetImage,
                origenTilesetX, origenTilesetY, tileWidth, tileHeight, // Origen en tileset
                destinoCanvasX, destinoCanvasY, tileWidth, tileHeight // Destino en canvas
            );
        }
    }

    capaColision(layers) {
        // Usamos flatMap para iterar sobre las capas y aplanar el resultado.
        return layers.flatMap(layer => {
            // Nos aseguramos de que sea una capa de objetos y que tenga objetos.
            if (layer.name !== "Colisiones" || !layer.objects) {
                return []; // Devolvemos un array vacío si no cumple la condición.
            }

            // Filtramos los objetos que tienen la propiedad de colisión.
            return layer.objects
                .filter(objeto =>
                    // 'some' es ideal para verificar si al menos un elemento en un array cumple una condición.
                    objeto.properties && objeto.properties.some(prop => prop.name === "collision" && prop.value)                    
                )                
                // Mapeamos los objetos filtrados al formato deseado.
                .map(objeto => ({
                    x: objeto.x,
                    y: objeto.y,
                    width: objeto.width,
                    height: objeto.height,
                    type: objeto.type
                }));
        });
    }
}


