import {
  GameState,
  FallingPair,
  Puyo,
  Cell,
  Position,
  PuyoColor,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  COLORS,
} from './types';

export function createEmptyBoard(): Cell[][] {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => ({
      puyo: null,
      isPopping: false,
    }))
  );
}

let puyoIdCounter = 0;

export function generateRandomPuyo(): Puyo {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  puyoIdCounter++;
  return {
    color,
    id: `puyo-${Date.now()}-${puyoIdCounter}-${Math.random().toString(36).substring(2, 9)}`,
  };
}

export function generateFallingPair(): FallingPair {
  return {
    main: generateRandomPuyo(),
    sub: generateRandomPuyo(),
    position: { row: 1, col: Math.floor(BOARD_WIDTH / 2) },
    subOffset: { row: -1, col: 0 }, // Sub puyo starts above main
    rotation: 0,
  };
}

export function createInitialGameState(): GameState {
  return {
    board: createEmptyBoard(),
    currentPair: null, // Start with no current pair, spawnNextPair will be called
    nextPair: generateFallingPair(),
    score: 0,
    currentChain: 0,
    maxChain: 0,
    isGameOver: false,
    isPaused: false,
    isChaining: false,
  };
}

export function canMovePair(
  board: Cell[][],
  pair: FallingPair,
  offsetRow: number,
  offsetCol: number
): boolean {
  const mainRow = pair.position.row + offsetRow;
  const mainCol = pair.position.col + offsetCol;
  const subRow = mainRow + pair.subOffset.row;
  const subCol = mainCol + pair.subOffset.col;

  // Check bounds and collision for main puyo
  if (
    mainRow < 0 ||
    mainRow >= BOARD_HEIGHT ||
    mainCol < 0 ||
    mainCol >= BOARD_WIDTH ||
    board[mainRow][mainCol].puyo !== null
  ) {
    return false;
  }

  // Check bounds and collision for sub puyo
  if (
    subRow < 0 ||
    subRow >= BOARD_HEIGHT ||
    subCol < 0 ||
    subCol >= BOARD_WIDTH ||
    board[subRow][subCol].puyo !== null
  ) {
    return false;
  }

  return true;
}

export function movePair(
  state: GameState,
  offsetRow: number,
  offsetCol: number
): GameState {
  if (!state.currentPair) return state;

  if (canMovePair(state.board, state.currentPair, offsetRow, offsetCol)) {
    return {
      ...state,
      currentPair: {
        ...state.currentPair,
        position: {
          row: state.currentPair.position.row + offsetRow,
          col: state.currentPair.position.col + offsetCol,
        },
      },
    };
  }

  return state;
}

export function rotatePair(state: GameState, clockwise: boolean): GameState {
  if (!state.currentPair) return state;

  const { subOffset } = state.currentPair;
  let newOffset: Position;

  if (clockwise) {
    // Clockwise rotation: (row, col) -> (-col, row)
    newOffset = { row: -subOffset.col, col: subOffset.row };
  } else {
    // Counter-clockwise: (row, col) -> (col, -row)
    newOffset = { row: subOffset.col, col: -subOffset.row };
  }

  const newRotation = clockwise
    ? (state.currentPair.rotation + 90) % 360
    : (state.currentPair.rotation - 90 + 360) % 360;

  const testPair: FallingPair = {
    ...state.currentPair,
    subOffset: newOffset,
    rotation: newRotation,
  };

  // Try rotation at current position
  if (canMovePair(state.board, testPair, 0, 0)) {
    return {
      ...state,
      currentPair: testPair,
    };
  }

  // Try wall kick left
  if (canMovePair(state.board, testPair, 0, -1)) {
    return {
      ...state,
      currentPair: {
        ...testPair,
        position: {
          row: testPair.position.row,
          col: testPair.position.col - 1,
        },
      },
    };
  }

  // Try wall kick right
  if (canMovePair(state.board, testPair, 0, 1)) {
    return {
      ...state,
      currentPair: {
        ...testPair,
        position: {
          row: testPair.position.row,
          col: testPair.position.col + 1,
        },
      },
    };
  }

  return state;
}

export function lockPair(state: GameState): GameState {
  if (!state.currentPair) return state;

  const newBoard = state.board.map((row) => row.map((cell) => ({ ...cell })));
  const { main, sub, position, subOffset } = state.currentPair;

  // Lock main puyo
  newBoard[position.row][position.col].puyo = main;

  // Lock sub puyo
  const subRow = position.row + subOffset.row;
  const subCol = position.col + subOffset.col;
  newBoard[subRow][subCol].puyo = sub;

  return {
    ...state,
    board: newBoard,
    currentPair: null,
    isChaining: true,  // 連鎖処理を開始
    currentChain: 0,   // 連鎖カウントをリセット
  };
}

export function applyGravity(board: Cell[][]): Cell[][] {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));

  // Process each column from bottom to top
  for (let col = 0; col < BOARD_WIDTH; col++) {
    let writeRow = BOARD_HEIGHT - 1;

    for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
      if (newBoard[row][col].puyo !== null) {
        if (row !== writeRow) {
          newBoard[writeRow][col].puyo = newBoard[row][col].puyo;
          newBoard[row][col].puyo = null;
        }
        writeRow--;
      }
    }
  }

  return newBoard;
}

export function findConnectedPuyos(
  board: Cell[][],
  row: number,
  col: number,
  color: PuyoColor,
  visited: boolean[][]
): Position[] {
  if (
    row < 0 ||
    row >= BOARD_HEIGHT ||
    col < 0 ||
    col >= BOARD_WIDTH ||
    visited[row][col] ||
    board[row][col].puyo === null ||
    board[row][col].puyo!.color !== color
  ) {
    return [];
  }

  visited[row][col] = true;
  const connected: Position[] = [{ row, col }];

  // Check all 4 directions
  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  for (const dir of directions) {
    const nextRow = row + dir.row;
    const nextCol = col + dir.col;
    connected.push(...findConnectedPuyos(board, nextRow, nextCol, color, visited));
  }

  return connected;
}

export function findGroupsToPop(board: Cell[][]): Position[][] {
  const visited = Array.from({ length: BOARD_HEIGHT }, () =>
    Array(BOARD_WIDTH).fill(false)
  );
  const groups: Position[][] = [];

  for (let row = 0; row < BOARD_HEIGHT; row++) {
    for (let col = 0; col < BOARD_WIDTH; col++) {
      if (!visited[row][col] && board[row][col].puyo !== null) {
        const color = board[row][col].puyo!.color;
        const group = findConnectedPuyos(board, row, col, color, visited);

        if (group.length >= 4) {
          groups.push(group);
        }
      }
    }
  }

  return groups;
}

export function popPuyos(state: GameState): GameState {
  const groups = findGroupsToPop(state.board);

  if (groups.length === 0) {
    // 消せるぷよがない
    if (state.isChaining && state.currentChain > 0) {
      // 連鎖が終了 - maxChainを更新
      return {
        ...state,
        maxChain: Math.max(state.maxChain, state.currentChain),
        currentChain: 0,
        isChaining: false,
      };
    }
    // 連鎖中でない場合はそのまま
    return state;
  }

  const newBoard = state.board.map((row) => row.map((cell) => ({ ...cell })));
  let poppedCount = 0;

  for (const group of groups) {
    for (const pos of group) {
      newBoard[pos.row][pos.col].puyo = null;
      newBoard[pos.row][pos.col].isPopping = true;
      poppedCount++;
    }
  }

  const newChain = state.currentChain + 1;
  const chainBonus = Math.pow(2, state.currentChain);
  const colorBonus = groups.length;
  const scoreIncrease = poppedCount * 10 * chainBonus * colorBonus;

  return {
    ...state,
    board: newBoard,
    score: state.score + scoreIncrease,
    currentChain: newChain,
    isChaining: true,
  };
}

export function clearPoppingFlags(board: Cell[][]): Cell[][] {
  return board.map((row) =>
    row.map((cell) => ({ ...cell, isPopping: false }))
  );
}

export function checkGameOver(state: GameState): boolean {
  // Check if any puyo is in the top row
  for (let col = 0; col < BOARD_WIDTH; col++) {
    if (state.board[0][col].puyo !== null) {
      return true;
    }
  }
  return false;
}

export function spawnNextPair(state: GameState): GameState {
  if (state.currentPair !== null) return state;

  // Create a deep copy of nextPair to ensure it's not mutated
  const nextPairCopy = state.nextPair ? {
    ...state.nextPair,
    main: { ...state.nextPair.main },
    sub: { ...state.nextPair.sub },
    position: { ...state.nextPair.position },
    subOffset: { ...state.nextPair.subOffset },
  } : null;

  const newState = {
    ...state,
    currentPair: nextPairCopy,
    nextPair: generateFallingPair(),
  };

  if (newState.currentPair && !canMovePair(state.board, newState.currentPair, 0, 0)) {
    return {
      ...newState,
      isGameOver: true,
    };
  }

  return newState;
}
