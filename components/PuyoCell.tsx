'use client';

import { PuyoColor } from '@/lib/game/types';
import { motion } from 'framer-motion';

interface PuyoCellProps {
  color: PuyoColor | null;
  isPopping?: boolean;
}

// スライム風の色
const colorMap: Record<PuyoColor, string> = {
  red: 'from-red-500 via-red-600 to-red-700',
  blue: 'from-blue-500 via-blue-600 to-blue-700',
  green: 'from-green-500 via-green-600 to-green-700',
  yellow: 'from-yellow-400 via-yellow-500 to-yellow-600',
  purple: 'from-purple-500 via-purple-600 to-purple-700',
};

const colorGlow: Record<PuyoColor, string> = {
  red: 'shadow-[0_4px_12px_rgba(239,68,68,0.6)]',
  blue: 'shadow-[0_4px_12px_rgba(59,130,246,0.6)]',
  green: 'shadow-[0_4px_12px_rgba(34,197,94,0.6)]',
  yellow: 'shadow-[0_4px_12px_rgba(234,179,8,0.6)]',
  purple: 'shadow-[0_4px_12px_rgba(168,85,247,0.6)]',
};

export function PuyoCell({ color, isPopping = false }: PuyoCellProps) {
  if (!color) {
    return <div className="w-full h-full" />;
  }

  return (
    <motion.div
      className={`w-full h-full rounded-full bg-gradient-to-br ${colorMap[color]} ${colorGlow[color]} relative overflow-visible border-2 border-black/20`}
      initial={{ scale: 0, rotate: -180 }}
      animate={{
        scale: isPopping ? 0 : 1,
        rotate: isPopping ? 360 : 0,
        y: isPopping ? -20 : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 15,
        mass: 0.8,
      }}
      style={{
        filter: 'drop-shadow(0 6px 10px rgba(0, 0, 0, 0.5))',
      }}
    >
      {/* スライムの光沢 */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        {/* 上部のハイライト */}
        <div className="absolute top-1 left-1/4 w-1/2 h-1/3 bg-white/40 rounded-full blur-md" />
      </div>

      {/* DQ風の目 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex gap-1.5 mt-1">
          {/* 左目 */}
          <div className="relative">
            <div className="w-2.5 h-3 bg-black rounded-full" />
            <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full" />
          </div>
          {/* 右目 */}
          <div className="relative">
            <div className="w-2.5 h-3 bg-black rounded-full" />
            <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full" />
          </div>
        </div>
      </div>

      {/* 底部の影 */}
      <div className="absolute bottom-0 left-1/4 w-1/2 h-1/4 bg-black/30 rounded-full blur-sm" />
    </motion.div>
  );
}
