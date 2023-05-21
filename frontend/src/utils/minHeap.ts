class MinHeap {
  // will currently implement just keys themselves, but will need to implement based on kv pairs
  heap: number[];
  heapsize: number;

  constructor () {
    this.heap = [];
    this.heapsize = 0;
  }

  // Helper Functions
  getParent(idx: number) {
    return Math.floor(idx / 2)
  }
  getLeftChild(idx: number) {
    return 2 * idx;
  }
  getRightChild(idx: number) {
    return 2 * idx + 1;
  }
  minHeapify(idx: number) {
    const l = this.getLeftChild(idx);
    const r = this.getRightChild(idx);
    let smallest = idx;

    if (l <= this.heapsize - 1 && this.heap[l] < this.heap[idx]) {
      smallest = l;
    }
    if (r <= this.heapsize - 1 && this.heap[r] > this.heap[smallest]) {
      smallest = r;
    }

    if (smallest !== idx) {
      [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
      this.minHeapify(smallest);
    }
  }

  // User Functions
  getMin() {
    return this.heap[1];
  }
  insert(num: number) {
    this.heapsize++;
    this.heap[this.heapsize - 1] = Number.MAX_VALUE;
    this.decreaseKey(this.heapsize - 1, num);
  }
  extractMin() {
    if (this.heapsize < 1) {
      throw new Error;
    }
    const min = this.getMin();
    this.heap[0] = this.heap[this.heapsize - 1];
    this.heapsize--;
    this.minHeapify(1);

    return min;
  }
  decreaseKey(idx: number, key: number) {
    if (key > this.heap[idx]) {
      throw new Error;
    }
    this.heap[idx] = key;
    let parent = this.getParent(idx);
    while (idx > 0 && this.heap[parent] > this.heap[idx]) {
      [this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]];
      idx = parent;
      parent = this.getParent(idx);
    } 
  }
}