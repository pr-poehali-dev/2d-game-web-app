import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface GameMenuProps {
  onStartGame: () => void;
  onShowRecords: () => void;
}

const GameMenu = ({ onStartGame, onShowRecords }: GameMenuProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--pixel-dark)] p-4">
      <Card className="w-full max-w-md p-8 bg-[var(--pixel-purple)] border-4 border-[var(--pixel-light)] pixel-border">
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-bold text-[var(--pixel-light)] pixel-text mb-2 pixel-blink">
            🌽 CORN
          </h1>
          <h2 className="text-3xl text-[var(--pixel-cyan)] pixel-text">
            BATTLES
          </h2>
          
          <div className="bg-[var(--pixel-dark)] p-4 pixel-border border-2 border-[var(--pixel-cyan)] text-xs pixel-text text-[var(--pixel-white)] text-left space-y-1">
            <div>⌨️ WASD / Стрелки - движение</div>
            <div>⎵ Пробел - стрельба</div>
            <div>🎯 Уничтожай врагов</div>
            <div>💚 Не дай HP упасть до 0</div>
          </div>

          <div className="space-y-4 mt-8">
            <Button
              onClick={onStartGame}
              className="w-full bg-[var(--pixel-cyan)] hover:bg-[var(--pixel-blue)] text-[var(--pixel-dark)] pixel-text text-sm py-6 pixel-border border-2 border-[var(--pixel-white)]"
            >
              НАЧАТЬ ИГРУ
            </Button>
            
            <Button
              onClick={onShowRecords}
              className="w-full bg-[var(--pixel-blue)] hover:bg-[var(--pixel-purple)] text-[var(--pixel-white)] pixel-text text-sm py-6 pixel-border border-2 border-[var(--pixel-cyan)]"
            >
              РЕКОРДЫ
            </Button>
          </div>

          <div className="mt-8 text-xs text-[var(--pixel-white)] pixel-text opacity-70">
            v2.0 • ACTION EDITION
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GameMenu;
