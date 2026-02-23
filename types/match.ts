export interface Match {
  matchId: string;
  homeTeamId: string;
  awayTeamId: string; 
  homeTeamName: string;
  awayTeamName: string;
  homeGoals: number;
  awayGoals: number;
  matchDate: string;
  isFinished: boolean;
}