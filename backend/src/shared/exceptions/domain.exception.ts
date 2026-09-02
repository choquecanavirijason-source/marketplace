export class DomainException extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, code = 'DOMAIN_RULE_VIOLATION', statusCode = 400, details?: unknown) {
    super(message);
    this.name = 'DomainException';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entity: string, identifier: string | number) {
    super(`${entity} con identificador '${identifier}' no fue encontrado.`, 'ENTITY_NOT_FOUND', 404);
  }
}

export class DuplicateEntityException extends DomainException {
  constructor(entity: string, field: string, value: string) {
    super(`${entity} con ${field} '${value}' ya se encuentra registrado.`, 'DUPLICATE_ENTITY', 409);
  }
}

export class InvalidStateTransitionException extends DomainException {
  constructor(entity: string, from: string, to: string) {
    super(`Transición de estado no permitida para ${entity}: de '${from}' a '${to}'.`, 'INVALID_STATE_TRANSITION', 422);
  }
}
