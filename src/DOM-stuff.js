import { controller } from './functionality.js';

const playerGrid = document.querySelector('.left-side .board');
const computerGrid = document.querySelector('.right-side .board');

const computerDialogue = document.querySelector('.right-side dialog');
const playerDialogue = document.querySelector('.left-side dialog');

const randomizeButton = document.querySelector('.left-side > button');
const playButton = document.querySelector('.right-side dialog button');

const winText = document.querySelector('body > :last-child');

function cellClicked(event) {
    const cell = event.target;
    if (
        controller.getCurrentPlayer() === controller.getPlayer() &&
        !cell.classList.contains('hit')
    ) {
        const computer = controller.getComputer();
        const type = computer.gameboard.receiveHit([
            parseInt(cell.dataset.column) - 1,
            parseInt(cell.parentElement.dataset.row) - 1,
        ]);

        if (type === 'ship' || type === 'sunk') {
            cell.classList.add('ship');
            if (type === 'sunk') {
                sinkAllCells(cell, computer);
            }
        }
        cell.classList.add('hit');

        controller.endOfMove();
    }
}

function computerCellHit([x, y], isSunk) {
    if (!playerGrid) {
        return;
    }
    const cell = playerGrid.children[y].children[x];
    cell.classList.add('hit');
    if (isSunk) {
        sinkAllCells(cell, controller.getPlayer());
    }
}

function randomizeShipsDOM(player) {
    winText.textContent = '';
    clearBoardDOM(controller.getComputer());
    player.gameboard.randomizeShips(
        player.gameboard.getShips(),
        player.gameboard.getBoard()
    );
    if (player.computer) {
        return;
    }
    const board = player.gameboard.getBoard();
    const grid = getGrid(player);

    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[0].length; x++) {
            if (board[y][x].ship) {
                let cellDOM = grid.children[y].children[x];
                cellDOM.classList.add('ship');
            }
        }
    }
}

function clearBoardDOM(player) {
    player.gameboard.clearBoard(
        player.gameboard.getShips(),
        player.gameboard.getBoard()
    );
    const grid = getGrid(player);

    for (const row of grid.children) {
        for (const cell of row.children) {
            cell.classList.remove('ship');
            cell.classList.remove('hit');
            cell.classList.remove('sunk');
        }
    }
}

function clearBoardHits() {
    const grid = playerGrid;

    for (const row of grid.children) {
        for (const cell of row.children) {
            cell.classList.remove('hit');
            cell.classList.remove('sunk');
        }
    }
}

function sinkAllCells(currCell, player) {
    const allCells = player.gameboard.getAllShipCells(
        [
            parseInt(currCell.dataset.column) - 1,
            parseInt(currCell.parentElement.dataset.row) - 1,
        ],
        player.gameboard.getBoard()
    );
    const playerGrid = getGrid(player);
    for (let coordinates of allCells) {
        const [x, y] = coordinates;
        playerGrid.children[y].children[x].classList.add('sunk');
    }
}

function winSequence(player) {
    playerDialogue.style.visibility = 'hidden';
    computerDialogue.style.visibility = 'visible';
    playButton.style.visibility = 'visible';
    if (player.computer) {
        winText.textContent = 'You lost!';
    } else {
        winText.textContent = 'You won!';
    }
}

function startGameDOM() {
    clearBoardHits();
    clearBoardDOM(controller.getComputer());
    winText.textContent = '';
    controller.startGame();
    playButton.style.visibility = 'hidden';
    playerTurn();
}

function getGrid(player) {
    return player.computer ? computerGrid : playerGrid;
}

function playerTurn() {
    if (!computerDialogue) {
        return;
    }
    computerDialogue.style.visibility = 'hidden';
    playerDialogue.style.visibility = 'visible';
}

function computerTurn() {
    if (!computerDialogue) {
        return;
    }
    computerDialogue.style.visibility = 'visible';
    playerDialogue.style.visibility = 'hidden';
}

if (randomizeButton) {
    document.addEventListener('DOMContentLoaded', () => {
        randomizeShipsDOM(controller.getPlayer());
        randomizeShipsDOM(controller.getComputer());
    });
    randomizeButton.addEventListener('click', () => {
        if (controller.getGameStarted()) {
            return;
        }
        let player = controller.getPlayer();
        clearBoardDOM(player);
        randomizeShipsDOM(player);
    });

    playButton.addEventListener('click', startGameDOM);

    for (const row of computerGrid.children) {
        for (const cell of row.children) {
            cell.addEventListener('click', cellClicked);
        }
    }
}

export { playerTurn, computerTurn, computerCellHit, winSequence };
