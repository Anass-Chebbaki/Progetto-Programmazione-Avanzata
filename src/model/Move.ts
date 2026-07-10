// quì viene effettuato log append delle mosse
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import DatabaseConnection from '../config/database';

const sequelize = DatabaseConnection.getInstance().getSequelize();

class Move extends Model<InferAttributes<Move>, InferCreationAttributes<Move>> {
  declare id: CreationOptional<number>;
  declare gameId: number;
  declare userId: CreationOptional<number | null>; // null = mossa dell'IA
  declare row: number;
  declare col: number;
  declare result: string;                          // 'hit' or 'miss'
  declare silenced: CreationOptional<boolean>;     // true = colpo sparato in silenzio
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Move.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    gameId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: true },
    row: { type: DataTypes.INTEGER, allowNull: false },
    col: { type: DataTypes.INTEGER, allowNull: false },
    result: { type: DataTypes.STRING, allowNull: false, validate: { isIn: [['hit', 'miss']] } },
    silenced:{ type:DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'moves', modelName: 'Move' },
);

export default Move;