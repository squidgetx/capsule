// Test import of a JavaScript module
import p5 from 'p5'
import { Tile } from './js/tile';

const sketch = (p5) => {

    const tiles = []
    const map_width_tiles = 6;
    const canvas_width = 1000;

    let pX = 1, pY = 1

    const generate_tiles = () => {
        for (let i = 0; i < map_width_tiles * map_width_tiles; i++) {
            tiles.push(new Tile(i, map_width_tiles))
        }
    }

    const draw_tiles = () => {
        for (const tile of tiles) {
            tile.checkMouse(p5)
            tile.draw(p5)
        }
    }

    const drawPlayer = () => {
        const c = Tile.coordToPx({ x: pX, y: pY })
        p5.strokeWeight(0)
        p5.circle(c.x, c.y, 10)
    }

    p5.setup = () => {
        generate_tiles()
        p5.createCanvas(canvas_width, canvas_width * 9 / 16);
        p5.background('grey')
    }

    p5.draw = () => {
        draw_tiles()
        p5.fill('red')
        drawPlayer()
    }

    p5.mouseClicked = () => {
        const clickedTile = tiles.find((t) => t.selected)
        if (clickedTile) {
            pX = clickedTile.x
            pY = clickedTile.y
        }
    }

}

new p5(sketch)