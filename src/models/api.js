const _ = require("lodash")

class Board {
    constructor() {
        this.board = []
        this.tiles = []
        this.merged = []

        for (let x = 0; x < 4; x++) {
            this.board[x] = []
            for (let y = 0; y < 4; y++) {
                this.board[x][y] = 0
                this.tiles.push( [x, y] )
            }
        }

        for (let i = 0; i < 2; i++) {
            this.addRandomTile()
        }
    }

    getTile(x, y) {
        return this.board[x][y]
    }

    setTile(x, y, val) {
        this.board[x][y] = val
    }

    inRange(x, y) {
        return x >= 0 && y >= 0 && x < 4 && y < 4
    }

    moveTile(x, y, dx, dy, traversals) {
        if (this.getTile(x, y) == 0) {
            return
        }

        while (true) {
            let [tx, ty] = [x + dx, y + dy]
            if (!this.inRange(tx, ty)) {
                break
            }

            if (this.merged.find(([x, y]) => x == tx && y == ty)) {
                break
            }

            let targetTileValue = this.getTile(tx, ty)
            let value = this.getTile(x, y)

            if (targetTileValue == 0 || targetTileValue == value) {
                this.setTile(x, y, 0)
                this.setTile(tx, ty, targetTileValue + value)

                console.log(`${x}, ${y} (${value}) => ${tx}, ${ty} (${targetTileValue})`)

                if (targetTileValue == value) {
                    break
                }

                x = tx
                y = ty
            } else {
                break
            }
        }
    }

    move(direction) {
        let [dx, dy] = [0, 0]

        this.merged = []

        if (direction == "up")    { dy = 1 }
        if (direction == "down")  { dy = -1 }   
        if (direction == "right") { dx = 1 }
        if (direction == "left")  { dx = -1 }

        if (dx == 0 && dy == 0) return

        let traversals = {x: [], y: []}

        for (var pos = 0; pos < 4; pos++) {
            traversals.x.push(pos)
            traversals.y.push(pos)
        }

        if (dx == 1) { traversals.x = traversals.x.reverse() }
        if (dy == 1) { traversals.y = traversals.y.reverse() }

        traversals.x.forEach(x => {
            traversals.y.forEach(y => {
                this.moveTile(x, y, dx, dy)
            })
        })

        this.addRandomTile()
    }

    addRandomTile() {
        let value = Math.random() < 0.9 ? 2 : 4

        let [x, y] = _.sample(
            this.tiles.filter(([x, y]) => this.getTile(x, y) == 0)
        )
        
        this.setTile(x, y, value)
    }
}

class Game {
    constructor(app) {
        require('socket.io')(1234)
            .of("/2048")
            .on('connection', (socket) => {
                let board = new Board()

                socket.on('message', (msg) => {
                    let {
                        direction
                    } = JSON.parse(msg)

                    board.move(direction)

                    socket.emit( JSON.stringify({
                        dead: false,
                        board: board.board
                    }) )
                })
                socket.on('disconnect', () => {
                    
                    socket.emit( JSON.stringify({
                        
                    }) )
                })
            })
    }
}

module.exports = Game