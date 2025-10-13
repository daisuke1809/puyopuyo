export type PuyoColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple';

export interface Puyo {
  color: PuyoColor;
  id: string;
}

export interface Cell {
  puyo: Puyo | null;
  isPopping: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export interface FallingPair {
  main: Puyo;
  sub: Puyo;
  position: Position;
  subOffset: Position; // Relative to main puyo
  rotation: number; // 0, 90, 180, 270
}

export interface GameState {
  board: Cell[][];
  currentPair: FallingPair | null;
  nextPair: FallingPair | null;
  score: number;
  currentChain: number; // 現在進行中の連鎖数
  maxChain: number;     // ゲーム中の最大連鎖数
  isGameOver: boolean;
  isPaused: boolean;
  isChaining: boolean;  // 連鎖処理中かどうか
}

export const BOARD_WIDTH = 6;
export const BOARD_HEIGHT = 12;
export const COLORS: PuyoColor[] = ['red', 'blue', 'green', 'yellow', 'purple'];
