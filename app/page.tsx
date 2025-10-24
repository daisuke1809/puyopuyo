'use client';

import { useGameLoop } from '@/hooks/useGameLoop';
import { GameBoard } from '@/components/GameBoard';
import { ScorePanel } from '@/components/ScorePanel';
import { motion } from 'framer-motion';

export default function Home() {
  const { gameState } = useGameLoop();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-900 flex items-center justify-center p-8 relative overflow-hidden">
      {/* RPG風背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 石レンガのテクスチャ風 */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(0,0,0,.3) 35px, rgba(0,0,0,.3) 40px),
                           repeating-linear-gradient(90deg, transparent, transparent 35px, rgba(0,0,0,.3) 35px, rgba(0,0,0,.3) 40px)`
        }} />

        {/* 城壁のシルエット */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900/40 to-transparent" />
      </div>

      <div className="relative z-10 max-w-6xl w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-6xl font-bold text-yellow-400 mb-3 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] font-serif" style={{
            textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 4px 4px 8px rgba(0,0,0,0.5)'
          }}>
            ⚔️ ぷよぷよクエスト ⚔️
          </h1>
          <p className="text-blue-200 text-base font-semibold">ファンタジーパズル</p>
        </motion.div>

        <div className="flex gap-8 items-start justify-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GameBoard gameState={gameState} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <ScorePanel gameState={gameState} />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-yellow-300 text-sm font-semibold">⚡ 同じ色のスライムを4つ以上つなげて消す！</p>
          <p className="mt-1 text-blue-200 text-sm font-semibold">🔥 連鎖でスコアアップ！</p>
        </motion.div>
      </div>
    </div>
  );
}
