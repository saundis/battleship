import {
    Ship,
    Cell,
    gameboard,
    controller,
    Player,
    Computer,
} from './functionality.js';

const COLUMNS = 10;
const ROWS = 10;

jest.useFakeTimers();

describe('Ship testing', () => {
    it('should record a hit at valid coordinates', () => {
        const test = new Ship(1);
        test.hit([0, 0]);
        expect(test.hits).toEqual([[0, 0]]);
        expect(test.isSunk()).toEqual(true);
    });

    it('should return error for out-of-bounds coordinates', () => {
        const test = new Ship(1);
        const result = test.hit([-1, 0]);
        expect(result).toBeInstanceOf(Error);
        expect(result.message).toBe('Coordinates out of range');
        expect(test.isSunk()).toEqual(false);
    });

    it('should record multiple hits at valid coordinates', () => {
        const test = new Ship(2);
        test.hit([0, 0]);
        test.hit([0, 1]);
        expect(test.hits).toEqual([
            [0, 0],
            [0, 1],
        ]);
        expect(test.isSunk()).toEqual(true);
    });
});

describe('Board testing', () => {
    it('should populate board with ships with random position', () => {
        let game = gameboard();
        let ships = [
            new Ship(1),
            new Ship(2),
            new Ship(3),
            new Ship(4),
            new Ship(5),
        ];
        let board = [];

        for (let i = 0; i < ROWS; i++) {
            const newRow = [];
            for (let j = 0; j < COLUMNS; j++) {
                newRow.push(new Cell());
            }
            board.push(newRow);
        }

        game.randomizeShips(ships, board);

        ships.forEach((ship) => {
            let startPosition = ship.start;
            expect(startPosition).not.toBeNull();
            expect(Array.isArray(startPosition)).toBe(true);

            const x = startPosition[0];
            const y = startPosition[1];

            expect(x).toBeGreaterThanOrEqual(0);
            expect(x).toBeLessThan(board[0].length);
            expect(y).toBeGreaterThanOrEqual(0);
            expect(y).toBeLessThan(board.length);
            expect(board[y][x].ship).toBe(ship);

            expect(ship.orientation).not.toBeNull();
            const direction = ship.orientation;

            // endPosition
            let [newX, newY] = [x, y];

            for (let i = 0; i < ship.length; i++) {
                switch (direction) {
                    case 'up':
                        newY -= 1;
                        break;
                    case 'down':
                        newY += 1;
                        break;
                    case 'left':
                        newX -= 1;
                        break;
                    case 'right':
                        newX += 1;
                        break;
                }
                expect(newX).toBeGreaterThanOrEqual(0);
                expect(newX).toBeLessThan(board[0].length);
                expect(newY).toBeGreaterThanOrEqual(0);
                expect(newY).toBeLessThan(board.length);
                expect(board[newY][newX].ship).toBe(ship);
            }
        });
    });

    it('should return false when all ships are not sunk', () => {
        const game = gameboard();
        const ship1 = new Ship(1);
        ship1.hit([0, 0]);

        const ship2 = new Ship(2);
        ship2.hit([0, 1]);

        const ship3 = new Ship(3);
        ship3.hit([1, 1]);

        let ships = [ship1, ship2, ship3];
        expect(game.areAllSunk(ships)).toBe(false);
    });

    it('should return false when all ships are sunk', () => {
        const game = gameboard();
        const ship1 = new Ship(1);
        ship1.hit([0, 0]);

        const ship2 = new Ship(2);
        ship2.hit([0, 1]);
        ship2.hit([0, 2]);

        const ship3 = new Ship(3);
        ship3.hit([1, 1]);
        ship3.hit([1, 2]);
        ship3.hit([1, 3]);

        let ships = [ship1, ship2, ship3];
        expect(game.areAllSunk(ships)).toBe(true);
    });
});

describe('Controller testing', () => {
    it('should return true if player has sunken all opponent ships', () => {
        const player = new Player();
        const computer = new Computer();
        const currentPlayer = player;

        computer.gameboard.areAllSunk = jest.fn().mockReturnValue(true);

        expect(controller.checkForWin(currentPlayer, player, computer)).toBe(
            true
        );
    });

    it('should return false if player has not sunken all opponent ships', () => {
        const player = new Player();
        const computer = new Computer();
        const currentPlayer = player;

        computer.gameboard.areAllSunk = jest.fn().mockReturnValue(false);

        expect(controller.checkForWin(currentPlayer, player, computer)).toBe(
            false
        );
    });
});

describe('Computer testing', () => {
    it('should return a new move', () => {
        const computer = new Computer();
        const board = [];

        for (let i = 0; i < ROWS; i++) {
            const newRow = [];
            for (let j = 0; j < COLUMNS; j++) {
                const cell = new Cell();
                newRow.push(cell);
                if (j > 0) {
                    cell.hit = true;
                }
            }
            board.push(newRow);
        }

        const coordinates = computer.getNextMove(board);
        expect(Array.isArray(coordinates)).toBe(true);
        const x = coordinates[0];
        const y = coordinates[1];
        expect(board[y][x].hit).toBe(false);
    });

    it('should send hit to player', () => {
        let computer = new Computer();
        let player = new Player();
        const board = [];

        for (let i = 0; i < ROWS; i++) {
            const newRow = [];
            for (let j = 0; j < COLUMNS; j++) {
                const cell = new Cell();
                if (j > 0) {
                    cell.hit = true;
                }
                newRow.push(cell);
            }
            board.push(newRow);
        }

        const mockFinal = jest.fn().mockReturnValue(true);
        player.receiveHit = mockFinal;
        computer.gameboard.getBoard = jest.fn().mockReturnValue(board);

        computer.doNextMove(player);

        jest.advanceTimersByTime(2000);

        // figure out what to expect and what the board should be
        console.log(mockFinal.mock.calls);
        expect(mockFinal.mock.calls).toHaveLength(1);
    });
});
