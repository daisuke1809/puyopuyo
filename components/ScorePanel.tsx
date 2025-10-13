'use client';

import { GameState } from '@/lib/game/types';
import { motion } from 'framer-motion';
import { PuyoCell } from './PuyoCell';

interface ScorePanelProps {
  gameState: GameState;
}

export function ScorePanel({ gameState }: ScorePanelProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Score Display */}
      <motion.div
        className="bg-gradient-to-br from-yellow-900/80 to-yellow-950/80 p-6 rounded-2xl border-4 border-yellow-700/60 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-sm font-bold text-yellow-400 mb-2">💰 スコア</h2>
        <p className="text-4xl font-bold text-yellow-300 font-serif" style={{
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
        }}>
          {gameState.score.toLocaleString()}
        </p>
      </motion.div>

      {/* Max Chain Display */}
      <motion.div
        className="bg-gradient-to-br from-red-900/80 to-red-950/80 p-6 rounded-2xl border-4 border-red-700/60 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-sm font-bold text-red-400 mb-2">⚔️ 最大連鎖</h2>
        <p className="text-3xl font-bold text-red-300 font-serif" style={{
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
        }}>
          {gameState.maxChain > 0 ? `${gameState.maxChain}連鎖` : '-'}
        </p>
      </motion.div>

      {/* Next Puyo Display */}
      <motion.div
        className="bg-gradient-to-br from-blue-900/80 to-blue-950/80 p-6 rounded-2xl border-4 border-blue-700/60 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-sm font-bold text-blue-400 mb-4">🔮 ネクスト</h2>
        {gameState.nextPair && (
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12">
              <PuyoCell color={gameState.nextPair.sub.color} />
            </div>
            <div className="w-12 h-12">
              <PuyoCell color={gameState.nextPair.main.color} />
            </div>
          </div>
        )}
      </motion.div>

      {/* Controls Info */}
      <motion.div
        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6 rounded-2xl border-4 border-slate-700/60 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-sm font-bold text-slate-300 mb-3">📜 コマンド</h2>
        <div className="space-y-2 text-xs text-slate-300 font-semibold">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">移動</span>
            <span className="font-mono bg-slate-950/60 px-2 py-1 rounded border border-slate-600">← →</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">回転</span>
            <span className="font-mono bg-slate-950/60 px-2 py-1 rounded border border-slate-600">↑ Space Z X</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">高速</span>
            <span className="font-mono bg-slate-950/60 px-2 py-1 rounded border border-slate-600">↓</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">中断</span>
            <span className="font-mono bg-slate-950/60 px-2 py-1 rounded border border-slate-600">P</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">再挑戦</span>
            <span className="font-mono bg-slate-950/60 px-2 py-1 rounded border border-slate-600">R</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
