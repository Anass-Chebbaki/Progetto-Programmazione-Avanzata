// Pattern STRATEGY: astrae la scelta della mossa dell'IA dietro un'interfaccia.
// Cambiando l'implementazione (es. da random a euristica) NON si tocca il motore di gioco.

// Un colpo gia' effettuato dall'IA (coordinate + esito): il contesto passato alla strategia.
export interface AiShot {
  row: number;
  col: number;
  result: string; // 'hit' | 'miss'
}

// Contesto di gioco fornito alla strategia per decidere la prossima mossa.
export interface AiMoveContext {
  gridSize: number;
  previousShots: AiShot[]; // colpi gia' sparati dall'IA in questa partita
}

export interface MoveStrategy {
  // Sceglie la prossima cella su cui l'IA spara.
  chooseMove(context: AiMoveContext): { row: number; col: number };
}