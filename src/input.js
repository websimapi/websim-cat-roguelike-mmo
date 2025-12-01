import { startMusic } from './assets.js';

export const Input = {
    keys: {},
    mouse: { x: 0, y: 0, leftDown: false, moved: false },
    active: true,

    init(canvas) {
        const startAudio = () => {
            startMusic();
            window.removeEventListener('keydown', startAudio);
            window.removeEventListener('mousemove', startAudio);
            window.removeEventListener('touchstart', startAudio);
        };
        window.addEventListener('keydown', startAudio);
        window.addEventListener('mousemove', startAudio);
        window.addEventListener('touchstart', startAudio);

        window.addEventListener('keydown', (e) => {
            if (!this.active) return;
            this.keys[e.code] = true;
            this.keys[e.key.toLowerCase()] = true;
            if (e.code === 'Space') e.preventDefault();
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.keys[e.key.toLowerCase()] = false;
        });

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            this.mouse.moved = true;
        });

        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.mouse.leftDown = true;
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.mouse.leftDown = false;
        });

        // Prevent context menu on right click
        canvas.addEventListener('contextmenu', e => e.preventDefault());
    },

    getMovementVector() {
        let x = 0;
        let y = 0;
        if (this.keys['KeyW'] || this.keys['ArrowUp']) y -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) y += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) x -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) x += 1;
        return { x, y };
    },

    isShooting() {
        return this.keys['Space'] || this.mouse.leftDown;
    }
};