import { Grid, Direction } from '../types';

export const createEmptyGrid = (): Grid => {
  return Array.from({ length: 4 }, () => Array(4).fill(0));
};

export const getEmptyCoordinates = (grid: Grid): { x: number; y: number }[] => {
  const coordinates: { x: number; y: number }[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) {
        coordinates.push({ x: r, y: c });
      }
    }
  }
  return coordinates;
};

export const addRandomTile = (grid: Grid): Grid => {
  const emptyCoords = getEmptyCoordinates(grid);
  if (emptyCoords.length === 0) return grid;

  const randomCoord = emptyCoords[Math.floor(Math.random() * emptyCoords.length)];
  const newGrid = grid.map((row) => [...row]);
  newGrid[randomCoord.x][randomCoord.y] = Math.random() < 0.9 ? 2 : 4;
  return newGrid;
};

// Logic to slide and merge a single row to the left
const slideRow = (row: number[]): { newRow: number[]; score: number } => {
  // 1. Filter out zeros
  let filtered = row.filter((num) => num !== 0);
  let score = 0;

  // 2. Merge adjacent equals
  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i + 1]) {
      filtered[i] *= 2;
      score += filtered[i];
      filtered[i + 1] = 0;
    }
  }

  // 3. Filter out zeros created by merge
  filtered = filtered.filter((num) => num !== 0);

  // 4. Pad with zeros
  while (filtered.length < 4) {
    filtered.push(0);
  }

  return { newRow: filtered, score };
};

export const moveGrid = (
  grid: Grid,
  direction: Direction
): { grid: Grid; score: number; moved: boolean } => {
  let newGrid = grid.map((row) => [...row]);
  let score = 0;
  let moved = false;

  if (direction === Direction.LEFT) {
    for (let r = 0; r < 4; r++) {
      const result = slideRow(newGrid[r]);
      if (JSON.stringify(newGrid[r]) !== JSON.stringify(result.newRow)) {
        moved = true;
      }
      newGrid[r] = result.newRow;
      score += result.score;
    }
  } else if (direction === Direction.RIGHT) {
    for (let r = 0; r < 4; r++) {
      const reversed = [...newGrid[r]].reverse();
      const result = slideRow(reversed);
      const finalRow = result.newRow.reverse();
      if (JSON.stringify(newGrid[r]) !== JSON.stringify(finalRow)) {
        moved = true;
      }
      newGrid[r] = finalRow;
      score += result.score;
    }
  } else if (direction === Direction.UP) {
    for (let c = 0; c < 4; c++) {
      const col = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
      const result = slideRow(col);
      for (let r = 0; r < 4; r++) {
        if (newGrid[r][c] !== result.newRow[r]) {
          moved = true;
        }
        newGrid[r][c] = result.newRow[r];
      }
      score += result.score;
    }
  } else if (direction === Direction.DOWN) {
    for (let c = 0; c < 4; c++) {
      const col = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
      const reversed = col.reverse();
      const result = slideRow(reversed);
      const finalCol = result.newRow.reverse();
      for (let r = 0; r < 4; r++) {
        if (newGrid[r][c] !== finalCol[r]) {
          moved = true;
        }
        newGrid[r][c] = finalCol[r];
      }
      score += result.score;
    }
  }

  return { grid: newGrid, score, moved };
};

export const checkGameOver = (grid: Grid): boolean => {
  // Check for empty cells
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) return false;
    }
  }

  // Check for possible horizontal merges
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      if (grid[r][c] === grid[r][c + 1]) return false;
    }
  }

  // Check for possible vertical merges
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 3; r++) {
      if (grid[r][c] === grid[r + 1][c]) return false;
    }
  }

  return true;
};

export const hasWon = (grid: Grid): boolean => {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] >= 2048) return true;
    }
  }
  return false;
};