class Player {
    constructor(currentTile) {
        this.currentTile = currentTile
        this.px = currentTile.px
        this.py = currentTile.py
        this.movingTo = null
        this.movingFrom = null
        this.movingProgress = 0
        this.movingQueue = []
    }

    draw(p5, camera) {
        p5.strokeWeight(0)
        p5.fill('red')
        let cx = (this.px - camera.x) * camera.zoom
        let cy = (this.py - camera.y) * camera.zoom

        let s = 10 * camera.zoom
        p5.circle(cx, cy, s)
    }

    stopMoving() {
        this.px = this.currentTile.px
        this.py = this.currentTile.py
        this.movingTo = null;
        this.movingQueue = [];
    }

    setMovingTo(dest) {
        this.movingProgress = 0
        this.movingFrom = this.currentTile
        this.movingTo = dest
    }

    setMovingQueue(queue) {
        this.movingQueue = queue
        if (queue.length > 0) {
            this.setMovingTo(this.movingQueue.shift())
        }
    }

    move(delta) {
        if (this.movingTo == null) {
            return null
        }
        this.movingProgress += delta
        const dX = this.movingTo.px - this.movingFrom.px
        const dY = this.movingTo.py - this.movingFrom.py

        this.px = dX * this.movingProgress + this.movingFrom.px
        this.py = dY * this.movingProgress + this.movingFrom.py

        let ret = ''

        if (this.movingProgress > 1) {
            ret = 'ARRIVE'
            this.movingProgress = 1
            this.px = this.movingTo.px
            this.py = this.movingTo.py
            if (this.movingQueue.length > 0) {
                this.setMovingTo(this.movingQueue.shift())
            } else {
                this.stopMoving()
                ret = 'END'
            }
        } else if (this.movingProgress > 0.5) {
            if (this.currentTile != this.movingTo) {
                ret = 'CROSS'
            }
            this.currentTile = this.movingTo
            this.movingFrom.path = null
            this.movingFrom.waypoint = null
        }

        return ret
    }

}

export const getPlayer = (t) => new Player(t)