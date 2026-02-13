type Handler<T> = (data: T) => void;

export class EventEmitter<T> {
  private handlers: Handler<T>[] = [];

  public on(handler: Handler<T>, options?: { addToStart: boolean }): void {
    if (options?.addToStart) {
      this.handlers.unshift(handler);
      return;
    }
    this.handlers.push(handler);
  }

  public off(handler: Handler<T>): void {
    this.handlers = this.handlers.filter((h) => h !== handler);
  }

  public emit(data: T) {
    this.handlers.forEach((h) => h(data));
  }
}
