import MinHeap from '../utils/minHeap.ts';

describe('MinHeap Tests', () => {

  test('should create an empty MinHeap', () => {
    const minHeap = new MinHeap();
    expect(minHeap.getSize()).toBe(0);
  });

  test('should insert values into the MinHeap and maintain min property', () => {
    const minHeap = new MinHeap();
    minHeap.insert(1, 2);
    minHeap.insert(3, 4);
    expect(minHeap.getMin()).toEqual([1, 2]);
  });

  test('should extract the minimum value', () => {
    const minHeap = new MinHeap();
    minHeap.insert(1, 2);
    minHeap.insert(3, 4);
    expect(minHeap.extractMin()).toEqual([1, 2]);
    expect(minHeap.getMin()).toEqual([3, 4]);
  });

  test('should decrease the key of a vertex', () => {
    const minHeap = new MinHeap();
    minHeap.insert(1, 2);
    minHeap.insert(3, 4);
    minHeap.decreaseKey(4, 0);
    expect(minHeap.getMin()).toEqual([0, 4]);
  });

  test('should throw an error when extracting from an empty heap', () => {
    const minHeap = new MinHeap();
    expect(() => {
      minHeap.extractMin();
    }).toThrow(Error);
  });

  test('should throw an error when decreasing key of a non-existent vertex', () => {
    const minHeap = new MinHeap();
    expect(() => {
      minHeap.decreaseKey(1, 0);
    }).toThrow(Error);
  });

});