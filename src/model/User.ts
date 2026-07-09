// definizione del wiring nel db
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import DatabaseConnection from '../config/database';

// Unica istanza Sequelize (approcio Singleton): tutti i modelli condividono la stessa connessione.
const sequelize = DatabaseConnection.getInstance().getSequelize();

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare email: string;
  declare role: CreationOptional<string>;       // 'user' | 'admin'
  declare tokens: CreationOptional<number>;      // credito (frazionario)
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user',
      validate: { isIn: [['user', 'admin']] }, 
    },
    tokens: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      defaultValue: 0,
      get(): number {
        // I DECIMAL arrivano come stringa con sequelize -> li convertiamo in number.
        const raw = this.getDataValue('tokens');
        return raw === null || raw === undefined ? 0 : Number(raw);
      },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'users', modelName: 'User' },
);

export default User;