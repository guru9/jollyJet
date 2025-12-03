export class AppError extends Error {
  public readonly statusCode: number = 400;
  public readonly isOperational: boolean = true;

  constructor(message: string) {
    super(message);
    this.statusCode = this.statusCode;

    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    Error.captureStackTrace(this);
  }
}

export class NotFoundError extends AppError {
  public readonly statusCode: number = 404;
  constructor(message: string = 'Resource not found') {
    super(message);
    this.statusCode = this.statusCode;
  }
}

export class ValidationError extends AppError {
  public readonly statusCode: number = 400;
  constructor(message: string = 'Validation failed') {
    super(message);
    this.statusCode = this.statusCode;
  }
}

export class UnauthorizedError extends AppError {
  public readonly statusCode: number = 401;
  constructor(message: string = 'Unauthorized access') {
    super(message);
    this.statusCode = this.statusCode;
  }
}

export class ForbiddenError extends AppError {
  public readonly statusCode: number = 403;
  constructor(message: string = 'Forbidden access') {
    super(message);
    this.statusCode = this.statusCode;
  }
}

export class InternalServerError extends AppError {
  public readonly statusCode: number = 500;
  constructor(message: string = 'Internal server error') {
    super(message);
    this.statusCode = this.statusCode;
  }
}
