// Registrazione modelli + associazioni. Va importato una volta all'avvio (aggaincio su src/index.ts).

import User from './User';
import Game from './Game';
import Move from './Move';

// Un utente puo' aver creato molte partite come player1
User.hasMany(Game, { as: 'gamesAsPlayer1', foreignKey: 'player1Id' });
Game.belongsTo(User, { as: 'player1', foreignKey: 'player1Id' });

// Un utente puo' partecipare come player2 (avversario umano)
User.hasMany(Game, { as: 'gamesAsPlayer2', foreignKey: 'player2Id' });
Game.belongsTo(User, { as: 'player2', foreignKey: 'player2Id' });

// Una partita ha molte mosse; una mossa appartiene a una partita
Game.hasMany(Move, { as: 'moves', foreignKey: 'gameId' });
Move.belongsTo(Game, { as: 'game', foreignKey: 'gameId' });

// Autore della mossa (null -> IA)
User.hasMany(Move, { as: 'moves', foreignKey: 'userId' });
Move.belongsTo(User, { as: 'author', foreignKey: 'userId' });

export { User, Game, Move };