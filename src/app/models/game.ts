export interface Player {
  id: string;
  name: string;
  control: string[];
}

export interface PieceState {
  shape: [number, number][];
  row: number;
  col: number;
}

export interface GameState {
  id: string;
  status: 'waiting' | 'playing' | 'finished';
  derrota: boolean;
  players: Player[];
  board: (string | null)[][];
  currentPiece: PieceState | null;
  maxPlayers: number;
}

export const BOARD_ROWS = 9;
export const COLS = 9;
export const SKY_ROWS = 4;

export const TRIANGLE_MASK: boolean[][] = [
  [false, false, false, false, true, false, false, false, false],
  [false, false, false, true, true, true, false, false, false],
  [false, false, true, true, true, true, true, false, false],
  [false, true, true, true, true, true, true, true, false],
  [true, true, true, true, true, true, true, true, true],
];

export const CONTROL_LABELS: Record<string, string> = {
  left: '◀ Mover Izquierda',
  right: '▶ Mover Derecha',
  rotate: '🔄 Rotar',
  change_shape: '🔀 Cambiar Pieza',
};

export const CONTROL_COLORS: Record<string, string> = {
  left: '#4A90D9',
  right: '#E67E22',
  rotate: '#2ECC71',
  change_shape: '#E74C3C',
};
