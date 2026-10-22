/**
 * Generates large workbook data for memory leak reproduction
 * Simulates customer scenario: ~250,000 rows x 10 columns
 */

export function generateLargeWorkbookData(rowCount = 10000, colCount = 10) {
  const sheets = [];
  const sheetData = [];

  // Generate rows of data
  for (let row = 0; row < rowCount; row++) {
    const rowData = [];
    for (let col = 0; col < colCount; col++) {
      rowData.push(`Row${row + 1}Col${col + 1}`);
    }
    sheetData.push(rowData);
  }

  // Create sheet with data
  sheets.push({
    name: 'Sheet1',
    rows: sheetData.map((data, idx) => ({
      index: idx,
      cells: data.map((cellData, colIdx) => ({
        index: colIdx,
        value: cellData,
      })),
    })),
    columns: Array.from({ length: colCount }, (_, i) => ({
      index: i,
      width: 100,
    })),
  });

  return {
    sheets: sheets,
  };
}

/**
 * Simulates memory pressure by creating large objects
 * This helps identify if the issue is related to data retention
 */
export function createMemoryIntensiveData(sizeInMB = 50) {
  const arraySize = (sizeInMB * 1024 * 1024) / 8; // 8 bytes per double in JS
  const arr = new Array(Math.floor(arraySize));
  for (let i = 0; i < arr.length; i++) {
    arr[i] = Math.random();
  }
  return arr;
}

/**
 * Get approximate size of an object in bytes
 * Note: This is an approximation and not 100% accurate
 */
export function getObjectSize(obj) {
  const seen = new WeakSet();

  function sizeOf(object) {
    if (object === null) return 0;
    if (typeof object !== 'object') return 0;
    if (seen.has(object)) return 0;

    seen.add(object);

    let bytes = 0;
    for (const key in object) {
      bytes += sizeOf(object[key]);
    }

    return bytes;
  }

  return sizeOf(obj);
}
