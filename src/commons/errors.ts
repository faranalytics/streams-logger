export class QueueSizeLimitExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QueueSizeLimitExceededError";
  }
}