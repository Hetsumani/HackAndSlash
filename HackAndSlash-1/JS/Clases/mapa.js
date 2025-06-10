export default class Mapa {

    constructor() {
        // CAMBIO 1: Declarar variables para el mapa y el tileset aquí,
        // para que sean accesibles en todo el ámbito de window.onload.
        this.mapaData = null;
        this.tilesetImage = null;

        // ────────────────── Carga de Assets e Inicio del Juego ──────────────────
        // CAMBIO 3: La lógica del juego ahora vive dentro de la carga de assets.
        fetch('Assets/Mapas/Mapa1.json')
            .then(res => res.json())
            .then(data => {
                // console.log("Mapa cargado:", data);
                this.mapaData = data; // Guardamos los datos en nuestra variable
                this.tilesetImage = document.getElementById("tilesetVerde");
            });
    }
    /**
     * CAMBIO 2: Nueva función dedicada a dibujar el mapa.
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
}


