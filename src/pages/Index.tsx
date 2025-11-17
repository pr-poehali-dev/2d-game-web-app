import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import GameMenu from '@/components/GameMenu';
import GameCanvas from '@/components/GameCanvas';
import GameOver from '@/components/GameOver';
import RecordsTable from '@/components/RecordsTable';

type GameScreen = 'menu' | 'game' | 'records' | 'gameover';

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  health: number;
  maxHealth: number;
}

interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  health: number;
}

interface Bullet {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  damage: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface GameRecord {
  id: number;
  score: number;
  wave: number;
  date: string;
}

const Index = () => {
  const { toast } = useToast();
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [records, setRecords] = useState<GameRecord[]>([]);
  const keysRef = useRef<Set<string>>(new Set());
  
  const playerRef = useRef<Player>({
    x: 50,
    y: 300,
    width: 30,
    height: 30,
    speed: 5,
    health: 100,
    maxHealth: 100,
  });

  const enemiesRef = useRef<Enemy[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const lastShotRef = useRef(0);
  const shootCooldown = 200;

  useEffect(() => {
    const savedRecords = localStorage.getItem('corn-battle-records');
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      if (e.key === ' ' && screen === 'game') {
        e.preventDefault();
        shootBullet();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [screen]);

  const shootBullet = () => {
    const now = Date.now();
    if (now - lastShotRef.current < shootCooldown) return;
    
    lastShotRef.current = now;
    const player = playerRef.current;
    bulletsRef.current.push({
      x: player.x + player.width,
      y: player.y + player.height / 2 - 3,
      width: 15,
      height: 6,
      speed: 10,
      damage: 25,
    });
  };

  const spawnEnemies = (count: number) => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    for (let i = 0; i < count; i++) {
      enemiesRef.current.push({
        x: canvas.width + Math.random() * 200,
        y: Math.random() * (canvas.height - 40),
        width: 30,
        height: 30,
        speed: 1 + wave * 0.3 + Math.random() * 0.5,
        health: 50 + wave * 10,
      });
    }
  };

  const startGame = () => {
    playerRef.current = {
      x: 50,
      y: 300,
      width: 30,
      height: 30,
      speed: 5,
      health: 100,
      maxHealth: 100,
    };
    enemiesRef.current = [];
    bulletsRef.current = [];
    particlesRef.current = [];
    setScore(0);
    setWave(1);
    setScreen('game');
    setTimeout(() => spawnEnemies(3), 100);
  };

  const endGame = () => {
    const newRecord: GameRecord = {
      id: Date.now(),
      score,
      wave,
      date: new Date().toLocaleDateString('ru-RU'),
    };
    
    const updatedRecords = [...records, newRecord]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    setRecords(updatedRecords);
    localStorage.setItem('corn-battle-records', JSON.stringify(updatedRecords));
    
    setScreen('gameover');
    
    toast({
      title: '💀 Игра окончена',
      description: `Твой счёт: ${score}`,
      variant: 'destructive',
    });
  };

  const handleWaveComplete = () => {
    setWave((prev) => prev + 1);
    const nextWave = wave + 1;
    spawnEnemies(3 + wave);
    toast({
      title: `🌊 Волна ${nextWave}`,
      description: 'Приготовься к новым врагам!',
    });
  };

  return (
    <>
      {screen === 'menu' && (
        <GameMenu
          onStartGame={startGame}
          onShowRecords={() => setScreen('records')}
        />
      )}
      {screen === 'game' && (
        <GameCanvas
          score={score}
          wave={wave}
          playerRef={playerRef}
          enemiesRef={enemiesRef}
          bulletsRef={bulletsRef}
          particlesRef={particlesRef}
          keysRef={keysRef}
          onScoreChange={setScore}
          onWaveChange={setWave}
          onGameEnd={endGame}
          onBackToMenu={() => setScreen('menu')}
          onWaveComplete={handleWaveComplete}
        />
      )}
      {screen === 'gameover' && (
        <GameOver
          score={score}
          wave={wave}
          onPlayAgain={startGame}
          onShowRecords={() => setScreen('records')}
          onBackToMenu={() => setScreen('menu')}
        />
      )}
      {screen === 'records' && (
        <RecordsTable
          records={records}
          onBackToMenu={() => setScreen('menu')}
        />
      )}
    </>
  );
};

export default Index;
