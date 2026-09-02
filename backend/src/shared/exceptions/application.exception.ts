export class ApplicationException extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, code = 'APPLICATION_ERROR', statusCode = 400, details?: unknown) {
    super(message);
    this.name = 'ApplicationException';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnauthorizedException extends ApplicationException {
  constructor(message = 'No autorizado para acceder a este recurso.') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ForbiddenException extends ApplicationException {
  constructor(message = 'Acceso denegado. Permisos o nivel KYC insuficientes.') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class NotFoundException extends ApplicationException {
  constructor(entity = 'Recurso', identifier?: string) {
    super(
      identifier
        ? `${entity} con identificador '${identifier}' no fue encontrado.`
        : `${entity} no encontrado.`,
      'NOT_FOUND',
      404,
    );
  }
}

export class BadRequestException extends ApplicationException {
  constructor(message = 'Solicitud incorrecta.') {
    super(message, 'BAD_REQUEST', 400);
  }
}
