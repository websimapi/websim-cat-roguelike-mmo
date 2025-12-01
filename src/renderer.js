import { CONFIG, MAP_DATA } from './config.js';
import { ASSETS } from './assets.js';
import { drawCharacter } from './character-renderer.js';
import { drawWall, drawGateOverlay } from './wall-renderer.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx.imageSmoothingEnabled = false;
    }

    // Helper to convert grid coords to screen pixels
    gridToScreen(gx, gy, camX, camY) {
        const centerScreenX = this.canvas.width / 2;
        const centerScreenY = this.canvas.height / 2;
        const tileSize = CONFIG.TILE_SIZE * CONFIG.SCALE;

        const screenX = centerScreenX + (gx - camX) * tileSize;
        const screenY = centerScreenY + (gy - camY) * tileSize;
        
        return { x: screenX, y: screenY, size: tileSize };
    }

    render(gameState, localPlayerId) {
        const ctx = this.ctx;
        const { width, height } = this.canvas;
        
        // Clear
        ctx.clearRect(0, 0, width, height);

        if (!ASSETS.loaded) return;

        // Camera follows local player
        let camX = CONFIG.GRID_W / 2;
        let camY = CONFIG.GRID_H / 2;
        
        if (gameState.players[localPlayerId]) {
            const p = gameState.players[localPlayerId];
            camX = p.x;
            camY = p.y;
        }

        const tileSize = CONFIG.TILE_SIZE * CONFIG.SCALE;
        const gateX = 11; // 11th grid tile (Center of 23)

        // Bucket Entities by Row for Depth Sorting
        const entitiesByRow = Array.from({ length: CONFIG.GRID_H }, () => []);

        // Helper to add entity to row bucket
        const addToBucket = (type, obj) => {
            const r = Math.floor(obj.y);
            if (r >= 0 && r < CONFIG.GRID_H) {
                entitiesByRow[r].push({ type, obj });
            }
        };

        // Add NPCs, Players, Projectiles
        gameState.npcs.forEach(npc => addToBucket('npc', npc));
        Object.values(gameState.players).forEach(p => addToBucket('player', p));
        gameState.projectiles.forEach(p => addToBucket('projectile', p));

        // 1. Draw ALL Floors First (Background Layer)
        // This ensures floor exists under walls as requested
        for (let y = 0; y < CONFIG.GRID_H; y++) {
            for (let x = 0; x < CONFIG.GRID_W; x++) {
                // Skip floor at Top Exit to show Void
                if (x === gateX && y === 0) continue;

                const pos = this.gridToScreen(x, y, camX, camY);
                if (pos.x < -tileSize || pos.x > width || pos.y < -tileSize || pos.y > height) continue;
                
                // Draw grass texture with higher detail: repeat 16 times per grid (4x4 sub-tiles)
                const subSize = tileSize / 4;
                for (let oy = 0; oy < 4; oy++) {
                    for (let ox = 0; ox < 4; ox++) {
                        this.ctx.drawImage(
                            ASSETS.floor,
                            pos.x + ox * subSize,
                            pos.y + oy * subSize,
                            subSize,
                            subSize
                        );
                    }
                }
            }
        }

        // 2. Draw Walls, Props, and Entities (Sorted by Row for correct occlusion)
        for (let y = 0; y < CONFIG.GRID_H; y++) {
            // A. Draw Walls for this row
            for (let x = 0; x < CONFIG.GRID_W; x++) {
                if (MAP_DATA[y][x] === 1) {
                    drawWall(this, x, y, camX, camY);
                }
            }

            // B. Draw Shop (Base at row 3)
            if (y === 3) {
                const shopPos = this.gridToScreen(3, 2, camX, camY);
                ctx.drawImage(ASSETS.shop, shopPos.x, shopPos.y, tileSize * 3, tileSize * 2);
            }

            // C. Draw Entities for this row (Sorted by exact Y)
            entitiesByRow[y].sort((a, b) => a.obj.y - b.obj.y);
            
            entitiesByRow[y].forEach(item => {
                if (item.type === 'projectile') {
                    this.drawProjectile(ctx, item.obj, camX, camY, tileSize);
                } else {
                    const pos = this.gridToScreen(item.obj.x - 0.5, item.obj.y - 0.5, camX, camY);
                    drawCharacter(ctx, item.obj, pos.x, pos.y, tileSize, item.type === 'npc');
                }
            });

            // D. Gate Overlay (Masking)
            // Redraw gate walls over entities to ensure characters appear "inside" the gate structure
            drawGateOverlay(this, y, camX, camY);
        }
    }

    drawProjectile(ctx, proj, camX, camY, tileSize) {
        const pos = this.gridToScreen(proj.x - 0.5, proj.y - 0.5, camX, camY);
        const r = (CONFIG.PROJECTILE_RADIUS || 0.1) * tileSize;
        ctx.fillStyle = '#00ffff'; 
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ffff';
        ctx.beginPath();
        ctx.arc(pos.x + tileSize/2, pos.y + tileSize/2, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}