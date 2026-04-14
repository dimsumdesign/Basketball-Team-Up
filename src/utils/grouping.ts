import { Player, Team, Position } from '../types';

export function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function generateTeams(players: Player[], teamSize: number): Team[] {
  const numTeams = Math.ceil(players.length / teamSize);
  const teams: Team[] = Array.from({ length: numTeams }, (_, i) => ({
    id: `team-${i}`,
    name: `${i + 1} 队`,
    players: [],
    totalSkill: 0,
  }));

  // Sort by skill descending
  const sortedPlayers = [...players].sort((a, b) => b.skill - a.skill);

  for (const player of sortedPlayers) {
    let bestTeam = null;
    let bestScore = -Infinity;

    for (const team of teams) {
      if (team.players.length >= teamSize) continue;

      let score = 0;
      // Balance skill: prefer teams with lower total skill
      score -= team.totalSkill * 10;

      // Balance position: prefer teams that don't have this position
      if (player.position !== 'ANY') {
        const samePositionCount = team.players.filter(p => p.position === player.position).length;
        score -= samePositionCount * 20; // Penalty for having same position
      }

      // Add some randomness to avoid deterministic identical teams if skills are same
      score += Math.random() * 5;

      if (score > bestScore) {
        bestScore = score;
        bestTeam = team;
      }
    }

    if (!bestTeam) {
      bestTeam = teams.find(t => t.players.length < teamSize)!;
    }

    bestTeam.players.push({ ...player });
    bestTeam.totalSkill += player.skill;
  }

  // Assign specific playing positions within each team
  const standardPositions: Position[] = ['PG', 'SG', 'SF', 'PF', 'C'];
  
  for (const team of teams) {
    let availablePositions = [...standardPositions];
    if (teamSize > 5) {
      // Add FLEX positions if team size > 5
      for(let i=5; i<teamSize; i++) availablePositions.push('ANY');
    } else if (teamSize < 5) {
      availablePositions = availablePositions.slice(0, teamSize);
    }

    // First pass: assign players to their preferred position if available
    const unassignedPlayers = [];
    for (const player of team.players) {
      const posIndex = availablePositions.indexOf(player.position);
      if (posIndex !== -1 && player.position !== 'ANY') {
        player.assignedPosition = player.position;
        availablePositions.splice(posIndex, 1);
      } else {
        unassignedPlayers.push(player);
      }
    }

    // Second pass: assign remaining players to remaining positions
    for (const player of unassignedPlayers) {
      if (availablePositions.length > 0) {
        // Just pick the first available
        player.assignedPosition = availablePositions.shift()!;
      } else {
        player.assignedPosition = 'FLEX';
      }
    }
    
    // Sort players in team by standard position order
    team.players.sort((a, b) => {
       const order = { 'PG': 1, 'SG': 2, 'SF': 3, 'PF': 4, 'C': 5, 'ANY': 6, 'FLEX': 7 };
       return (order[a.assignedPosition as keyof typeof order] || 8) - (order[b.assignedPosition as keyof typeof order] || 8);
    });
  }

  return teams;
}
