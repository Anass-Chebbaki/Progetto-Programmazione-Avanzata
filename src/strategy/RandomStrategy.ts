// Strategia base: spara su una cella casuale mai tentata prima.
// Se abbiamo tempo vediamo se implementare altre euristiche

import { MoveStrategy, AiMoveContext } from './MoveStrategy';

export class RandomStrategy implements MoveStrategy {
  public chooseMove(context: AiMoveContext): { row: number; col: number } {
    const { gridSize, previousShots } = context;

    // Insieme delle celle gia' colpite, per non ripeterle.
    const fired = new Set<string>(previousShots.map((s) => `${s.row},${s.col}`));

    // Raccoglie tutte le celle ancora disponibili.
    const available: { row: number; col: number }[] = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (!fired.has(`${r},${c}`)) {
          available.push({ row: r, col: c });
        }
      }
    }

    // Non dovrebbe accadere! -> la partita finisce prima di esaurire la griglia.
    if (available.length === 0) {
      throw new Error('Nessuna cella disponibile per la mossa IA');
    }

    const idx = Math.floor(Math.random() * available.length);
    return available[idx];
  }
}