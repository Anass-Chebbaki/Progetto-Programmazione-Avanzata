// Vista pubblica della partita: NON espone boardPlayer1/2 (posizioni delle navi),
// altrimenti si rivelerebbe la flotta. Le board restano solo nel DB.

import Game from '../model/Game';

export interface PublicGame {
  id: number;
  type: string;
  status: string;
  gridSize: number;
  player1Id: number;
  player2Id: number | null;
  currentTurn: string;
  winner: string | null;
  createdAt: Date;
}

export function toPublicGame(game: Game): PublicGame {
  return {
    id: game.id,
    type: game.type,
    status: game.status,
    gridSize: game.gridSize,
    player1Id: game.player1Id,
    player2Id: game.player2Id ?? null,
    currentTurn: game.currentTurn,
    winner: game.winner ?? null,
    createdAt: game.createdAt,
  };
}