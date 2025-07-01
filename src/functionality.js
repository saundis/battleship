import {
    playerTurn,
    computerTurn,
    computerCellHit,
    winSequence,
} from './DOM-stuff.js';

class Ship {
    constructor(length) {
        this.length = length;
        this._start = null; // [x, y]
        this._orientation = null; // 'up', 'down', 'left', 'right'
        this.hits = [];
    }

    set start(coordinates) {
        this._start = coordinates;
    }

    get start() {
        return this._start;
    }

    set orientation(direction) {
        this._orientation = direction;
    }

    get orientation() {
        return this._orientation;
    }

    hit(coordinates) {
        if (this.hits.length >= this.length) {
            return new Error('Ship already sunken');
        }
        if (this.hits.includes(coordinates)) {
            return new Error('Coordinate already hit');
        }
        for (const coordinate of coordinates) {
            if (coordinate < 0 || coordinate > 10) {
                return new Error('Coordinates out of range');
            }
        }
        this.hits.push(coordinates);
    }

    isSunk() {
        return this.hits.length >= this.length;
    }

    clear() {
        this._start = null;
        this._orientation = null;
        this.hits = [];
    }
}

class Cell {
    constructor() {
        this.ship = null; // reference to ship object if occupied
        this.hit = false;
    }

    clear() {
        this.ship = null;
        this.hit = false;
    }
}

class Player {
    constructor() {
        this.gameboard = gameboard();
        this.computer = false;
    }
}

class Computer extends Player {
    constructor() {
        super();
        this.computer = true;
    }

    getNextMove(board) {
        let x, y;
        do {
            x = Math.floor(Math.random() * COLUMNS);
            y = Math.floor(Math.random() * ROWS);
        } while (board[y][x].hit);

        return [x, y];
    }

    doNextMove(player) {
        const randomTime = Math.floor(Math.random() * 750) + 500;

        setTimeout(() => {
            const coordinates = this.getNextMove(player.gameboard.getBoard());

            if (player.gameboard.receiveHit(coordinates) === 'sunk') {
                computerCellHit(coordinates, true);
            } else {
                computerCellHit(coordinates, false);
            }
            controller.endOfMove();
        }, randomTime);
    }
}

const COLUMNS = 10;
const ROWS = 10;
const SHIPS = [5, 4, 3, 2, 1]; // lengths of ships
const ORIENTATIONS = ['up', 'down', 'left', 'right'];

const gameboard = function () {
    const board = [];
    const ships = [];

    // Initalizing gameboard with cells
    for (let i = 0; i < ROWS; i++) {
        const newRow = [];
        for (let j = 0; j < COLUMNS; j++) {
            newRow.push(new Cell());
        }
        board.push(newRow);
    }

    // Initializing ships
    for (let i = 0; i < SHIPS.length; i++) {
        const newShip = new Ship(SHIPS[i]);
        ships.push(newShip);
    }

    const getAllShipCells = (cell, board) => {
        let [x, y] = cell;
        if (!board[y][x].ship) {
            return null;
        }
        const ship = board[y][x].ship;
        [x, y] = ship.start;
        let cellsArray = [];

        if (!ship.start || !ship.orientation) {
            return [];
        }

        for (let i = 0; i < ship.length; i++) {
            let [newX, newY] = [x, y];
            switch (ship.orientation) {
                case 'up':
                    newY -= i;
                    break;
                case 'down':
                    newY += i;
                    break;
                case 'left':
                    newX -= i;
                    break;
                case 'right':
                    newX += i;
                    break;
            }
            cellsArray.push([newX, newY]);
        }
        return cellsArray;
    };

    // Returns all cells that the ship is going to be placed in from start position (in order from start to end)
    const getAllPotentialShipCells = (length, direction, board) => {
        let cellsArray = [];
        let x, y;
        do {
            cellsArray = [];
            x = Math.floor(Math.random() * COLUMNS);
            y = Math.floor(Math.random() * ROWS);

            if (board[y][x].ship) {
                continue;
            }

            for (let i = 0; i < length; i++) {
                let [newX, newY] = [x, y];
                switch (direction) {
                    case 'up':
                        newY -= i;
                        break;
                    case 'down':
                        newY += i;
                        break;
                    case 'left':
                        newX -= i;
                        break;
                    case 'right':
                        newX += i;
                        break;
                }
                if (
                    newY >= ROWS ||
                    newY < 0 ||
                    newX >= COLUMNS ||
                    newX < 0 ||
                    board[newY][newX].ship
                ) {
                    cellsArray = [];
                    continue;
                }
                cellsArray.push(board[newY][newX]);
            }
        } while (cellsArray.length === 0);
        return { x, y, cellsArray };
    };

    const randomizeShips = (ships, board) => {
        if (controller.getGameStarted()) {
            return;
        }
        ships.forEach((ship) => {
            const direction = ORIENTATIONS[Math.floor(Math.random() * 4)];
            const shipCells = getAllPotentialShipCells(
                ship.length,
                direction,
                board
            );
            ship.start = [shipCells.x, shipCells.y];
            ship.orientation = direction;
            shipCells.cellsArray.forEach((cell) => {
                cell.ship = ship;
            });
        });
    };

    const clearBoard = (ships, board) => {
        if (controller.getGameStarted()) {
            return;
        }
        ships.forEach((ship) => {
            ship.clear();
        });

        board.forEach((row) =>
            row.forEach((cell) => {
                cell.clear();
            })
        );
    };

    // Returns true if hit was a ship
    const receiveHit = (coordinates) => {
        const [x, y] = coordinates;
        const cell = board[y][x];
        cell.hit = true;

        if (cell.ship) {
            cell.ship.hit(coordinates);
            if (cell.ship.isSunk()) {
                return 'sunk';
            }
            return 'ship';
        }
        return 'hit';
    };

    const areAllSunk = (ships) => {
        for (let ship of ships) {
            if (!ship.isSunk()) {
                return false;
            }
        }
        return true;
    };

    const getBoard = () => {
        return board;
    };

    const getShips = () => {
        return ships;
    };

    return {
        randomizeShips,
        receiveHit,
        areAllSunk,
        getBoard,
        getShips,
        clearBoard,
        getAllShipCells,
    };
};

const controller = (() => {
    const player = new Player();
    const computer = new Computer();
    let currentPlayer = null;
    let gameStarted = false;

    const checkForWin = (currentPlayer, player, computer) => {
        let otherPlayer = getOtherPlayer(currentPlayer, player, computer);

        return otherPlayer.gameboard.areAllSunk(
            otherPlayer.gameboard.getShips()
        );
    };

    // Occurs when player presses play
    const endOfMove = () => {
        if (checkForWin(currentPlayer, player, computer)) {
            gameStarted = false;
            winSequence(currentPlayer);
            return;
        }
        currentPlayer = getOtherPlayer(currentPlayer, player, computer);
        if (currentPlayer === computer) {
            computerTurn();
            computer.doNextMove(player);
        } else {
            playerTurn();
        }
    };

    const startGame = () => {
        computer.gameboard.clearBoard(
            computer.gameboard.getShips(),
            computer.gameboard.getBoard()
        );
        computer.gameboard.randomizeShips(
            computer.gameboard.getShips(),
            computer.gameboard.getBoard()
        );
        gameStarted = true;
        currentPlayer = player;
    };

    const getGameStarted = () => {
        return gameStarted;
    };

    const getCurrentPlayer = () => {
        return currentPlayer;
    };

    const getOtherPlayer = (plr, player, computer) => {
        return !plr || plr === computer ? player : computer;
    };

    const getPlayer = () => {
        return player;
    };

    const getComputer = () => {
        return computer;
    };

    return {
        endOfMove,
        checkForWin,
        getCurrentPlayer,
        getOtherPlayer,
        getPlayer,
        getComputer,
        startGame,
        getGameStarted,
    };
})();

export { Ship, Cell, gameboard, controller, Player, Computer };
