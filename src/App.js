const { useState, useEffect } = React;

const SecretSanta = () => {
  const [setupMode, setSetupMode] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [newParticipant, setNewParticipant] = useState('');
  const [assignments, setAssignments] = useState(new Map());
  const [playerName, setPlayerName] = useState('');
  const [showAssignment, setShowAssignment] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check URL for existing game data
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      try {
        const gameData = JSON.parse(atob(hash));
        setParticipants(gameData.participants);
        setAssignments(new Map(gameData.assignments));
        setSetupMode(false);
      } catch (e) {
        console.error('Invalid game data');
      }
    }
  }, []);

  const addParticipant = () => {
    if (newParticipant && !participants.includes(newParticipant)) {
      setParticipants([...participants, newParticipant]);
      setNewParticipant('');
    }
  };

  const removeParticipant = (name) => {
    setParticipants(participants.filter(p => p !== name));
  };

  const startGame = () => {
    // Shuffle participants array
    const shuffled = [...participants];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Create circular assignments
    const newAssignments = new Map();
    shuffled.forEach((person, index) => {
      const nextPerson = shuffled[(index + 1) % shuffled.length];
      newAssignments.set(person, nextPerson);
    });
    
    setAssignments(newAssignments);
    setSetupMode(false);
    
    // Update URL with game data
    const gameData = {
      participants: shuffled,
      assignments: Array.from(newAssignments.entries())
    };
    const encodedData = btoa(JSON.stringify(gameData));
    window.location.hash = encodedData;
  };

  const copyShareLink = () => {
    const shareLink = window.location.href;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const revealAssignment = () => {
    if (playerName && assignments.has(playerName)) {
      setShowAssignment(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span role="img" aria-label="gift">🎁</span>
        Family Secret Santa
      </div>
      
      <div className="space-y-4">
        {setupMode ? (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-blue-700 mb-4">
              Add all family members, then start the game. You'll get a link to share with everyone!
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter family member's name"
                value={newParticipant}
                onChange={(e) => setNewParticipant(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
                className="flex-1 p-2 border rounded"
              />
              <button 
                onClick={addParticipant}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>

            <div className="space-y-2">
              {participants.map((name) => (
                <div key={name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>{name}</span>
                  <button
                    onClick={() => removeParticipant(name)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {participants.length >= 2 ? (
              <button 
                onClick={startGame}
                className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Start Secret Santa!
              </button>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-yellow-700">
                Add at least 2 family members to start
              </div>
            )}
          </>
        ) : (
          <>
            {!showAssignment ? (
              <div className="space-y-4">
                {assignments.size > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-4 text-blue-700">
                    <div className="mb-2">Share this link with all participants:</div>
                    <button 
                      onClick={copyShareLink}
                      className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-2"
                    >
                      {copied ? '✓ Copied!' : 'Copy Share Link'}
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <select 
                    className="flex-1 p-2 border rounded"
                    onChange={(e) => setPlayerName(e.target.value)}
                    value={playerName}
                  >
                    <option value="">Select your name</option>
                    {participants.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={revealAssignment}
                    disabled={!playerName}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    Show My Assignment
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded p-4 text-green-700">
                <div className="flex items-center gap-2 mb-4">
                  <span>{playerName}</span>
                  <span>→</span>
                  <strong>{assignments.get(playerName)}</strong>
                </div>
                <div className="text-sm">
                  Remember who you're getting a gift for! You can close this page now.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Mount the app
ReactDOM.render(<SecretSanta />, document.getElementById('root'));
