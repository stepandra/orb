export class OutlineError extends Error {
  constructor(message) {
    super(message); // 'Error' breaks prototype chain here
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    this.name = new.target.name;
  }
}
export class UnreachableServerError extends OutlineError {
  constructor(message) {
    super(message);
  }
}
export class ServerInstallCanceledError extends OutlineError {
  constructor(message) {
    super(message);
  }
}
export class ServerInstallFailedError extends OutlineError {
  constructor(message) {
    super(message);
  }
}
export class ServerApiError extends OutlineError {
  constructor(message, response) {
    super(message);
  }

  isNetworkError() {
    return !this.response;
  }
}
