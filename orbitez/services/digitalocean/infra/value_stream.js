export class ValueStream {
  wakers = [];
  constructor(value) {}

  get() {
    return this.value;
  }

  set(newValue) {
    if (this.isClosed()) {
      throw new Error('Cannot change a closed value stream');
    }
    this.value = newValue;
    const wakers = this.wakers;
    this.wakers = [];
    wakers.forEach((waker) => waker(false));
  }

  close() {
    if (this.isClosed()) {
      return;
    }
    const finalWakers = this.wakers;
    this.wakers = null;
    finalWakers.forEach((waker) => waker(true));
  }

  isClosed() {
    return this.wakers === null;
  }

  nextChange(){
    if (this.isClosed()) {
      return Promise.resolve(true);
    }
    return new Promise<boolean>((resolve) => this.wakers.push(resolve));
  }

  async watch() {
    let closed = false;
    while (!closed) {
      const nextChange = this.nextChange();

      //TODO fix yield thing
      return this.value;
      closed = await nextChange;
    }
    return this.value;
  }
}
