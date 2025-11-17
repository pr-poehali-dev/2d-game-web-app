import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [records, setRecords] = useState<GameRecord[]>([]);
  const gameLoopRef = useRef<number>();
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

  const createParticles = (x: number, y: number, color: string, count: number = 10) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30,
        maxLife: 30,
        size: 3 + Math.random() * 3,
        color,
      });
    }
  };

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
    const canvas = canvasRef.current;
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

  const checkCollision = (rect1: any, rect2: any) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  };

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#1a1c2c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 50; i++) {
      const x = (i * 50 + Date.now() * 0.05) % canvas.width;
      ctx.fillStyle = '#5d275d';
      ctx.fillRect(x, 0, 2, canvas.height);
    }

    const player = playerRef.current;

    if (keysRef.current.has('w') || keysRef.current.has('arrowup')) {
      player.y = Math.max(0, player.y - player.speed);
    }
    if (keysRef.current.has('s') || keysRef.current.has('arrowdown')) {
      player.y = Math.min(canvas.height - player.height, player.y + player.speed);
    }
    if (keysRef.current.has('a') || keysRef.current.has('arrowleft')) {
      player.x = Math.max(0, player.x - player.speed);
    }
    if (keysRef.current.has('d') || keysRef.current.has('arrowright')) {
      player.x = Math.min(canvas.width - player.width, player.x + player.speed);
    }

    ctx.shadowBlur = 10;
    ctx.shadowColor = '#41a6f6';
    ctx.fillStyle = '#41a6f6';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#73eff7';
    ctx.fillRect(player.x + 5, player.y + 5, 10, 10);

    bulletsRef.current = bulletsRef.current.filter((bullet) => {
      bullet.x += bullet.speed;

      ctx.shadowBlur = 8;
      ctx.shadowColor = '#f4f4f4';
      ctx.fillStyle = '#f4f4f4';
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      ctx.shadowBlur = 0;

      return bullet.x < canvas.width;
    });

    enemiesRef.current = enemiesRef.current.filter((enemy) => {
      enemy.x -= enemy.speed;

      for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
        const bullet = bulletsRef.current[i];
        if (checkCollision(bullet, enemy)) {
          enemy.health -= bullet.damage;
          bulletsRef.current.splice(i, 1);
          createParticles(bullet.x, bullet.y, '#b13e53', 8);
          
          if (enemy.health <= 0) {
            setScore((prev) => prev + 10);
            createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#41a6f6', 15);
            return false;
          }
        }
      }

      if (checkCollision(player, enemy)) {
        player.health -= 0.5;
        createParticles(player.x + player.width / 2, player.y + player.height / 2, '#b13e53', 5);
        
        if (player.health <= 0) {
          endGame();
          return false;
        }
      }

      ctx.shadowBlur = 10;
      ctx.shadowColor = '#b13e53';
      ctx.fillStyle = '#b13e53';
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#5d275d';
      ctx.fillRect(enemy.x + 5, enemy.y + 5, 10, 10);

      const healthBarWidth = enemy.width * (enemy.health / (50 + wave * 10));
      ctx.fillStyle = '#41a6f6';
      ctx.fillRect(enemy.x, enemy.y - 5, healthBarWidth, 3);

      return enemy.x + enemy.width > 0;
    });

    particlesRef.current = particlesRef.current.filter((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;

      const alpha = particle.life / particle.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
      ctx.globalAlpha = 1;

      return particle.life > 0;
    });

    if (enemiesRef.current.length === 0) {
      setWave((prev) => prev + 1);
      spawnEnemies(3 + wave);
      toast({
        title: `🌊 Волна ${wave + 1}`,
        description: 'Приготовься к новым врагам!',
      });
    }

    ctx.fillStyle = '#f4f4f4';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`Счёт: ${score}`, 10, 25);
    ctx.fillText(`Волна: ${wave}`, 10, 50);

    const healthBarWidth = 200 * (player.health / player.maxHealth);
    ctx.fillStyle = '#3b5dc9';
    ctx.fillRect(10, canvas.height - 30, 200, 20);
    ctx.fillStyle = '#41a6f6';
    ctx.fillRect(10, canvas.height - 30, healthBarWidth, 20);
    ctx.strokeStyle = '#f4f4f4';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, canvas.height - 30, 200, 20);

    ctx.fillStyle = '#f4f4f4';
    ctx.font = '12px monospace';
    ctx.fillText(`HP: ${Math.ceil(player.health)}/${player.maxHealth}`, 15, canvas.height - 15);

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [score, wave, toast]);

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
    spawnEnemies(3);
    
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  const endGame = () => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }

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

  useEffect(() => {
    if (screen === 'game') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [screen, gameLoop]);

  const renderMenu = () => (
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
              onClick={startGame}
              className="w-full bg-[var(--pixel-cyan)] hover:bg-[var(--pixel-blue)] text-[var(--pixel-dark)] pixel-text text-sm py-6 pixel-border border-2 border-[var(--pixel-white)]"
            >
              НАЧАТЬ ИГРУ
            </Button>
            
            <Button
              onClick={() => setScreen('records')}
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

  const renderGame = () => (
    <div className="min-h-screen bg-[var(--pixel-dark)] flex items-center justify-center p-4">
      <div className="space-y-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="pixel-border border-4 border-[var(--pixel-cyan)] bg-[var(--pixel-dark)] max-w-full"
        />
        <Button
          onClick={() => {
            if (gameLoopRef.current) {
              cancelAnimationFrame(gameLoopRef.current);
            }
            setScreen('menu');
          }}
          variant="outline"
          className="w-full bg-transparent text-[var(--pixel-white)] pixel-text text-xs border-2 border-[var(--pixel-white)] hover:bg-[var(--pixel-white)] hover:text-[var(--pixel-dark)]"
        >
          ВЫХОД В МЕНЮ
        </Button>
      </div>
    </div>
  );

  const renderGameOver = () => (
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
              onClick={startGame}
              className="w-full bg-[var(--pixel-cyan)] hover:bg-[var(--pixel-blue)] text-[var(--pixel-dark)] pixel-text text-sm py-6 pixel-border border-2 border-[var(--pixel-white)]"
            >
              ИГРАТЬ СНОВА
            </Button>
            
            <Button
              onClick={() => setScreen('records')}
              className="w-full bg-[var(--pixel-blue)] hover:bg-[var(--pixel-purple)] text-[var(--pixel-white)] pixel-text text-sm py-6 pixel-border border-2 border-[var(--pixel-cyan)]"
            >
              РЕКОРДЫ
            </Button>
            
            <Button
              onClick={() => setScreen('menu')}
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

  const renderRecords = () => (
    <div className="min-h-screen bg-[var(--pixel-dark)] p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl p-8 bg-[var(--pixel-purple)] border-4 border-[var(--pixel-light)] pixel-border">
        <h2 className="text-3xl font-bold text-center text-[var(--pixel-light)] pixel-text mb-8">
          🏆 РЕКОРДЫ
        </h2>

        {records.length === 0 ? (
          <div className="text-center text-[var(--pixel-white)] pixel-text text-sm py-8">
            Нет записей
          </div>
        ) : (
          <div className="space-y-2 mb-8">
            {records.map((record, index) => (
              <div
                key={record.id}
                className="flex justify-between items-center p-4 bg-[var(--pixel-dark)] border-2 border-[var(--pixel-cyan)] pixel-border"
              >
                <div className="flex items-center gap-4">
                  <span className="text-[var(--pixel-cyan)] pixel-text text-lg">
                    #{index + 1}
                  </span>
                  <div className="text-[var(--pixel-white)] pixel-text text-xs">
                    <div>Счёт: {record.score}</div>
                    <div className="text-[var(--pixel-cyan)]">Волна {record.wave} • {record.date}</div>
                  </div>
                </div>
                {index === 0 && (
                  <span className="text-2xl">👑</span>
                )}
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={() => setScreen('menu')}
          className="w-full bg-[var(--pixel-cyan)] hover:bg-[var(--pixel-blue)] text-[var(--pixel-dark)] pixel-text text-sm py-6 pixel-border border-2 border-[var(--pixel-white)]"
        >
          НАЗАД
        </Button>
      </Card>
    </div>
  );

  return (
    <>
      {screen === 'menu' && renderMenu()}
      {screen === 'game' && renderGame()}
      {screen === 'gameover' && renderGameOver()}
      {screen === 'records' && renderRecords()}
    </>
  );
};

export default Index;
