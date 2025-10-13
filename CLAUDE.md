# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern Puyo Puyo puzzle game built with Next.js 15, React 19, TypeScript, and Tailwind CSS 4. The application features advanced UI/UX with Framer Motion animations and implements the classic Puyo Puyo gameplay mechanics including chain reactions, gravity physics, and scoring.

## Requirements Specification

### Functional Requirements

#### Core Gameplay
1. **Board System**
   - 6 columns × 12 rows playfield
   - Cells can be empty or occupied by a Puyo
   - Visual distinction between falling and locked Puyos

2. **Puyo Pieces**
   - 5 distinct colors: Red, Blue, Green, Yellow, Purple
   - Puyos fall in pairs (main + sub)
   - Each Puyo has unique visual identity with gradient effects and facial features

3. **Piece Control**
   - Left/Right movement (Arrow Keys)
   - Rotation: Clockwise (↑, X) and Counter-clockwise (Z)
   - Fast drop (↓ Arrow)
   - Wall kick: Automatic adjustment when rotation is blocked by walls
   - Collision detection prevents invalid moves

4. **Game Physics**
   - Automatic falling at 1 second intervals (configurable)
   - Fast drop speed: 50ms intervals
   - Gravity applies to all Puyos after popping
   - Puyos fall until blocked by bottom or another Puyo

5. **Matching & Clearing**
   - 4 or more connected Puyos of same color are cleared
   - Connection detection uses flood-fill algorithm (4-directional)
   - Multiple groups can be cleared simultaneously
   - Popping animation plays before removal (300ms)

6. **Chain System**
   - After clearing, gravity causes Puyos to fall
   - New matches formed after falling trigger chain reactions
   - Chain counter increments with each successive clear
   - Chain resets when no new matches are formed

7. **Scoring System**
   - Base points: 10 per Puyo cleared
   - Chain bonus: 2^(chain_level)
   - Color bonus: number of distinct color groups cleared
   - Formula: `poppedCount × 10 × chainBonus × colorBonus`

8. **Game States**
   - Active: Normal gameplay
   - Paused: Freezes all game logic, shows overlay
   - Game Over: Triggered when Puyos stack to top row
   - Restart: Resets entire game state

9. **Next Piece Preview**
   - Shows upcoming Puyo pair
   - Displayed vertically with sub Puyo on top

#### User Interface
1. **Game Board Display**
   - Grid-based layout with visible cells
   - Smooth animations for Puyo appearance/disappearance
   - Overlay states for pause and game over
   - Dark theme with modern aesthetics

2. **Score Panel**
   - Real-time score display with comma separators
   - Chain counter (shows "Nx" during chains, "-" otherwise)
   - Next piece preview
   - Control instructions reference

3. **Visual Effects**
   - Gradient backgrounds with blur effects
   - Glow effects on Puyos matching their colors
   - Entrance animations for UI elements
   - Pop animations when clearing Puyos
   - Spring animations for Puyo appearance

4. **Controls Display**
   - Always visible instructions
   - Organized by function (Move, Rotate, Drop, Pause, Restart)
   - Monospace font for key labels

### Non-Functional Requirements

#### Performance
1. **Frame Rate**
   - Maintain 60 FPS during gameplay
   - Use requestAnimationFrame for smooth rendering
   - Minimize re-renders through proper React optimization

2. **Responsiveness**
   - Immediate response to user input (<16ms)
   - No input lag during fast dropping
   - Smooth animations without jank

#### Code Quality
1. **Type Safety**
   - Full TypeScript coverage
   - Strict mode enabled
   - No `any` types in game logic

2. **Architecture**
   - Separation of concerns: logic, state, UI
   - Pure functions for game logic (no side effects)
   - Immutable state updates
   - Testable code structure

3. **Maintainability**
   - Clear file organization by responsibility
   - Descriptive naming conventions
   - Self-documenting code with minimal comments
   - Modular components

#### Accessibility
1. **Keyboard Support**
   - Full game playable via keyboard only
   - Standard key mappings
   - No mouse required

2. **Visual Design**
   - High contrast between Puyos and background
   - Distinct colors for colorblind consideration
   - Clear state indicators (pause, game over)

### Technical Constraints

1. **Technology Stack**
   - Next.js 15 with App Router
   - React 19 (client-side rendering for game)
   - TypeScript 5+
   - Tailwind CSS 4
   - Framer Motion for animations
   - Turbopack for development/build

2. **Browser Compatibility**
   - Modern browsers supporting ES2020+
   - No IE11 support required

3. **Build Requirements**
   - Static export capability
   - No server-side dependencies for gameplay
   - Optimized bundle size

### Game Rules & Mechanics

#### Rotation Behavior
- Sub Puyo rotates around main Puyo as pivot
- 4 rotation states: 0°, 90°, 180°, 270°
- Wall kick attempts: current position → left → right
- Rotation fails if all positions are blocked

#### Gravity Rules
- Processes each column independently
- Bottom-to-top scanning
- Puyos fall to lowest available position
- Applied after every clear operation

#### Chain Detection
- Only occurs after gravity settles
- Flood-fill scans entire board
- All groups ≥4 Puyos cleared simultaneously
- Chain continues until no matches remain

#### Game Over Condition
- Any Puyo in top row (row 0) after locking
- Checked when spawning new pair
- Prevents new pair from spawning

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build production bundle with Turbopack
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

The development server runs at `http://localhost:3000`.

## Architecture

### Game Logic Layer (`lib/game/`)

- **types.ts**: Core type definitions for game state, Puyo pieces, board cells, and falling pairs. Defines constants like board dimensions (6x12) and available colors.

- **gameLogic.ts**: Pure functions implementing game mechanics:
  - Board initialization and cell management
  - Puyo pair generation and movement validation
  - Rotation logic with wall kick support
  - Gravity simulation and falling mechanics
  - Chain detection using flood-fill algorithm (4+ connected Puyos)
  - Scoring system with chain bonuses
  - Game over detection

### Game Loop (`hooks/useGameLoop.ts`)

Custom React hook managing the game's state machine and timing:
- RequestAnimationFrame-based game loop
- Keyboard input handling (arrow keys, Z/X rotation, Space/P pause, R restart)
- Automatic falling with configurable speeds (1000ms normal, 50ms fast-drop)
- State transitions: spawn → fall → lock → pop → gravity → spawn
- Pause and game over state management

### UI Components (`components/`)

- **PuyoCell.tsx**: Individual Puyo rendering with color gradients, glow effects, and facial features. Handles popping animations.

- **GameBoard.tsx**: 6x12 grid renderer that overlays falling pairs onto locked board state. Includes pause and game over overlays with animations.

- **ScorePanel.tsx**: Displays score, chain counter, next pair preview, and control instructions.

### Main Application (`app/`)

- **page.tsx**: Client-side root component orchestrating the game layout with animated background gradients.
- **layout.tsx**: Root layout with Geist font configuration and metadata.

## Key Technical Patterns

### State Management
- Single `GameState` object contains all game state (board, current/next pairs, score, chain, flags)
- Immutable state updates using spread operators
- Game logic functions are pure, returning new state objects

### Collision Detection
- `canMovePair()` checks both main and sub Puyo positions against board bounds and occupied cells
- Used for movement, rotation, and wall kicks

### Chain Reactions
- After locking a pair, `popPuyos()` runs flood-fill to find connected groups of 4+
- Groups are marked for popping with a brief animation
- Gravity applies, potentially creating new groups
- Process repeats until no groups remain, incrementing chain counter each time

### Timing & Animation
- Game loop uses `requestAnimationFrame` with delta-time tracking
- Separate fall speeds for normal and fast-drop states
- Framer Motion handles component entrance animations and Puyo pop effects
- Popping animation delay (300ms) before gravity applies creates visual feedback

## File Structure Notes

- Use `@/` path alias for imports (configured in tsconfig.json)
- All components use `'use client'` directive as the game requires client-side interactivity
- Game logic is kept separate from React components for testability
- TypeScript strict mode is enabled

## Extending the Game

To add new features:

1. **New Puyo types**: Add to `PuyoColor` union in `types.ts`, update `COLORS` array and color maps in `PuyoCell.tsx`

2. **Different board sizes**: Modify `BOARD_WIDTH` and `BOARD_HEIGHT` constants in `types.ts`

3. **New game modes**: Extend `GameState` type and add mode-specific logic branches in game loop

4. **Power-ups**: Add new cell state properties and handle them in collision/popping logic

5. **Multiplayer**: Extract game state to shared store (e.g., Zustand) and sync between clients
