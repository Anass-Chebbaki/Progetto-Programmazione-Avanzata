import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import DatabaseConnection from '../config/database';

const sequelize = DatabaseConnection.getInstance().getSequelize();

class Game extends Model<InferAttributes<Game>, InferCreationAttributes<Game>> {
  declare id: CreationOptional<number>;
  declare type: string;                                   // 'pvp' | 'PvAi'
  declare status: CreationOptional<string>;               // 'in_progress' | 'completed'
  declare gridSize: number;
  declare player1Id: number;                              // creatore (obbligatorio)
  declare player2Id: CreationOptional<number | null>;     // avversario umano (null se IA)
  declare currentTurn: CreationOptional<string>;          // 'player1' | 'player2'
  declare winner: CreationOptional<string | null>;        // 'player1' | 'player2' | null
  declare boardPlayer1: CreationOptional<object | null>;  // flotta player1 (JSONB)
  declare boardPlayer2: CreationOptional<object | null>;  // flotta player2 (JSONB)
  declare silencePlayer1: CreationOptional<number>;          // budget silence player1 (0-5)
  declare silencePlayer2: CreationOptional<number>;          // budget silence player2 (0-5)
  declare silenceArmedPlayer1: CreationOptional<boolean>;    // player1 ha armato il silenzio sul prossimo colpo subito
  declare silenceArmedPlayer2: CreationOptional<boolean>;    // idem player2
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Game.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: DataTypes.STRING, allowNull: false, validate: { isIn: [['pvp', 'pvai']] } },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'in_progress',
      validate: { isIn: [['in_progress', 'completed']] },
    },
    gridSize: { type: DataTypes.INTEGER, allowNull: false },
    player1Id: { type: DataTypes.INTEGER, allowNull: false },
    player2Id: { type: DataTypes.INTEGER, allowNull: true },
    currentTurn: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'player1',
      validate: { isIn: [['player1', 'player2']] },
    },
    winner: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isIn: [['player1', 'player2']] }, //viene saltato quando null
    },
    boardPlayer1: { type: DataTypes.JSONB, allowNull: true },
    boardPlayer2: { type: DataTypes.JSONB, allowNull: true },
    silencePlayer1: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    silencePlayer2: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    silenceArmedPlayer1: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    silenceArmedPlayer2: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'games', modelName: 'Game' },
);

export default Game;