import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface GameOverProps {
  score: number;
  wave: number;
  onPlayAgain: () => void;
  onShowRecords: () => void;
  onBackToMenu: () => void;
}

const GameOver = ({ score, wave, onPlayAgain, onShowRecords, onBackToMenu }: GameOverProps) => {
  return (
    <div className="min-h-screen bg-[var(--pixel-dark)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-[var(--pixel-purple)] border-4 border-[var(--pixel-red)] pixel-border">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-[var(--pixel-red)] pixel-text">
            💀 GAME OVER
          </h1>
          
          <div className="bg-[var(--pixel-dark)] p-6 pixel-border border-2 border-[var(--pixel-cyan)]">
            <div className="space-y-3 pixel-text text-[var(--pixel-white)]">
              <div className="text-2xl">Счёт: {score}</div>
              <div className="text-xl text-[var(--pixel-cyan)]">Волна: {wave}</div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onPlayAgain}
              className="w-full bg-[var(--pixel-cyan)] hover:bg-[var(--pixel-blue)] text-[var(--pixel-dark)] pixel-text text-sm py-6 pixel-border border-2 border-[var(--pixel-white)]"
            >
              ИГРАТЬ СНОВА
            </Button>
            
            <Button
              onClick={onShowRecords}
              className="w-full bg-[var(--pixel-blue)] hover:bg-[var(--pixel-purple)] text-[var(--pixel-white)] pixel-text text-sm py-6 pixel-border border-2 border-[var(--pixel-cyan)]"
            >
              РЕКОРДЫ
            </Button>
            
            <Button
              onClick={onBackToMenu}
              variant="outline"
              className="w-full bg-transparent text-[var(--pixel-white)] pixel-text text-xs border-2 border-[var(--pixel-white)] hover:bg-[var(--pixel-white)] hover:text-[var(--pixel-dark)]"
            >
              МЕНЮ
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GameOver;
