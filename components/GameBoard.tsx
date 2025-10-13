'use client';

import { GameState } from '@/lib/game/types';
import { PuyoCell } from './PuyoCell';
import { motion } from 'framer-motion';

interface GameBoardProps {
  gameState: GameState;
}

export function GameBoard({ gameState }: GameBoardProps) {
  const { board, currentPair } = gameState;

  const getCellContent = (row: number, col: number) => {
    if (currentPair) {
      const { position, subOffset, main, sub } = currentPair;

      if (position.row === row && position.col === col) {
        return { color: main.color, isPopping: false };
      }

      const subRow = position.row + subOffset.row;
      const subCol = position.col + subOffset.col;

      if (subRow === row && subCol === col) {
        return { color: sub.color, isPopping: false };
      }
    }

    const cell = board[row][col];
    if (cell.puyo) {
      return {
        color: cell.puyo.color,
        isPopping: cell.isPopping,
      };
    }

    return null;
  };

  return (
    <div className="relative">
      {/* 城・洞窟風の背景 */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        {/* 石壁のグラデーション */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900" />

        {/* 石レンガ模様 */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(0,0,0,.4) 30px, rgba(0,0,0,.4) 32px),
                           repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,.4) 40px, rgba(0,0,0,.4) 42px)`
        }} />

        {/* 松明の光 */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-orange-400/20 rounded-full blur-2xl" />
        <div className="absolute top-10 right-10 w-20 h-20 bg-orange-400/20 rounded-full blur-2xl" />
      </div>

      <div className="relative grid gap-1 p-6 rounded-2xl backdrop-blur-sm border-4 border-yellow-800/40 shadow-[0_0_30px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,0.3)]">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            {row.map((_, colIndex) => {
              const content = getCellContent(rowIndex, colIndex);
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="w-12 h-12"
                >
                  <PuyoCell
                    color={content?.color || null}
                    isPopping={content?.isPopping}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Game Over Overlay */}
      {gameState.isGameOver && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-black/90 rounded-2xl backdrop-blur-sm border-4 border-red-900/50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-center">
            <motion.h2
              className="text-5xl font-bold text-red-400 mb-6 font-serif"
              style={{
                textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000'
              }}
            >
              💀 GAME OVER 💀
            </motion.h2>
            <p className="text-2xl text-yellow-300 mb-3 font-semibold">獲得経験値: {gameState.score.toLocaleString()}</p>
            <p className="text-base text-gray-300">Rキーで再挑戦</p>
          </div>
        </motion.div>
      )}

      {/* Pause Overlay */}
      {gameState.isPaused && !gameState.isGameOver && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-blue-950/90 rounded-2xl backdrop-blur-sm border-4 border-blue-700/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center">
            <motion.h2
              className="text-5xl font-bold text-blue-300 mb-6 font-serif"
              style={{
                textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000'
              }}
            >
              ⏸️ 中断中 ⏸️
            </motion.h2>
            <p className="text-lg text-blue-200">Pキーで再開</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
