/**
 * Test del middleware requireAdmim
 * ============================================================================
 * E' una funzione pura sul ruolo presente in req.user -> nessun mock necessario qui
 */

import { Request, Response, NextFunction } from 'express';
import { requireAdmin } from '../adminMiddleware';
import { AppError, ForbiddenError } from '../../errors/AppError';

const mockRequest = (role?: string): Request =>
  ({ user: role === undefined ? undefined : { id: 1, email: 'x@example.com', role } }) as Request;
const mockResponse = (): Response => ({}) as Response;

describe('adminMiddleware.requireAdmin', () => {
  it('lascia passare un amministratore', () => {
    const next = jest.fn() as NextFunction;

    requireAdmin(mockRequest('admin'), mockResponse(), next);

    expect(next).toHaveBeenCalledWith(); // next() senza argomenti = catena prosegue
  });

  it('nega con 403 un utente normale', () => {
    const next = jest.fn() as NextFunction;

    requireAdmin(mockRequest('user'), mockResponse(), next);

    const err = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(err).toBeInstanceOf(ForbiddenError);
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe('Operazione riservata agli amministratori');
  });

  it('nega con 403 se non c\'e\' alcun utente autenticato', () => {
    const next = jest.fn() as NextFunction;

    requireAdmin(mockRequest(), mockResponse(), next);

    const err = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(err).toBeInstanceOf(ForbiddenError);
    expect(err.statusCode).toBe(403);
  });
});