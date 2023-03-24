import { coordToAxial } from "./hex";

export const tile_size_px = 60;
const HEXAGON_CONSTANT = Math.sqrt(3) / 2

const SELECTED_COLOR = 'red';
const WAYPOINT_COLOR = 'green';
const EXPLORED_COLOR = '#444'
const VISIBLE_COLOR = '#aaa'
const HIDDEN_COLOR = 'black'

// draw a hexagon to the p5 context at x, y, with size s and given color
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

// class to manage tiles
export class Tile {
  constructor(x, y) {
    //grid position
    this.x = x
    this.y = y
    //pixel position
    const px = Tile.coordToPx({ x: this.x, y: this.y })
    this.px = px.x
    this.py = px.y
    //fukin axial position / cubic
    const axial = coordToAxial({ x: this.x, y: this.y })
    this.q = axial.q
    this.r = axial.r
    this.s = -this.q - this.r
    this.name = `Sector ${this.q + 10}${this.r + 20}`
    this.explored = false
    this.selected = false
  }

  static coordToPx(coord) {
    const offset = coord.y % 2 == 0 ? 0 : tile_size_px / 2
    const xpx = (coord.x + 0.5) * tile_size_px + offset
    const ypx = (coord.y + 0.66) * tile_size_px * HEXAGON_CONSTANT * HEXAGON_CONSTANT
    return { x: xpx, y: ypx }
  }

  static pxToCoord(coord) {
    const y = Math.round(coord.y / HEXAGON_CONSTANT / HEXAGON_CONSTANT / tile_size_px - 0.66)
    const offset = y % 2 == 0 ? 0 : tile_size_px / 2
    const x = Math.round((coord.x - offset) / tile_size_px - 0.5)
    return { x: x, y: y }
  }

  draw(p5, camera, color_override) {
    let color = HIDDEN_COLOR
    if (this.explored) {
      color = EXPLORED_COLOR
    }
    if (this.visible) {
      color = VISIBLE_COLOR
    }

    if (this.event && this.visible || this.signal && this.visible) {
      color = 'purple';
    }
    if (this.path) {
      color = '#72A0C1'
    }
    if (this.waypoint) {
      color = WAYPOINT_COLOR
    }
    if (color_override) {
      color = color_override
    }

    draw_hexagon(p5, (this.px - camera.x) * camera.zoom, (this.py - camera.y) * camera.zoom, tile_size_px / 2.1 * camera.zoom, color)

    if (false && this.path) {
      // turn on to see path numbers
      p5.push()
      p5.translate(this.px, this.py)
      p5.text(this.path, 0, 0)
      p5.pop()
    }

    //if this has an event then you can change color or w/e
  }

  checkMouse(p5, camera) {
    const dX = p5.mouseX + (camera.x - this.px) * camera.zoom
    const dY = p5.mouseY + (camera.y - this.py) * camera.zoom
    const dist = Math.sqrt(dX * dX + dY * dY)
    this.selected = (dist < tile_size_px / 2.2 * camera.zoom)
  }

  getName() {
    if (this.explored) {
      return this.name
    } else {
      return "Unknown sector"
    }
  }

}


