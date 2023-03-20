const HEXAGON_CONSTANT = 13 / 15
const tile_size_px = 60;
const SELECTED_COLOR = 'blue';
const DEFAULT_COLOR = 'white'

const draw_hexagon = (p5, transX, transY, s, color) => {
  p5.push();
  p5.stroke(color);
  p5.strokeWeight(1);
  p5.fill(color);
  p5.translate(transX, transY);
  p5.scale(s);
  p5.beginShape();
  p5.vertex(-0.5, -HEXAGON_CONSTANT / 4)
  p5.vertex(-0.5, HEXAGON_CONSTANT / 4)
  p5.vertex(0, HEXAGON_CONSTANT / 2)
  p5.vertex(0.5, HEXAGON_CONSTANT / 4)
  p5.vertex(0.5, -HEXAGON_CONSTANT / 4)
  p5.vertex(0, -HEXAGON_CONSTANT / 2)

  p5.endShape(p5.CLOSE);
  p5.pop();
}

export class Tile {
  constructor(index, map_width_tiles) {
    this.index = index;
    this.x = index % map_width_tiles;
    this.y = Math.floor(index / map_width_tiles)
    const px = Tile.coordToPx({ x: this.x, y: this.y })
    this.px = px.x
    this.py = px.y
    this.explored = false
    this.selected = false
  }

  static coordToPx(coord) {
    const offset = coord.y % 2 == 0 ? 0 : tile_size_px / 2
    const xpx = (coord.x + 0.5) * tile_size_px + offset
    const ypx = (coord.y + 0.66) * tile_size_px * HEXAGON_CONSTANT * HEXAGON_CONSTANT
    return { x: xpx, y: ypx }
  }

  draw(p5) {
    const color = this.selected ? SELECTED_COLOR : DEFAULT_COLOR
    draw_hexagon(p5, this.px, this.py, tile_size_px / 2.1, color)
  }

  checkMouse(p5) {
    const dX = p5.mouseX - this.px
    const dY = p5.mouseY - this.py
    const dist = Math.sqrt(dX * dX + dY * dY)
    this.selected = (dist < tile_size_px / 2.2)
  }



}


