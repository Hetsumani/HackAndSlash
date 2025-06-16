// Importar el singleton de MundoFisico
import MundoFisico from "../fisica/mundo.js";
import moneda from "./moneda.js";
import Fantasma from "./fantasma.js";

export default class Mapa {
    constructor() {
        this.mapaData = null;
        // Usaremos un array para guardar la info de TODOS los tilesets.
        this.tilesets = [];
        this.colisiones = [];
        this.coleccionables = [];
        this.enemigosCapa = [];

        this.mundo = MundoFisico.mundo;
        this.motor = MundoFisico.motor;

        this.monedas = []; // Array para guardar las monedas recogidas
        this.enemigos = []; // Array para guardar los enemigos

        fetch('Assets/Mapas/Mapa1.json')
            .then(res => res.json())
            .then(data => {
                this.mapaData = data;

                // Cargar la información de cada tileset definido en el JSON.
                this.mapaData.tilesets.forEach(tilesetInfo => {
                    let idHtml = '';
                    // Mapeamos el nombre del tileset en Tiled con el ID del <img> en el HTML.
                    if (tilesetInfo.name === "Green") { // Cambia "plantilla verde" por el nombre real en Tiled
                        idHtml = 'tilesetVerde';
                    } else if (tilesetInfo.name === "Exterior Casa") {
                        idHtml = 'tilesetCasaExterior';
                    }

                    if (idHtml) {
                        const imagen = document.getElementById(idHtml);
                        this.tilesets.push({
                            firstgid: tilesetInfo.firstgid,
                            image: imagen,
                            // Calculamos cuántas columnas de tiles tiene esta imagen
                            tilesetCols: imagen.width / this.mapaData.tilewidth
                        });
                    }
                });

                // Ordenar los tilesets por firstgid de MAYOR a MENOR.
                // Esto es crucial para que la función de búsqueda funcione correctamente.
                this.tilesets.sort((a, b) => b.firstgid - a.firstgid);

                // La lógica de colisiones no necesita cambios
                if (this.mapaData && this.mapaData.layers) {
                    // Extraer las capas de colisión, coleccionables y enemigos.
                    this.colisiones = this.capaColision(this.mapaData.layers);
                    this.coleccionables = this.capaColeccionables(this.mapaData.layers);
                    this.enemigosCapa = this.capaEnemigos(this.mapaData.layers);
                    
                    // Añadir los cuerpos de colisión al mundo físico.
                    this.colisiones.forEach(colisionador => {
                        const cuerpo = Matter.Bodies.rectangle(colisionador.x + colisionador.width / 2,
                            colisionador.y + colisionador.height / 2,
                            colisionador.width, colisionador.height, {
                            width: colisionador.width,
                            height: colisionador.height,
                            tipo: colisionador.type
                        });
                        Matter.Body.setStatic(cuerpo, true);
                        Matter.World.add(this.mundo, cuerpo);
                    });
                    // crear Monedas y otros coleccionables
                    // Estos coleccionables se crean como instancias de sus repsectivas clases
                    // Lo que guardamos son sus cuerpos físicos.
                    this.coleccionables.forEach(coleccionable => {                        
                        if (coleccionable.type === "moneda") {
                            let nuevaMoneda = new moneda(coleccionable);
                            this.monedas.push(nuevaMoneda);
                        }
                    });

                    // Añadir los enemigos al mundo físico.
                    this.enemigosCapa.forEach(enemigo => {
                        if (enemigo.type === "fantasma") {
                            let fantasma = new Fantasma(enemigo.x, enemigo.y);
                            this.enemigos.push(fantasma);                       
                        }
                    });
                }
            });
    }

    // Encuentra el tileset correcto para un GID.
    /**
     * Busca en el array ordenado el primer tileset cuyo firstgid sea menor o igual al gid del tile.
     * @param {number} gid El ID Global del tile que queremos dibujar.
     * @returns {object} El objeto de tileset correspondiente (o undefined si no se encuentra).
     */
    findTilesetForGid(gid) {
        return this.tilesets.find(ts => gid >= ts.firstgid);
    }

    dibujarMapa(context) {
        // Asegurarse de que el mapa y los tilesets están listos.
        if (!this.mapaData || this.tilesets.length === 0) return;

        this.mapaData.layers.forEach(layer => {
            if (layer.type === "tilelayer") {
                // Pasamos la capa completa a dibujarCapa.
                this.dibujarCapa(context, layer);
            } else if (layer.type === "objectgroup" && layer.name === "coleccionables") {
                // Dibujar los coleccionables directamente.
                this.dibujarColeccionables(context);
            } else if (layer.type === "objectgroup" && layer.name === "enemigos") {
                // Dibujar los enemigos directamente.
                this.dibujarEnemigos(context);
            }
        });
    }

    update(dt) {
        this.enemigos.forEach(enemigo => {
            enemigo.update(dt);
        });
    }

    dibujarEnemigos(context) {
        this.enemigos.forEach(enemigo => {
            if (!enemigo.activo) return; // Si el enemigo no está activo, no dibujarlo.
            enemigo.draw(context);
        });
    }

    dibujarColeccionables(context) {
        let iconos = document.getElementById('iconoSet');
        const monedaIcon = document.getElementById('moneda');

        this.monedas.forEach(moneda => {
            if(!moneda.activa) return; // Si la moneda no está activa, no dibujarla.
            let { x, y, width, height } = moneda;
            context.drawImage(
                monedaIcon, // Usamos la imagen de la moneda
                0,          // Origen X en el spritesheet (0,0 para la moneda)
                0,          // Origen Y en el spritesheet
                width,      // Ancho del tile
                height,     // Alto del tile
                x,          // Coordenada X de destino en el canvas
                y,          // Coordenada Y de destino en el canvas
                width,      // Ancho de la imagen dibujada en el canvas
                height      // Alto de la imagen dibujada en el canvas
            );
        });        
    }

    dibujarCapa(context, layer) {
        const tileData = layer.data;
        const mapColumns = layer.width;
        const tileWidth = this.mapaData.tilewidth;
        const tileHeight = this.mapaData.tileheight;

        for (let indiceTile = 0; indiceTile < tileData.length; indiceTile++) {
            const gid = tileData[indiceTile]; // ID Global del tile
            if (gid === 0) continue; // Tile vacío, no dibujar

            // Encontrar el tileset correcto para este GID.
            const tileset = this.findTilesetForGid(gid);
            if (!tileset) continue; // Si por alguna razón no se encuentra, no dibujar.

            // ID del tile DENTRO de su propio tileset (0, 1, 2, ...)
            const tileIndexEnTileset = gid - tileset.firstgid;

            // Coordenadas de origen en la IMAGEN DEL TILESET CORRECTO
            const origenTilesetX = (tileIndexEnTileset % tileset.tilesetCols) * tileWidth;
            const origenTilesetY = Math.floor(tileIndexEnTileset / tileset.tilesetCols) * tileHeight;

            // Coordenadas destino en el canvas (esto no cambia)
            const destinoCanvasX = (indiceTile % mapColumns) * tileWidth;
            const destinoCanvasY = Math.floor(indiceTile / mapColumns) * tileHeight;

            context.drawImage(
                tileset.image, // <--- Usamos la imagen del tileset encontrado
                origenTilesetX, origenTilesetY, tileWidth, tileHeight,
                destinoCanvasX, destinoCanvasY, tileWidth, tileHeight
            );
        }
    }

    // La función capaColision no requiere cambios.
    capaColision(layers) {
        return layers.flatMap(layer => {
            if (layer.name !== "Colisiones" || !layer.objects) {
                return [];
            }
            return layer.objects
                .filter(objeto =>
                    objeto.properties && objeto.properties.some(prop => prop.name === "collision" && prop.value)
                )
                .map(objeto => ({
                    x: objeto.x,
                    y: objeto.y,
                    width: objeto.width,
                    height: objeto.height,
                    type: objeto.type
                }));
        });
    }

    // La función capaColision no requiere cambios.
    capaColeccionables(layers) {
        const anchoMoneda = 10;
        const altoMoneda = 12;
        return layers.flatMap(layer => {
            if (layer.name !== "coleccionables" || !layer.objects) {
                return [];
            }
            return layer.objects
                .filter(objeto =>
                    objeto.properties && objeto.properties.some(prop => prop.name === "coleccionable" && prop.value)
                )
                .map(objeto => {
                    let collectibleWidth = objeto.width;
                    let collectibleHeight = objeto.height;

                    if (objeto.type === "moneda") {
                        collectibleWidth = anchoMoneda;
                        collectibleHeight = altoMoneda;
                    }
                    return {
                        x: objeto.x,
                        y: objeto.y,
                        width: collectibleWidth,
                        height: collectibleHeight,
                        type: objeto.type
                    };
                });
        });
    }

    capaEnemigos(layers) {
        return layers.flatMap(layer => {
            if (layer.name !== "enemigos" || !layer.objects) {
                return [];
            }
            return layer.objects
                .filter(objeto =>
                    objeto.properties && objeto.properties.some(prop => prop.name === "enemigo" && prop.value)
                )
                .map(objeto => ({
                    x: objeto.x,
                    y: objeto.y,                    
                    type: objeto.type
                }));
        });
    }
}