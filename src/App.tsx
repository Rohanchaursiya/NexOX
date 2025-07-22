import React, { useState, useEffect } from "react";

// Type definitions for clarity and safety
type Player = "X" | "O";
type SquareValue = Player | null;

// --- Helper Function to Determine Winner ---
// Now also returns the type of the winning line for animation purposes
const calculateWinner = (
  squares: SquareValue[]
): {
  winner: Player | null;
  line: number[] | null;
  lineType: string | null;
  isDraw: boolean;
} => {
  const lines = [
    { combo: [0, 1, 2], type: "row-0" },
    { combo: [3, 4, 5], type: "row-1" },
    { combo: [6, 7, 8], type: "row-2" },
    { combo: [0, 3, 6], type: "col-0" },
    { combo: [1, 4, 7], type: "col-1" },
    { combo: [2, 5, 8], type: "col-2" },
    { combo: [0, 4, 8], type: "diag-0" },
    { combo: [2, 4, 6], type: "diag-1" },
  ];

  for (let i = 0; i < lines.length; i++) {
    const { combo, type } = lines[i];
    const [a, b, c] = combo;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a] as Player,
        line: combo,
        lineType: type,
        isDraw: false,
      };
    }
  }

  const isDraw = squares.every((square) => square !== null);
  return { winner: null, line: null, lineType: null, isDraw };
};

// --- Individual Square Component ---
interface SquareProps {
  value: SquareValue;
  onClick: () => void;
  isWinning: boolean;
}

const Square: React.FC<SquareProps> = ({ value, onClick, isWinning }) => {
  let className = "square";
  if (value) className += value === "X" ? " x" : " o";
  if (isWinning) className += " winning";

  return (
    <button className={className} onClick={onClick}>
      <span className={value ? "visible" : ""}>{value}</span>
    </button>
  );
};

// --- Main App Component ---
const App: React.FC = () => {
  const [squares, setSquares] = useState<SquareValue[]>(Array(9).fill(null));
  const [isPlayerNext, setIsPlayerNext] = useState<boolean>(true);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  const humanPlayer: Player = "X";
  const aiPlayer: Player = "O";

  const {
    winner,
    line: winningLine,
    lineType,
    isDraw,
  } = calculateWinner(squares);

  // --- AI Logic ---
  const findBestMove = (currentSquares: SquareValue[]): number => {
    for (let i = 0; i < 9; i++) {
      if (!currentSquares[i]) {
        const temp = [...currentSquares];
        temp[i] = aiPlayer;
        if (calculateWinner(temp).winner === aiPlayer) return i;
      }
    }
    for (let i = 0; i < 9; i++) {
      if (!currentSquares[i]) {
        const temp = [...currentSquares];
        temp[i] = humanPlayer;
        if (calculateWinner(temp).winner === humanPlayer) return i;
      }
    }
    if (!currentSquares[4]) return 4;
    const corners = [0, 2, 6, 8].filter((i) => !currentSquares[i]);
    if (corners.length > 0)
      return corners[Math.floor(Math.random() * corners.length)];
    const sides = [1, 3, 5, 7].filter((i) => !currentSquares[i]);
    if (sides.length > 0)
      return sides[Math.floor(Math.random() * sides.length)];
    const available = currentSquares
      .map((sq, idx) => (sq === null ? idx : null))
      .filter((v) => v !== null) as number[];
    return available[0];
  };

  // Effect for AI's turn
  useEffect(() => {
    if (!isPlayerNext && !winner && !isDraw) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const move = findBestMove(squares);
        const newSquares = squares.slice();
        newSquares[move] = aiPlayer;
        setSquares(newSquares);
        setIsPlayerNext(true);
        setIsAiThinking(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isPlayerNext, squares, winner, isDraw]);

  // Handles player click
  const handleClick = (i: number) => {
    if (winner || squares[i] || !isPlayerNext) return;
    const newSquares = squares.slice();
    newSquares[i] = humanPlayer;
    setSquares(newSquares);
    setIsPlayerNext(false);
  };

  // Resets the game
  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setIsPlayerNext(true);
    setIsAiThinking(false);
  };

  // Status message
  let status: string;
  if (winner) {
    status = winner === humanPlayer ? "You Win! 🎉" : "AI Wins!";
  } else if (isDraw) {
    status = "It's a Draw!";
  } else if (isAiThinking) {
    status = "AI is thinking...";
  } else {
    status = "Your Turn (X)";
  }

  return (
    <div className="game-container">
      <div className="background-animation">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <style>{`
        /* --- ANIMATIONS --- */
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 15px rgba(110, 231, 183, 0.2); }
          50% { box-shadow: 0 0 25px rgba(110, 231, 183, 0.4), 0 0 30px rgba(245, 158, 11, 0.1); }
          100% { box-shadow: 0 0 15px rgba(110, 231, 183, 0.2); }
        }
        @keyframes move-and-fade {
          0% { transform: translate(0, 0) scale(1); opacity: 0.7; }
          25% { transform: translate(var(--x-1), var(--y-1)) scale(0.8); opacity: 0.3; }
          50% { transform: translate(var(--x-2), var(--y-2)) scale(1.2); opacity: 0.8; }
          75% { transform: translate(var(--x-3), var(--y-3)) scale(0.9); opacity: 0.4; }
          100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
        }
        @keyframes bounce-in {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes line-draw {
          to { transform: scaleX(1); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .game-container {
          min-height: 100vh; color: #E5E7EB;
          display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1rem; font-family: sans-serif;
          background-color: #1A2E28;
          position: relative;
          overflow: hidden; /* Important for containing the background animation */
        }
        /* --- NEW BACKGROUND ANIMATION CONTAINER --- */
        .background-animation {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }
        .background-animation span {
          position: absolute;
          border-radius: 50%;
          filter: blur(20px);
          animation: move-and-fade linear infinite;
        }
        .background-animation span:nth-child(1) { width: 150px; height: 150px; top: 10%; left: 15%; background: #6EE7B7; animation-duration: 25s; --x-1: 20vw; --y-1: 30vh; --x-2: -15vw; --y-2: -20vh; --x-3: 10vw; --y-3: 15vh; }
        .background-animation span:nth-child(2) { width: 200px; height: 200px; top: 70%; left: 80%; background: #F59E0B; animation-duration: 30s; --x-1: -25vw; --y-1: -35vh; --x-2: 20vw; --y-2: 25vh; --x-3: -10vw; --y-3: -15vh; }
        .background-animation span:nth-child(3) { width: 120px; height: 120px; top: 80%; left: 10%; background: #34D399; animation-duration: 28s; --x-1: 30vw; --y-1: -40vh; --x-2: -25vw; --y-2: 30vh; --x-3: 5vw; --y-3: -20vh; }
        .background-animation span:nth-child(4) { width: 180px; height: 180px; top: 20%; left: 70%; background: #FBBF24; animation-duration: 22s; --x-1: -20vw; --y-1: 25vh; --x-2: 15vw; --y-2: -30vh; --x-3: -5vw; --y-3: 10vh; }
        .background-animation span:nth-child(5) { width: 100px; height: 100px; top: 50%; left: 50%; background: #6EE7B7; animation-duration: 35s; --x-1: -15vw; --y-1: -15vh; --x-2: 10vw; --y-2: 20vh; --x-3: 5vw; --y-3: -10vh; }
        .background-animation span:nth-child(6) { width: 220px; height: 220px; top: 5%; left: 90%; background: #F59E0B; animation-duration: 26s; --x-1: -30vw; --y-1: 40vh; --x-2: 20vw; --y-2: -35vh; --x-3: 10vw; --y-3: 15vh; }
        .background-animation span:nth-child(7) { width: 160px; height: 160px; top: 90%; left: 30%; background: #34D399; animation-duration: 32s; --x-1: 25vw; --y-1: -30vh; --x-2: -20vw; --y-2: 25vh; --x-3: -10vw; --y-3: -20vh; }

        .game-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .header { display: flex; flex-direction: column; align-items: center; }
        .title {
          font-size: 2.25rem; font-weight: bold; margin-bottom: 0.5rem;
          background-image: linear-gradient(to right, #6EE7B7, #F59E0B);
          -webkit-background-clip: text; background-clip: text; color: transparent;
          animation: fade-in-up 0.5s ease-out;
        }
        @media (min-width: 768px) { .title { font-size: 3rem; } }
        .status { font-size: 1.5rem; margin-bottom: 1.5rem; color: #E5E7EB; height: 2rem; animation: fade-in-up 0.5s 0.2s ease-out backwards; }
        
        .board-container { position: relative; }
        .board {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;
          padding: 0.5rem; border-radius: 0.5rem;
          background-color: rgba(42, 64, 57, 0.5); /* Semi-transparent board */
          backdrop-filter: blur(5px);
          border: 1px solid rgba(110, 231, 183, 0.3);
          animation: fade-in-up 0.5s 0.4s ease-out backwards, pulse-glow 4s infinite ease-in-out;
        }
        .square {
          width: 6rem; height: 6rem; margin: 0.25rem;
          display: flex; align-items: center; justify-content: center;
          font-size: 3rem; font-weight: bold; border-radius: 0.5rem;
          transition: all 0.3s ease-in-out;
          background-color: rgba(42, 64, 57, 0.7); 
          border: 1px solid rgba(110, 231, 183, 0.2);
          box-shadow: 0 0 5px rgba(110, 231, 183, 0.1); /* Subtle default glow for each square */
          cursor: pointer;
        }
        .square:hover { 
          background-color: #38544A; 
          transform: scale(1.05);
          box-shadow: 0 0 15px rgba(110, 231, 183, 0.4); /* Enhanced glow on hover */
        }
        @media (min-width: 768px) { .square { width: 8rem; height: 8rem; font-size: 3.75rem; } }
        
        .square.winning { background-color: #38544A; }
        .square span { transition: all 0.3s; transform: scale(0); }
        .square span.visible { transform: scale(1); animation: bounce-in 0.4s ease; }
        .square.x span { color: #6EE7B7; text-shadow: 0 0 8px rgba(110, 231, 183, 0.7); }
        .square.o span { color: #F59E0B; text-shadow: 0 0 8px rgba(245, 158, 11, 0.7); }

        .winning-line {
          position: absolute; background-color: #FBBF24; height: 6px; border-radius: 3px;
          transform-origin: left; transform: scaleX(0); animation: line-draw 0.5s ease-out forwards;
          box-shadow: 0 0 10px #FBBF24;
        }
        .winning-line.row-0 { top: calc(16.66% - 3px); left: 5%; width: 90%; }
        .winning-line.row-1 { top: calc(50% - 3px); left: 5%; width: 90%; }
        .winning-line.row-2 { top: calc(83.33% - 3px); left: 5%; width: 90%; }
        .winning-line.col-0 { left: calc(16.66% - 3px); top: 5%; height: 90%; transform-origin: top; }
        .winning-line.col-1 { left: calc(50% - 3px); top: 5%; height: 90%; transform-origin: top; }
        .winning-line.col-2 { left: calc(83.33% - 3px); top: 5%; height: 90%; transform-origin: top; }
        .winning-line.diag-0 { top: 5%; left: 5%; width: 127%; transform: rotate(45deg); transform-origin: top left; }
        .winning-line.diag-1 { top: 5%; right: 5%; width: 127%; transform: rotate(-45deg); transform-origin: top right; }

        .reset-button {
          margin-top: 2rem; padding: 0.75rem 2rem;
          background-image: linear-gradient(to right, #34D399, #FBBF24);
          color: white; font-weight: bold; border-radius: 9999px; border: none; cursor: pointer;
          transition: all 0.3s ease-in-out;
          animation: fade-in-up 0.5s 0.6s ease-out backwards;
        }
        .reset-button:hover { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2); transform: scale(1.05); }
        
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex; align-items: center; justify-content: center;
          z-index: 10;
        }
        .modal-content {
          background-color: #2A4039; padding: 2rem; border-radius: 1rem;
          text-align: center; display: flex; flex-direction: column; align-items: center;
          animation: bounce-in 0.4s ease-out;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .modal-title { font-size: 2.25rem; font-weight: bold; margin-bottom: 1rem; }
        .modal-text { color: #D1D5DB; margin-bottom: 1.5rem; }
      `}</style>
      <div className="game-content">
        <div className="header">
          <h1 className="title">Tic-Tac-Toe</h1>
          <div className="status">{status}</div>
        </div>

        <div className="board-container">
          <div className="board">
            {[...Array(9)].map((_, i) => (
              <Square
                key={i}
                value={squares[i]}
                onClick={() => handleClick(i)}
                isWinning={winningLine?.includes(i) ?? false}
              />
            ))}
          </div>
          {lineType && <div className={`winning-line ${lineType}`}></div>}
        </div>

        <button onClick={resetGame} className="reset-button">
          Reset Game
        </button>

        {(winner || isDraw) && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-title">
                {winner
                  ? winner === humanPlayer
                    ? "You Win! 🎉"
                    : "AI Wins!"
                  : "It's a Draw!"}
              </h2>
              <p className="modal-text">
                {winner ? "Congratulations!" : "Good game!"}
              </p>
              <button onClick={resetGame} className="reset-button">
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
