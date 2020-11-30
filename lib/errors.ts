export class ApplicationError extends Error {
  message: string;
  statusCode: number;
  constructor(message?: string) {
    super();
    this.message = message || 'Application error';
    this.statusCode = 500;
  }
  get name(): string {
    return this.constructor.name;
  }
}

export class BadRequestError extends ApplicationError {
  constructor(message: string) {
    super(message);
    this.message = message || 'Bad request';
    this.statusCode = 400;
  }
}
export class NotFoundError extends ApplicationError {
  constructor(message: string) {
    super(message);
    this.message = message || 'Not found';
    this.statusCode = 404;
  }
}

// TODO: add more useful handling here
export const dbErrorHandler = (e: Error): undefined => {
  console.log('db error', e);
  throw new ApplicationError('Database error');
};
