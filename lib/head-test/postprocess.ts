// mask_post_processor.dart (0e2467a3) 직역.
// 마스크는 Uint8Array(0/1) 256*256, 인덱스 규약 idx = y * MASK_SIZE + x.

export const MASK_SIZE = 256;
const REFERENCE_DIAMETER = 180.0;

export type PostProcessMode = "none" | "opening" | "largestBlob" | "largestBlobOpening";

export function process(
  mask: Uint8Array,
  mode: PostProcessMode,
  openingKernelSize = 5,
): Uint8Array {
  if (mask.length !== MASK_SIZE * MASK_SIZE) return mask;
  if (mode === "none") return mask;

  let result = mask;
  if (mode === "largestBlob" || mode === "largestBlobOpening") {
    result = applyLargestBlob(result);
  }
  if (mode === "opening" || mode === "largestBlobOpening") {
    result = applyNormalizedClosing(result, openingKernelSize);
    result = applyNormalizedOpening(result, openingKernelSize);
  }
  return result;
}

export function applyLargestBlob(mask: Uint8Array): Uint8Array {
  const visited = new Uint8Array(MASK_SIZE * MASK_SIZE);
  const blobs: number[][] = [];

  for (let y = 0; y < MASK_SIZE; y++) {
    for (let x = 0; x < MASK_SIZE; x++) {
      const idx = y * MASK_SIZE + x;
      if (!visited[idx] && get(mask, x, y)) {
        const blob = bfsFloodFill(mask, x, y, visited);
        if (blob.length > 0) blobs.push(blob);
      }
    }
  }
  if (blobs.length === 0) return mask;

  const largest = blobs.reduce((a, b) => (a.length > b.length ? a : b));
  const result = new Uint8Array(MASK_SIZE * MASK_SIZE);
  for (const idx of largest) result[idx] = 1;
  return result;
}

function bfsFloodFill(
  mask: Uint8Array,
  startX: number,
  startY: number,
  visited: Uint8Array,
): number[] {
  const queue: number[] = [];
  const startIdx = startY * MASK_SIZE + startX;
  queue.push(startIdx);
  visited[startIdx] = 1;

  const dx = [0, 1, 0, -1];
  const dy = [-1, 0, 1, 0];

  let front = 0;
  while (front < queue.length) {
    const idx = queue[front++];
    const y = Math.floor(idx / MASK_SIZE);
    const x = idx % MASK_SIZE;
    for (let i = 0; i < 4; i++) {
      const nx = x + dx[i];
      const ny = y + dy[i];
      if (nx < 0 || nx >= MASK_SIZE || ny < 0 || ny >= MASK_SIZE) continue;
      const nidx = ny * MASK_SIZE + nx;
      if (!visited[nidx] && get(mask, nx, ny)) {
        visited[nidx] = 1;
        queue.push(nidx);
      }
    }
  }
  return queue;
}

export function applyNormalizedClosing(mask: Uint8Array, baseKernelSize = 5): Uint8Array {
  const k = normalizedKernel(mask, baseKernelSize);
  if (k === null) return mask;
  return applyClosing(mask, k);
}

export function applyNormalizedOpening(mask: Uint8Array, baseKernelSize = 5): Uint8Array {
  const k = normalizedKernel(mask, baseKernelSize);
  if (k === null) return mask;
  return applyOpening(mask, k);
}

function normalizedKernel(mask: Uint8Array, baseKernelSize: number): number | null {
  let minX = MASK_SIZE, maxX = 0, minY = MASK_SIZE, maxY = 0;
  for (let y = 0; y < MASK_SIZE; y++) {
    for (let x = 0; x < MASK_SIZE; x++) {
      if (mask[y * MASK_SIZE + x]) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX <= minX || maxY <= minY) return null;

  const headDiameter = Math.max(maxX - minX, maxY - minY);
  const scale = headDiameter / REFERENCE_DIAMETER;
  let k = Math.round(baseKernelSize * scale); // 인자가 항상 양수라 Dart round와 일치
  if (k < 3) k = 3;
  if (k % 2 === 0) k += 1;
  return k;
}

function applyClosing(mask: Uint8Array, kernelSize: number): Uint8Array {
  const k = kernelSize % 2 === 1 ? kernelSize : kernelSize + 1;
  return erode(dilate(mask, k), k);
}

function applyOpening(mask: Uint8Array, kernelSize: number): Uint8Array {
  const k = kernelSize % 2 === 1 ? kernelSize : kernelSize + 1;
  return dilate(erode(mask, k), k);
}

function erode(mask: Uint8Array, k: number): Uint8Array {
  const half = Math.floor(k / 2);
  const result = new Uint8Array(MASK_SIZE * MASK_SIZE);
  for (let y = half; y < MASK_SIZE - half; y++) {
    for (let x = half; x < MASK_SIZE - half; x++) {
      let allTrue = true;
      for (let dy = -half; dy <= half && allTrue; dy++) {
        for (let dx = -half; dx <= half && allTrue; dx++) {
          if (!get(mask, x + dx, y + dy)) allTrue = false;
        }
      }
      result[y * MASK_SIZE + x] = allTrue ? 1 : 0;
    }
  }
  return result;
}

function dilate(mask: Uint8Array, k: number): Uint8Array {
  const half = Math.floor(k / 2);
  const result = Uint8Array.from(mask);
  for (let y = 0; y < MASK_SIZE; y++) {
    for (let x = 0; x < MASK_SIZE; x++) {
      if (get(mask, x, y)) {
        for (let dy = -half; dy <= half; dy++) {
          for (let dx = -half; dx <= half; dx++) {
            set(result, x + dx, y + dy);
          }
        }
      }
    }
  }
  return result;
}

function get(mask: Uint8Array, x: number, y: number): boolean {
  if (x < 0 || x >= MASK_SIZE || y < 0 || y >= MASK_SIZE) return false;
  return mask[y * MASK_SIZE + x] !== 0;
}

function set(mask: Uint8Array, x: number, y: number): void {
  if (x >= 0 && x < MASK_SIZE && y >= 0 && y < MASK_SIZE) {
    mask[y * MASK_SIZE + x] = 1;
  }
}
