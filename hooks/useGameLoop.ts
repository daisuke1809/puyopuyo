'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { GameState } from '@/lib/game/types';
import {
  createInitialGameState,
  movePair,
  rotatePair,
  lockPair,
  applyGravity,
  popPuyos,
  clearPoppingFlags,
  spawnNextPair,
  canMovePair,
} from '@/lib/game/gameLogic';

const FALL_SPEED = 1000; // ms
const FAST_FALL_SPEED = 50; // ms

export function useGameLoop() {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [isFastFalling, setIsFastFalling] = useState(false);
  const lastUpdateRef = useRef<number>(Date.now());
  const animationFrameRef = useRef<number | null>(null);
  const isInitialMount = useRef(true);

  const moveLeft = useCallback(() => {
    setGameState((state) => movePair(state, 0, -1));
  }, []);

  const moveRight = useCallback(() => {
    setGameState((state) => movePair(state, 0, 1));
  }, []);

  const rotateClockwise = useCallback(() => {
    setGameState((state) => rotatePair(state, true));
  }, []);

  const rotateCounterClockwise = useCallback(() => {
    setGameState((state) => rotatePair(state, false));
  }, []);

  const togglePause = useCallback(() => {
    setGameState((state) => ({ ...state, isPaused: !state.isPaused }));
  }, []);

  const resetGame = useCallback(() => {
    const newState = createInitialGameState();
    setGameState(spawnNextPair(newState));
    setIsFastFalling(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameState.isGameOver || gameState.isPaused) {
        if (e.key === 'r' || e.key === 'R') {
          resetGame();
        }
        if (e.key === 'p' || e.key === 'P') {
          togglePause();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          moveLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveRight();
          break;
        case 'ArrowUp':
        case 'x':
        case 'X':
        case ' ':
          e.preventDefault();
          rotateClockwise();
          break;
        case 'z':
        case 'Z':
          e.preventDefault();
          rotateCounterClockwise();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setIsFastFalling(true);
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          togglePause();
          break;
      }
    },
    [gameState.isGameOver, gameState.isPaused, moveLeft, moveRight, rotateClockwise, rotateCounterClockwise, togglePause, resetGame]
  );

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setIsFastFalling(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const gameLoop = useCallback(() => {
    const now = Date.now();
    const fallSpeed = isFastFalling ? FAST_FALL_SPEED : FALL_SPEED;

    if (now - lastUpdateRef.current >= fallSpeed) {
      setGameState((state) => {
        if (state.isGameOver || state.isPaused) return state;

        // If there's a current pair, try to move it down
        if (state.currentPair) {
          if (canMovePair(state.board, state.currentPair, 1, 0)) {
            return movePair(state, 1, 0);
          } else {
            // Lock the pair
            return lockPair(state);
          }
        }

        // Process popping
        const poppedState = popPuyos(state);
        if (poppedState.currentChain > state.currentChain) {
          // Puyos were popped, apply gravity after a delay
          setTimeout(() => {
            setGameState((s) => {
              const gravityBoard = applyGravity(clearPoppingFlags(s.board));
              return { ...s, board: gravityBoard };
            });
          }, 300);
          return poppedState;
        }

        // Check if chain ended and maxChain was updated
        if (poppedState.maxChain !== state.maxChain) {
          return poppedState;
        }

        // Apply gravity if needed
        const gravityBoard = applyGravity(state.board);
        const gravityChanged = JSON.stringify(gravityBoard) !== JSON.stringify(state.board);

        if (gravityChanged) {
          return { ...state, board: gravityBoard };
        }

        // Spawn next pair
        return spawnNextPair(state);
      });

      lastUpdateRef.current = now;
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [isFastFalling]);

  // Initialize first pair immediately on mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setGameState((state) => spawnNextPair(state));
    }
  }, []);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop]);

  return {
    gameState,
    controls: {
      moveLeft,
      moveRight,
      rotateClockwise,
      rotateCounterClockwise,
      togglePause,
      resetGame,
    },
  };
}
