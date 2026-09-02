export class InfrastructureException extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, code = 'INFRASTRUCTURE_ERROR', statusCode = 503, details?: unknown) {
    super(message);
    this.name = 'InfrastructureException';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ExternalServiceException extends InfrastructureException {
  constructor(serviceName: string, originalError?: unknown) {
    super(`Falla en la comunicación con el servicio externo: ${serviceName}`, 'EXTERNAL_SERVICE_FAILURE', 502, originalError);
  }
}
