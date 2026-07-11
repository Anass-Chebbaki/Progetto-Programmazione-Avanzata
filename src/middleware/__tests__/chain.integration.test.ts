/**
 * Test di INTEGRAZIONE della catena di middleware
 * ==============================================================================
 * Dimostrazione della CoR:
 * authenticate -> checkCredit -> handler ... -> errorHandler
 * Verifica che gli errori sollevati dagli anelli diventino risposte JSON coerenti,
 * prodotte dall'unico middleware terminale (errorHandler).
 * TokenService e UserDAO sono mockati (quindi nessuna chiave RS256, nessun database)
 */

import express, { Express, Request, Response } from 'express';
import request from 'supertest';
import { authenticate } from '../authMiddleware';
import { checkCredit } from '../creditMiddleware';
import { errorHandler } from '../errorHandler';
import tokenService from '../../service/TokenService';
import userDAO from '../../dao/UserDAO';
import User from '../../model/User';

jest.mock('../../service/TokenService', () => ({
  __esModule: true,
  default: { verify: jest.fn(), sign: jest.fn() },
}));
jest.mock('../../dao/UserDAO', () => ({
  __esModule: true,
  default: { findByPk: jest.fn() },
}));

const verifyMock = tokenService.verify as jest.MockedFunction<typeof tokenService.verify>;
const findByPkMock = userDAO.findByPk as jest.MockedFunction<typeof userDAO.findByPk>;

// App minimale con la STESSA catena delle rotte di gioco protette.
const buildApp = (): Express => {
  const app = express();
  app.get('/protetta', authenticate, checkCredit, (req: Request, res: Response) => {
    res.status(200).json({ ok: true, userId: req.user!.id });
  });
  app.use(errorHandler); // middleware terminale: sempre per ultimo
  return app;
};

const userWithTokens = (tokens: number): User => ({ id: 2, tokens }) as User;

describe('catena authenticate -> checkCredit -> errorHandler', () => {
  it('senza token risponde 401 con il JSON di errore standard', async () => {
    const res = await request(buildApp()).get('/protetta');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      error: { name: 'UnauthorizedError', message: 'Token mancante o malformato' },
    });
    expect(findByPkMock).not.toHaveBeenCalled(); // la catena si ferma al primo anello
  });

  it('con credito esaurito risponde 401 e non raggiunge l\'handler', async () => {
    verifyMock.mockReturnValue({ id: 2, email: 'alice@example.com', role: 'user' });
    findByPkMock.mockResolvedValue(userWithTokens(0));

    const res = await request(buildApp()).get('/protetta').set('Authorization', 'Bearer valido');

    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Credito esaurito');
  });

  it('con token valido e credito positivo raggiunge l\'handler (200)', async () => {
    verifyMock.mockReturnValue({ id: 2, email: 'alice@example.com', role: 'user' });
    findByPkMock.mockResolvedValue(userWithTokens(4.65));

    const res = await request(buildApp()).get('/protetta').set('Authorization', 'Bearer valido');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, userId: 2 });
  });

  it('un errore imprevisto diventa un 500 generico (nessun dettaglio interno esposto)', async () => {
    verifyMock.mockReturnValue({ id: 2, email: 'alice@example.com', role: 'user' });
    findByPkMock.mockRejectedValue(new Error('connessione persa'));
    // L'errorHandler logga l'errore: silenzio il console.error nel test.
    const logSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(buildApp()).get('/protetta').set('Authorization', 'Bearer valido');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: { name: 'InternalServerError', message: 'Errore interno del server' },
    });
    expect(res.text).not.toContain('connessione persa'); // dettagli interni non esposti
    logSpy.mockRestore();
  });
});