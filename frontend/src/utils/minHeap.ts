class MinHeap {
  heap: number[][];

  heapsize: number;

  vertexMap: Map<number, number>;

  constructor() {
    this.heap = [];
    this.vertexMap = new Map();
    this.heapsize = 0;
  }

  // Helper Functions
  getParent(idx: number) {
    return Math.floor(idx / 2);
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

    if (l <= this.heapsize - 1 && this.heap[l][0] < this.heap[idx][0]) {
      smallest = l;
    }
    if (r <= this.heapsize - 1 && this.heap[r][0] > this.heap[smallest][0]) {
      smallest = r;
    }

    if (smallest !== idx) {
      [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
      this.minHeapify(smallest);
    }
  }

  // User Functions
  getMin() {
    return this.heap[0];
  }

  getSize() {
    return this.heapsize;
  }

  insert(dist: number, vertIdx: number) {
    this.heapsize += 1;
    this.heap[this.heapsize - 1] = [Number.MAX_VALUE, vertIdx];
    this.vertexMap.set(vertIdx, this.heapsize - 1);
    this.decreaseKey(this.heapsize - 1, dist);
  }

  extractMin() {
    if (this.heapsize < 1) {
      throw new Error();
    }
    const min = this.getMin();
    this.heap[0] = this.heap[this.heapsize - 1];
    this.heapsize -= 1;
    this.minHeapify(1);

    return min;
  }

  decreaseKey(vertIdx: number, key: number) {
    let heapIdx = this.vertexMap.get(vertIdx);
    if (heapIdx === undefined) {
      throw new Error();
    }
    if (key > this.heap[heapIdx][0]) {
      return;
    }

    this.heap[heapIdx][0] = key;
    let parentIdx = this.getParent(heapIdx);
    while (heapIdx > 0 && this.heap[parentIdx][0] > this.heap[heapIdx][0]) {
      [this.heap[heapIdx], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[heapIdx]];
      heapIdx = parentIdx;
      parentIdx = this.getParent(heapIdx);
    }
  }
}

export default MinHeap;
