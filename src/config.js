export const CONFIG = {
    TILE_SIZE: 32,
    GRID_W: 23, // 21 playable + 2 borders
    GRID_H: 12, // 10 playable + 2 borders
    PLAYABLE_W: 21,
    PLAYABLE_H: 10,
    OFFSET_X: 1, // Border offset
    OFFSET_Y: 1,
    SCALE: 2, // Visual zoom
    PLAYER_SPEED: 0.07, // Grid cells per tick - Reduced for realistic movement
    PROJECTILE_SPEED: 0.4,
    FIRE_RATE: 800, // Slower fire rate (ensures 1 bullet at a time)
    PROJECTILE_RADIUS: 0.1, // Small bullet
};

// Map definition: 0 = Floor, 1 = Wall/Border
export const MAP_DATA = [];

// Initialize Grid (Hollow box)
for (let y = 0; y < CONFIG.GRID_H; y++) {
    const row = [];
    for (let x = 0; x < CONFIG.GRID_W; x++) {
        if (x === 0 || x === CONFIG.GRID_W - 1 || y === 0 || y === CONFIG.GRID_H - 1) {
            row.push(1); // Wall
        } else {
            row.push(0); // Floor
        }
    }
    MAP_DATA.push(row);
}