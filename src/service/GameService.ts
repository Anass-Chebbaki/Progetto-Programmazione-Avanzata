// Logica di creazione partita: validazione di dominio, controllo/addebito credito,
// vincolo "una partita attiva", allocazione flotte, il tutto in TRANSAZIONE (atomico).
// nuova feature: armin del silenzio

import DatabaseConnection from '../config/database';
import gameDAO from '../dao/GameDAO';
import userDAO from '../dao/UserDAO';
import moveDAO from '../dao/MoveDAO';
import Game from '../model/Game';
import { generateBoard } from '../utils/fleet';
import { ErrorFactory, ErrorType } from '../errors/ErrorFactory';
import { toCsv } from '../utils/csv';

const GAME_CREATION_COST = 0.35;

export interface CreateGameParams {
  creatorId: number;
  type: 'pvp' | 'pvai';
  gridSize: number;
  ships: number[];
  opponentEmail?: string;
  silence: number; //budget silence iniziale (uguale per i due giocatori -> 0-5)
}

// Un colpo sparato (coordinate + esito): non rivela le navi non colpite.
export interface Shot {
  row: number;
  col: number;
  result: string;
  silenced?: boolean; // true = vuol dire colpo silenziato dal difensore
}

export interface ArmSilenceResult{
  armed: boolean;
  silenceRemaining: number;
}

export interface GameStateView {
  game: Game;
  side: 'player1' | 'player2';
  yourTurn: boolean;
  myShots: Shot[];
  shotsAgainstMe: Shot[];
}


class GameService {

  // Storico mosse in CSV. Un colpo silenziato del richiedente resta
  // 'hidden' finche' la partita e' in corso (coerente con lo stato); si rivela a fine partita.
  public async getMovesCsv(gameId: number, userId: number): Promise<string> {
    const game = await gameDAO.findByPk(gameId);
    if (game === null) {
      throw ErrorFactory.create(ErrorType.NotFound, 'Partita non trovata');
    }
    if (userId !== game.player1Id && userId !== game.player2Id) {
      throw ErrorFactory.create(ErrorType.Forbidden, 'Non partecipi a questa partita');
    }

    const moves = await moveDAO.findByGame(gameId); // ordine cronologico
    const gameOver = game.status === 'completed'; // sol quand è finita
    const label = (uid: number | null): string =>
      uid === game.player1Id ? 'player1' : uid === game.player2Id ? 'player2' : 'IA';

    const headers = ['n', 'player', 'row', 'col', 'result', 'silenced', 'timestamp'];
    const rows = moves.map((m, i) => {
      const masked = m.silenced && m.userId === userId && !gameOver;
      return [
        i + 1,
        label(m.userId),
        m.row,
        m.col,
        masked ? 'hidden' : m.result,
        m.silenced,
        m.createdAt.toISOString(),
      ];
    });

    return toCsv(headers, rows);
  }

  public async createGame(params: CreateGameParams): Promise<Game> {
    const { creatorId, type, gridSize, ships, opponentEmail, silence } = params;
    
    // Fattibilita' geometrica: puro controllo sull'input, fuori dalla transazione.
    this.assertFleetFits(gridSize, ships);

    const sequelize = DatabaseConnection.getInstance().getSequelize();

    // Transazione: o tutto (crea + addebita) o niente.
    return sequelize.transaction(async (t) => {
      // Blocca la riga del creatore: serializza creazioni concorrenti dello stesso utente.
      const creator = await userDAO.findByPk(creatorId, { transaction: t, lock: true });
      if (creator === null) {
        throw ErrorFactory.create(ErrorType.Unauthorized, 'Utente non trovato');
      }

      // Credito sufficiente alla creazione (0.35).
      if (creator.tokens < GAME_CREATION_COST) {
        throw ErrorFactory.create(ErrorType.Unauthorized, 'Credito insufficiente per creare la partita');
      }

      // Il creatore non deve avere partite in corso.
      const creatorActive = await gameDAO.findActiveGameForUser(creatorId, { transaction: t });
      if (creatorActive !== null) {
        throw ErrorFactory.create(ErrorType.Conflict, "Hai gia' una partita attiva");
      }

      // Avversario (solo PvP).
      let player2Id: number | null = null;
      if (type === 'pvp') {
        const opponent = await userDAO.findByEmail(opponentEmail as string, { transaction: t, lock: true });
        if (opponent === null) {
          throw ErrorFactory.create(ErrorType.NotFound, 'Avversario non trovato');
        }
        if (opponent.id === creatorId) {
          throw ErrorFactory.create(ErrorType.BadRequest, 'Non puoi sfidare te stesso');
        }
        const opponentActive = await gameDAO.findActiveGameForUser(opponent.id, { transaction: t });
        if (opponentActive !== null) {
          throw ErrorFactory.create(ErrorType.Conflict, "L'avversario ha gia' una partita attiva");
        }
        player2Id = opponent.id;
      }

      // Allocazione randomica delle flotte (entrambi i giocatori; quandoo PvAI -> la seconda e' dell'IA).
      const boardPlayer1 = generateBoard(gridSize, ships);
      const boardPlayer2 = generateBoard(gridSize, ships);

      // Crea la partita.
      const game = await gameDAO.create(
        {
          type,
          status: 'in_progress',
          gridSize,
          player1Id: creatorId,
          player2Id,
          currentTurn: 'player1',
          winner: null,
          boardPlayer1,
          boardPlayer2,
          silencePlayer1: silence,
          silencePlayer2: silence,
        },
        { transaction: t },
      );

      // Addebita 0.35 al creatore (atomocità lato database).
      await userDAO.decrementTokens(creatorId, GAME_CREATION_COST, t);

      return game;
    });
  }

  // Stato della partita dal punto di vista del richiedente (solo colpi gia' sparati).
  public async getGameState(gameId: number, userId: number): Promise<GameStateView> {
    const game = await gameDAO.findByPk(gameId);
    if (game === null) {
      throw ErrorFactory.create(ErrorType.NotFound, 'Partita non trovata');
    }

    let side: 'player1' | 'player2';
    if (userId === game.player1Id) {
      side = 'player1';
    } else if (userId === game.player2Id) {
      side = 'player2';
    } else {
      throw ErrorFactory.create(ErrorType.Forbidden, 'Non partecipi a questa partita');
    }

    const allMoves = await moveDAO.findByGame(gameId);
    const gameOver = game.status === 'completed';

    // I MIEI colpi (come attaccante): se il difensore li ha silenziati, restano 'hidden'
    // finche' la partita e' in corso; a partita conclusa si rivelano.
    const myShots: Shot[] = allMoves
      .filter((m) => m.userId === userId)
      .map((m) => ({
        row: m.row,
        col: m.col,
        result: m.silenced && !gameOver ? 'hidden' : m.result,
        silenced: m.silenced || undefined,
      }));

    // I colpi SUBITI: li vedo sempre veri (conosco la mia board; il silence non nasconde nulla a me).
    const shotsAgainstMe: Shot[] = allMoves
      .filter((m) => m.userId !== userId)
      .map((m) => ({
        row: m.row,
        col: m.col,
        result: m.result,
        silenced: m.silenced || undefined,
      }));

    return { game, side, yourTurn: game.currentTurn === side, myShots, shotsAgainstMe };
  }

  // Il difensore "arma" il silenzio sul prossimo colpo che subira' (solo PvP, budget > 0).
  // NON decrementa qui: il consumo avviene quando il colpo viene assorbito
  public async armSilence(gameId: number, userId: number): Promise<ArmSilenceResult> {
    const sequelize = DatabaseConnection.getInstance().getSequelize();
    return sequelize.transaction(async (t) => {
      const game = await gameDAO.findByPk(gameId, { transaction: t, lock: true });
      if (game === null) {
        throw ErrorFactory.create(ErrorType.NotFound, 'Partita non trovata');
      }
      if (game.type !== 'pvp') {
        throw ErrorFactory.create(ErrorType.BadRequest, "Il silence e' disponibile solo nelle partite PvP");
      }
      if (game.status !== 'in_progress') {
        throw ErrorFactory.create(ErrorType.Conflict, "La partita non e' in corso");
      }

      let side: 'player1' | 'player2';
      if (userId === game.player1Id) {
        side = 'player1';
      } else if (userId === game.player2Id) {
        side = 'player2';
      } else {
        throw ErrorFactory.create(ErrorType.Forbidden, 'Non partecipi a questa partita');
      }

      const budget = side === 'player1' ? game.silencePlayer1 : game.silencePlayer2;
      if (budget <= 0) {
        throw ErrorFactory.create(ErrorType.Conflict, 'Silence esaurito');
      }

      if (side === 'player1') {
        game.silenceArmedPlayer1 = true;
      } else {
        game.silenceArmedPlayer2 = true;
      }
      await game.save({ transaction: t });

      return { armed: true, silenceRemaining: budget };
    });
  }

  // Ogni nave deve entrare nella griglia e la flotta deve starci.
  private assertFleetFits(gridSize: number, ships: number[]): void {
    const tooLong = ships.some((s) => s > gridSize);
    const totalCells = ships.reduce((sum, s) => sum + s, 0);
    if (tooLong || totalCells > gridSize * gridSize) {
      throw ErrorFactory.create(ErrorType.BadRequest, 'La flotta non entra nella griglia indicata');
    }
  }
}

export default new GameService();