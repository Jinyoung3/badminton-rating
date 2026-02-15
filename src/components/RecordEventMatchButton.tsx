'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { recordEventMatch } from '@/actions/match';
import { formatUserDisplayName } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  userNumber: number;
  rating: number;
  preferredGameType: string;
}

interface GameScore {
  team1: number;
  team2: number;
}

interface RecordEventMatchButtonProps {
  eventId: string;
  participants: User[];
}

export default function RecordEventMatchButton({ eventId, participants }: RecordEventMatchButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
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
  
  const resetForm = () => {
    setGameType('singles');
    setPlayer1Id('');
    setPlayer2Id('');
    setPlayer3Id('');
    setPlayer4Id('');
    setGames([{ team1: 21, team2: 19 }]);
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
    
    const result = await recordEventMatch({
      eventId,
      gameType,
      player1Id,
      player2Id,
      player3Id: gameType === 'doubles' ? player3Id : undefined,
      player4Id: gameType === 'doubles' ? player4Id : undefined,
      games,
    });
    
    // if (result.success) {
    //   // Show rating changes
    //   const winner = calculateWinner();
    //   alert(
    //     `Match recorded successfully!\n\n` +
    //     `${getTeamLabel(1)} ${winner === 'team1' ? 'wins!' : 'loses'}\n` +
    //     `Rating changes:\n` +
    //     `Player 1: ${result.ratingChanges.player1Change >= 0 ? '+' : ''}${result.ratingChanges.player1Change}\n` +
    //     `Player 2: ${result.ratingChanges.player2Change >= 0 ? '+' : ''}${result.ratingChanges.player2Change}` +
    //     (gameType === 'doubles' 
    //       ? `\nPlayer 3: ${result.ratingChanges.player3Change! >= 0 ? '+' : ''}${result.ratingChanges.player3Change}\n` +
    //         `Player 4: ${result.ratingChanges.player4Change! >= 0 ? '+' : ''}${result.ratingChanges.player4Change}`
    //       : ''
    //     )
    //   );
      
    //   setShowModal(false);
    //   resetForm();
    //   router.refresh();
    // } else {
    //   alert(result.error || 'Failed to record match');
    // }
    if (result.success) {
      // Show rating changes
      const winner = calculateWinner();
      
      // FIX: Check if ratingChanges exists and use type casting for the alert display
      const changes = result.ratingChanges as any;
      
      if (changes) {
        alert(
          `Match recorded successfully!\n\n` +
          `${getTeamLabel(1)} ${winner === 'team1' ? 'wins!' : 'loses'}\n` +
          `Rating changes:\n` +
          `Player 1: ${changes.player1Change >= 0 ? '+' : ''}${changes.player1Change}\n` +
          `Player 2: ${changes.player2Change >= 0 ? '+' : ''}${changes.player2Change}` +
          (gameType === 'doubles' 
            ? `\nPlayer 3: ${changes.player3Change >= 0 ? '+' : ''}${changes.player3Change}\n` +
              `Player 4: ${changes.player4Change >= 0 ? '+' : ''}${changes.player4Change}`
            : ''
          )
        );
      } else {
        alert('Match recorded successfully!');
      }
      
      setShowModal(false);
      resetForm();
      router.refresh();
    } else {
      alert(result.error || 'Failed to record match');
    }
    setIsSubmitting(false);
  };
  
  if (!showModal) {
    return (
      <button
        onClick={() => setShowModal(true)}
        className="btn-primary"
      >
        ⚔️ Record Match
      </button>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full my-8">
        <h2 className="text-2xl font-bold mb-4">Record Event Match</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Game Type */}
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
                <div className="font-semibold">Doubles</div>
                <div className="text-sm text-gray-600">2 vs 2</div>
              </button>
            </div>
          </div>
          
          {/* Player Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              {gameType === 'singles' ? 'Players' : 'Team 1'}
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <select
                value={player1Id}
                onChange={(e) => setPlayer1Id(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Player 1</option>
                {participants.map((user) => (
                  <option key={user.id} value={user.id}>
                    {formatUserDisplayName(user.name, user.userNumber)} ({user.rating})
                  </option>
                ))}
              </select>
              
              {gameType === 'doubles' && (
                <select
                  value={player2Id}
                  onChange={(e) => setPlayer2Id(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Player 2</option>
                  {participants.map((user) => (
                    <option key={user.id} value={user.id}>
                      {formatUserDisplayName(user.name, user.userNumber)} ({user.rating})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          
          {/* Team 2 or Player 2 for Singles */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              {gameType === 'singles' ? 'Opponent' : 'Team 2'}
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <select
                value={gameType === 'singles' ? player2Id : player3Id}
                onChange={(e) => gameType === 'singles' ? setPlayer2Id(e.target.value) : setPlayer3Id(e.target.value)}
                className="input-field"
                required
              >
                <option value="">{gameType === 'singles' ? 'Player 2' : 'Player 3'}</option>
                {participants.map((user) => (
                  <option key={user.id} value={user.id}>
                    {formatUserDisplayName(user.name, user.userNumber)} ({user.rating})
                  </option>
                ))}
              </select>
              
              {gameType === 'doubles' && (
                <select
                  value={player4Id}
                  onChange={(e) => setPlayer4Id(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Player 4</option>
                  {participants.map((user) => (
                    <option key={user.id} value={user.id}>
                      {formatUserDisplayName(user.name, user.userNumber)} ({user.rating})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          
          {/* Game Scores */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-700">Game Scores</h3>
              <button
                type="button"
                onClick={addGame}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Add Game
              </button>
            </div>
            
            <div className="space-y-2">
              {games.map((game, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-12">G{index + 1}</span>
                  
                  <input
                    type="number"
                    value={game.team1}
                    onChange={(e) => updateGame(index, 'team1', e.target.value)}
                    className="input-field text-center py-1 text-sm"
                    min="0"
                    max="50"
                    required
                  />
                  
                  <span className="text-gray-400">-</span>
                  
                  <input
                    type="number"
                    value={game.team2}
                    onChange={(e) => updateGame(index, 'team2', e.target.value)}
                    className="input-field text-center py-1 text-sm"
                    min="0"
                    max="50"
                    required
                  />
                  
                  {games.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGame(index)}
                      className="text-red-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {games.length > 0 && (
              <div className="mt-3 text-sm text-gray-600">
                Winner: {calculateWinner() === 'team1' ? getTeamLabel(1) : getTeamLabel(2)}
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
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
      </div>
    </div>
  );
}
