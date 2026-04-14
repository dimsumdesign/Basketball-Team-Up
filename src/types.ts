export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C' | 'ANY';

export interface Player {
  id: string;
  name: string;
  position: Position;
  skill: number; // 1 to 5
  assignedPosition?: string;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  totalSkill: number;
}
