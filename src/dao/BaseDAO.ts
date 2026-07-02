/**
 * Pattern DAO (Data Access Object): incapsula l'accesso ai dati via Sequelize.
 * La base astratta fornisce le operazioni CRUD comuni a tutte le entita', cosi' i
 * DAO concreti non ripetono codice e i service non toccano mai direttamente l'ORM.
  */ 

import { Model, ModelStatic, CreationAttributes, Attributes, WhereOptions } from 'sequelize';

export abstract class BaseDAO<M extends Model> {
  // Modello Sequelize gestito da questo DAO (User, Game, Move, ...)
  protected readonly model: ModelStatic<M>;

  // protected: impedisce "new BaseDAO()"; istanziabile solo tramite sottoclasse.
  protected constructor(model: ModelStatic<M>) {
    this.model = model;
  }

  // Crea un nuovo record
  public async create(data: CreationAttributes<M>): Promise<M> {
    return this.model.create(data);
  }

  // Trova per chiave primaria
  public async findByPk(id: number): Promise<M | null> {
    return this.model.findByPk(id);
  }

  // Tutti i record
  public async findAll(): Promise<M[]> {
    return this.model.findAll();
  }

  // Primo record che soddisfa la condizione
  public async findOne(where: WhereOptions<Attributes<M>>): Promise<M | null> {
    return this.model.findOne({ where });
  }

  // Aggiorna il record: restituisce l'istanza aggiornata, o null se non trovato
  public async update(id: number, data: Partial<Attributes<M>>): Promise<M | null> {
    const instance = await this.model.findByPk(id);
    if (instance === null) return null;
    return instance.update(data);
  }

  // Elimina il record: true se eliminato, false se non trovato
  public async delete(id: number): Promise<boolean> {
    const instance = await this.model.findByPk(id);
    if (instance === null) return false;
    await instance.destroy();
    return true;
  }
}