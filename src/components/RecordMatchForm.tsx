'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { recordChallengeMatch } from '@/actions/match';
import { formatUserDisplayName } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  userNumber: number;
  rating: number;
  preferredGameType: string;
  location: string;
}

interface GameScore {
  team1: number;
  team2: number;
}

interface RecordMatchFormProps {
  allUsers: User[];
  isPractice: boolean;
}

export default function RecordMatchForm({ allUsers, isPractice }: RecordMatchFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [gameType, setGameType] = useState<'singles' | 'doubles'>('singles');
  const [player1Id, setPlayer1Id] = useState('');
  const [player2Id, setPlayer2Id] = useState('');
  const [player3Id, setPlayer3Id] = useState('');
  const [player4Id, setPlayer4Id] = useState('');
  
  // Game scores
  const [games, setGames] = useState<GameScore[]>([
    { team1: 21, team2: 19 }
  ]);
  
  const addGame = () => {
    setGames([...games, { team1: 21, team2: 19 }]);
  };
  
  const removeGame = (index: number) => {
    if (games.length > 1) {
      setGames(games.filter((_, i) => i !== index));
    }
  };
  
  const updateGame = (index: number, team: 'team1' | 'team2', value: string) => {
    const numValue = parseInt(value) || 0;
    const newGames = [...games];
    newGames[index][team] = numValue;
    setGames(newGames);
  };
  
  const calculateWinner = () => {
    let team1Wins = 0;
    let team2Wins = 0;
    
    games.forEach(game => {
      if (game.team1 > game.team2) team1Wins++;
      else team2Wins++;
    });
    
    return team1Wins > team2Wins ? 'team1' : 'team2';
  };
  
  const getTeamLabel = (teamNum: number) => {
    if (gameType === 'singles') {
      return teamNum === 1 ? 'Player 1' : 'Player 2';
    } else {
      return teamNum === 1 ? 'Team 1' : 'Team 2';
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!player1Id || !player2Id) {
      alert('Please select all players');
      return;
    }
    
    if (gameType === 'doubles' && (!player3Id || !player4Id)) {
      alert('Please select all 4 players for doubles');
      return;
    }
    
    if (games.length === 0) {
      alert('Please add at least one game');
      return;
    }
    
    // Check for duplicate players
    const playerIds = [player1Id, player2Id];
    if (gameType === 'doubles') {
      playerIds.push(player3Id, player4Id);
    }
    const uniqueIds = new Set(playerIds);
    if (uniqueIds.size !== playerIds.length) {
      alert('Cannot select the same player multiple times');
      return;
    }
    
    setIsSubmitting(true);
    
    const result = await recordChallengeMatch({
      gameType,
      player1Id,
      player2Id,
      player3Id: gameType === 'doubles' ? player3Id : undefined,
      player4Id: gameType === 'doubles' ? player4Id : undefined,
      games,
      isPractice,
    });
    
    if (result.success) {
      // Show rating changes if applicable
      if (result.ratingChanges && !isPractice) {
        const winner = calculateWinner();
        alert(
          `Match recorded successfully!\n\n` +
          `${getTeamLabel(1)} ${winner === 'team1' ? 'wins!' : 'loses'}\n` +
          `Rating changes:\n` +
          `Player 1: ${result.ratingChanges.player1Change >= 0 ? '+' : ''}${result.ratingChanges.player1Change}\n` +
          `Player 2: ${result.ratingChanges.player2Change >= 0 ? '+' : ''}${result.ratingChanges.player2Change}` +
          (gameType === 'doubles' 
            ? `\nPlayer 3: ${result.ratingChanges.player3Change! >= 0 ? '+' : ''}${result.ratingChanges.player3Change}\n` +
              `Player 4: ${result.ratingChanges.player4Change! >= 0 ? '+' : ''}${result.ratingChanges.player4Change}`
            : ''
          )
        );
      } else if (isPractice) {
        alert('Practice match recorded! No ratings were affected.');
      }
      
      router.push('/dashboard');
    } else {
      alert(result.error || 'Failed to record match');
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      {/* Game Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Game Type
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setGameType('singles')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              gameType === 'singles'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">🎾</div>
            <div className="font-semibold">Singles</div>
            <div className="text-sm text-gray-600">1 vs 1</div>
          </button>
          
          <button
            type="button"
            onClick={() => setGameType('doubles')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              gameType === 'doubles'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">👥</div>
            <div className="font-semibold">Doubles</div>
            <div className="text-sm text-gray-600">2 vs 2</div>
          </button>
        </div>
      </div>
      
      {/* Player Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {gameType === 'singles' ? 'Players' : 'Team 1 (Player 1 + Player 2)'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Player 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Player 1 {gameType === 'singles' && '*'}
            </label>
            <select
              value={player1Id}
              onChange={(e) => setPlayer1Id(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Select player</option>
              {allUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {formatUserDisplayName(user.name, user.userNumber)} (Rating: {user.rating})
                </option>
              ))}
            </select>
          </div>
          
          {/* Player 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Player 2 {gameType === 'singles' ? '*' : '(Team 1)'}
            </label>
            <select
              value={player2Id}
              onChange={(e) => setPlayer2Id(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Select player</option>
              {allUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {formatUserDisplayName(user.name, user.userNumber)} (Rating: {user.rating})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Doubles Team 2 */}
      {gameType === 'doubles' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Team 2 (Player 3 + Player 4)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Player 3 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Player 3 (Team 2)
              </label>
              <select
                value={player3Id}
                onChange={(e) => setPlayer3Id(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select player</option>
                {allUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {formatUserDisplayName(user.name, user.userNumber)} (Rating: {user.rating})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Player 4 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Player 4 (Team 2)
              </label>
              <select
                value={player4Id}
                onChange={(e) => setPlayer4Id(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select player</option>
                {allUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {formatUserDisplayName(user.name, user.userNumber)} (Rating: {user.rating})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Game Scores */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Game Scores</h3>
          <button
            type="button"
            onClick={addGame}
            className="text-sm btn-secondary"
          >
            + Add Game
          </button>
        </div>
        
        <div className="space-y-3">
          {games.map((game, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600 w-16">
                Game {index + 1}
              </span>
              
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="number"
                  value={game.team1}
                  onChange={(e) => updateGame(index, 'team1', e.target.value)}
                  className="input-field text-center"
                  min="0"
                  max="50"
                  required
                />
                
                <span className="text-gray-400">-</span>
                
                <input
                  type="number"
                  value={game.team2}
                  onChange={(e) => updateGame(index, 'team2', e.target.value)}
                  className="input-field text-center"
                  min="0"
                  max="50"
                  required
                />
              </div>
              
              {games.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGame(index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
              
              <span className="text-sm text-gray-500 w-24 text-right">
                {game.team1 > game.team2 
                  ? `${getTeamLabel(1)} wins`
                  : `${getTeamLabel(2)} wins`
                }
              </span>
            </div>
          ))}
        </div>
        
        {/* Match Summary */}
        {games.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">Match Summary</div>
            <div className="text-lg font-bold text-primary-600">
              {calculateWinner() === 'team1' 
                ? `${getTeamLabel(1)} wins the match!`
                : `${getTeamLabel(2)} wins the match!`
              }
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {games.filter(g => g.team1 > g.team2).length} - {games.filter(g => g.team2 > g.team1).length}
            </div>
          </div>
        )}
      </div>
      
      {/* Submit */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary flex-1"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Recording...' : 'Record Match'}
        </button>
      </div>
    </form>
  );
}
