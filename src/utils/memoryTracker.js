/**
 * Memory tracking utilities for detecting memory leaks
 * Uses Chrome DevTools API if available
 */

export class MemoryTracker {
  constructor(name) {
    this.name = name;
    this.measurements = [];
    this.startTime = Date.now();
    this.hasPerformanceMemory =
      typeof performance !== 'undefined' &&
      typeof performance.memory !== 'undefined';
  }

  /**
   * Take a memory snapshot
   */
  snapshot(label = '') {
    const measurement = {
      timestamp: Date.now(),
      label: label,
      timeElapsed: Date.now() - this.startTime,
    };

    if (this.hasPerformanceMemory) {
      measurement.heapSizeLimit = performance.memory.jsHeapSizeLimit;
      measurement.usedJSHeapSize = performance.memory.usedJSHeapSize;
      measurement.totalJSHeapSize = performance.memory.totalJSHeapSize;
    }

    this.measurements.push(measurement);
    return measurement;
  }

  /**
   * Get memory increase since last snapshot
   */
  getHeapIncrease() {
    if (this.measurements.length < 2) return null;

    const last = this.measurements[this.measurements.length - 1];
    const prev = this.measurements[this.measurements.length - 2];

    if (!last.usedJSHeapSize || !prev.usedJSHeapSize) return null;

    return {
      increase: last.usedJSHeapSize - prev.usedJSHeapSize,
      increasePercent:
        ((last.usedJSHeapSize - prev.usedJSHeapSize) / prev.usedJSHeapSize) *
        100,
    };
  }

  /**
   * Get all measurements
   */
  getMeasurements() {
    return this.measurements;
  }

  /**
   * Print formatted report
   */
  printReport() {
    console.group(`Memory Report: ${this.name}`);
    this.measurements.forEach((m, idx) => {
      console.log(
        `[${idx}] ${m.label} - Used Heap: ${this.formatBytes(m.usedJSHeapSize)} (${m.timeElapsed}ms)`
      );
    });
    console.groupEnd();
  }

  /**
   * Format bytes to human readable
   */
  static formatBytes(bytes) {
    if (!bytes) return 'N/A';
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  formatBytes(bytes) {
    return MemoryTracker.formatBytes(bytes);
  }
}

/**
 * Global memory tracker instance
 */
let globalTracker = null;

export function initGlobalMemoryTracker(name = 'Global') {
  globalTracker = new MemoryTracker(name);
  return globalTracker;
}

export function getGlobalMemoryTracker() {
  return globalTracker;
}
