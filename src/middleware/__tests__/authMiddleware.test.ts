/**
 * Test del middleware di autenticazione.
 * =======================================
 * TokenService e' sostituito da un mock: i test non dipendono dalle chiavi RS256
 * ne' dal filesystem, e restano deterministici.
 */

import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../authMiddleware';
import tokenService, { JwtUserPayload } from '../../service/TokenService';
import { AppError, UnauthorizedError } from '../../errors/AppError';

// Mock del modulo TokenService
jest.mock('../../service/TokenService', () => ({
  __esModule: true,
  default: { verify: jest.fn(), sign: jest.fn() },
}));

const verifyMock = tokenService.verify as jest.MockedFunction<typeof tokenService.verify>;

// Helper: costruisce req/res/next finti.
const mockRequest = (authorization?: string): Request =>
  ({ headers: authorization === undefined ? {} : { authorization } }) as Request;
const mockResponse = (): Response => ({}) as Response;

describe('authMiddleware.authenticate', () => {
  const payload: JwtUserPayload = { id: 2, email: 'alice@example.com', role: 'user' };

  it('nega con 401 se l\'header Authorization e\' assente', () => {
    const req = mockRequest();
    const next = jest.fn() as NextFunction;

    authenticate(req, mockResponse(), next);

    const err = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Token mancante o malformato');
    expect(verifyMock).not.toHaveBeenCalled(); // non tenta nemmeno la verifica
    expect(req.user).toBeUndefined();
  });

  it('nega con 401 se l\'header non e\' nel formato "Bearer <token>"', () => {
    const req = mockRequest('Basic abc123');
    const next = jest.fn() as NextFunction;

    authenticate(req, mockResponse(), next);

    const err = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.statusCode).toBe(401);
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it('inoltra l\'errore se il token non e\' valido', () => {
    verifyMock.mockImplementation(() => {
      throw new UnauthorizedError('Token non valido');
    });
    const req = mockRequest('Bearer token-fasullo');
    const next = jest.fn() as NextFunction;

    authenticate(req, mockResponse(), next);

    const err = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.message).toBe('Token non valido');
    expect(req.user).toBeUndefined(); // la catena si ferma: nessun utente autenticato
  });

  it('inoltra l\'errore se il token e\' scaduto', () => {
    verifyMock.mockImplementation(() => {
      throw new UnauthorizedError('Token scaduto');
    });
    const req = mockRequest('Bearer token-scaduto');
    const next = jest.fn() as NextFunction;

    authenticate(req, mockResponse(), next);

    const err = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Token scaduto');
  });

  it('con token valido popola req.user e passa al middleware successivo', () => {
    verifyMock.mockReturnValue(payload);
    const req = mockRequest('Bearer token-valido');
    const next = jest.fn() as NextFunction;

    authenticate(req, mockResponse(), next);

    expect(verifyMock).toHaveBeenCalledWith('token-valido'); // token estratto dopo "Bearer "
    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalledWith(); // next() senza argomenti = catena prosegue
  });
});