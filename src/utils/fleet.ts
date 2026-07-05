// Generatore randomico della flotta (funzione utilizzata dal GameService)
//-------------------------------------------------------------------------
// Piazza le navi su una griglia quadrata senza sovrapposizioni ne' uscite dai bordi.

export interface Cell { r: number; c: number; }
export interface Ship { size: number; cells: Cell[]; }
export interface Board { gridSize: number; ships: Ship[]; }

type Orientation = 'H' | 'V';

// Intero casuale in [min, max] inclusi.
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Prova a piazzare UNA nave: sceglie una posizione casuale valida per l'orientamento dato.
// Ritorna le celle occupate, oppure null se esce dai bordi o si sovrappone.
function tryPlace(size: number, orientation: Orientation, gridSize: number, occupied: Set<string>): Cell[] | null {
  const maxRow = orientation === 'V' ? gridSize - size : gridSize - 1;
  const maxCol = orientation === 'H' ? gridSize - size : gridSize - 1;
  if (maxRow < 0 || maxCol < 0) return null; // condizione -> nave piu' lunga della griglia

  const startR = randomInt(0, maxRow);
  const startC = randomInt(0, maxCol);

  const cells: Cell[] = [];
  for (let i = 0; i < size; i++) {
    const r = orientation === 'V' ? startR + i : startR;
    const c = orientation === 'H' ? startC + i : startC;
    if (occupied.has(`${r},${c}`)) return null; // condizione -> sovrapposizione
    cells.push({ r, c });
  }
  return cells;
}

// Genera la flotta completa. Lancia se una nave non entra (input non fattibile):
// il GameService validera' la fattibilita' a monte e tradurra' l'errore in 400.
export function generateBoard(gridSize: number, shipSizes: number[]): Board {
  const occupied = new Set<string>(); // celle gia' occupate ("r,c")
  const ships: Ship[] = [];
  const MAX_ATTEMPTS = 1000;

  for (const size of shipSizes) {
    let placed = false;
    for (let attempt = 0; attempt < MAX_ATTEMPTS && !placed; attempt++) {
      const orientation: Orientation = Math.random() < 0.5 ? 'H' : 'V';
      const cells = tryPlace(size, orientation, gridSize, occupied);
      if (cells !== null) {
        cells.forEach((cell) => occupied.add(`${cell.r},${cell.c}`));
        ships.push({ size, cells });
        placed = true;
      }
    }
    if (!placed) {
      throw new Error(`Impossibile piazzare una nave di dimensione ${size} in una griglia ${gridSize}x${gridSize}`);
    }
  }

  return { gridSize, ships };
}

// Colpito? true se (row,col) appartiene a una nave della board.
export function isHit(board: Board, row: number, col: number): boolean {
  return board.ships.some((ship) => ship.cells.some((cell) => cell.r === row && cell.c === col));
}

// Numero totale di celle occupate da navi: serve per rilevare la vittoria.
export function totalShipCells(board: Board): number {
  return board.ships.reduce((sum, ship) => sum + ship.cells.length, 0);
}