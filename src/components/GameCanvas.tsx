import { useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';

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

interface GameCanvasProps {
  score: number;
  wave: number;
  playerRef: React.MutableRefObject<Player>;
  enemiesRef: React.MutableRefObject<Enemy[]>;
  bulletsRef: React.MutableRefObject<Bullet[]>;
  particlesRef: React.MutableRefObject<Particle[]>;
  keysRef: React.MutableRefObject<Set<string>>;
  onScoreChange: (score: number) => void;
  onWaveChange: (wave: number) => void;
  onGameEnd: () => void;
  onBackToMenu: () => void;
  onWaveComplete: () => void;
}

const GameCanvas = ({
  score,
  wave,
  playerRef,
  enemiesRef,
  bulletsRef,
  particlesRef,
  keysRef,
  onScoreChange,
  onWaveChange,
  onGameEnd,
  onBackToMenu,
  onWaveComplete,
}: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();

  const checkCollision = (rect1: any, rect2: any) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  };

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
            onScoreChange(score + 10);
            createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#41a6f6', 15);
            return false;
          }
        }
      }

      if (checkCollision(player, enemy)) {
        player.health -= 0.5;
        createParticles(player.x + player.width / 2, player.y + player.height / 2, '#b13e53', 5);
        
        if (player.health <= 0) {
          onGameEnd();
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
      onWaveComplete();
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
  }, [score, wave, playerRef, enemiesRef, bulletsRef, particlesRef, keysRef, onScoreChange, onGameEnd, onWaveComplete]);

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop]);

  const handleBackToMenu = () => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    onBackToMenu();
  };

  return (
    <div className="min-h-screen bg-[var(--pixel-dark)] flex items-center justify-center p-4">
      <div className="space-y-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="pixel-border border-4 border-[var(--pixel-cyan)] bg-[var(--pixel-dark)] max-w-full"
        />
        <Button
          onClick={handleBackToMenu}
          variant="outline"
          className="w-full bg-transparent text-[var(--pixel-white)] pixel-text text-xs border-2 border-[var(--pixel-white)] hover:bg-[var(--pixel-white)] hover:text-[var(--pixel-dark)]"
        >
          ВЫХОД В МЕНЮ
        </Button>
      </div>
    </div>
  );
};

export default GameCanvas;
