/**
 * Test del middleware credito
 * =====================================================================
 * UserDAO e' sostituito da un mock: nessun database, test deterministici.
 * Regola: il credito e' esaurito quando <= 0 -> 401.
 */

import { Request, Response, NextFunction } from 'express';
import { checkCredit } from '../creditMiddleware';
import userDAO from '../../dao/UserDAO';
import User from '../../model/User';
import { AppError, UnauthorizedError } from '../../errors/AppError';

// Mock del modulo UserDAO
jest.mock('../../dao/UserDAO', () => ({
  __esModule: true,
  default: { findByPk: jest.fn() },
}));

const findByPkMock = userDAO.findByPk as jest.MockedFunction<typeof userDAO.findByPk>;

// Helper: request con utente gia' autenticato (authenticate ha popolato req.user).
const mockRequest = (): Request =>
  ({ user: { id: 2, email: 'alice@example.com', role: 'user' } }) as Request;
const mockResponse = (): Response => ({}) as Response;

// Helper: finto utente con un dato credito (basta il campo tokens).
const userWithTokens = (tokens: number): User => ({ id: 2, tokens }) as User;

describe('creditMiddleware.checkCredit', () => {
  it('lascia passare se il credito e\' positivo', async () => {
    findByPkMock.mockResolvedValue(userWithTokens(4.65));
    const req = mockRequest();
    const next = jest.fn() as NextFunction;

    await checkCredit(req, mockResponse(), next);

    expect(findByPkMock).toHaveBeenCalledWith(2); // saldo letto dal DB, non dal JWT
    expect(next).toHaveBeenCalledWith(); // next() senza argomenti = catena prosegue
  });

  it('nega con 401 se il credito e\' esattamente zero', async () => {
    findByPkMock.mockResolvedValue(userWithTokens(0));
    const next = jest.fn() as NextFunction;

    await checkCredit(mockRequest(), mockResponse(), next);

    const err = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Credito esaurito');
  });

  it('nega con 401 se il credito e\' negativo', async () => {
    findByPkMock.mockResolvedValue(userWithTokens(-0.02));
    const next = jest.fn() as NextFunction;

    await checkCredit(mockRequest(), mockResponse(), next);

    const err = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Credito esaurito');
  });

  it('nega con 401 se l\'utente non esiste piu\'', async () => {
    findByPkMock.mockResolvedValue(null);
    const next = jest.fn() as NextFunction;

    await checkCredit(mockRequest(), mockResponse(), next);

    const err = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.message).toBe('Utente non trovato');
  });

  it('inoltra all\'errorHandler un errore del database', async () => {
    const dbError = new Error('connessione persa');
    findByPkMock.mockRejectedValue(dbError);
    const next = jest.fn() as NextFunction;

    await checkCredit(mockRequest(), mockResponse(), next);

    // Non e' un AppError: verra' tradotto in 500 dall'errorHandler.
    expect(next).toHaveBeenCalledWith(dbError);
  });
});