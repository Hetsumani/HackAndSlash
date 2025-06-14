export default class InputHandler {
    constructor() {
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
        }

        window.addEventListener('keydown', (event) => {
            if (this.keys.hasOwnProperty(event.key)) {
                this.keys[event.key] = true;
            }
        });
        window.addEventListener('keyup', (event) => {
            if (this.keys.hasOwnProperty(event.key)) {
                this.keys[event.key] = false;
            }
        });
    }
}