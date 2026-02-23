export class RingBuffer<T> {
	private readonly capacity: number;
	private items: T[] = [];

	constructor(capacity: number) {
		if (!Number.isInteger(capacity) || capacity <= 0) {
			throw new Error("capacity must be a positive integer");
		}
		this.capacity = capacity;
	}

	push(item: T): void {
		this.items.push(item);
		if (this.items.length > this.capacity) {
			this.items.splice(0, this.items.length - this.capacity);
		}
	}

	toArray(): T[] {
		return [...this.items];
	}

	filter(predicate: (item: T) => boolean): T[] {
		return this.items.filter(predicate);
	}
}
