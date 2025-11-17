import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

type GameScreen = 'menu' | 'battle' | 'records';

interface Character {
  name: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
}

interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
}

interface Record {
  id: number;
  score: number;
  turns: number;
  date: string;
}

const Index = () => {
  const { toast } = useToast();
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [player, setPlayer] = useState<Character>({
    name: 'Герой',
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    attack: 15,
    defense: 10,
  });
  const [enemy, setEnemy] = useState<Enemy>({
    name: 'Слизень',
    hp: 50,
    maxHp: 50,
    attack: 8,
    defense: 5,
  });
  const [turn, setTurn] = useState(0);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [records, setRecords] = useState<Record[]>([]);
  const [score, setScore] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [damagePlayer, setDamagePlayer] = useState(false);
  const [damageEnemy, setDamageEnemy] = useState(false);

  useEffect(() => {
    const savedRecords = localStorage.getItem('rpg-records');
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
  }, []);

  const startNewGame = () => {
    setPlayer({
      name: 'Герой',
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      attack: 15,
      defense: 10,
    });
    setEnemy({
      name: 'Слизень',
      hp: 50,
      maxHp: 50,
      attack: 8,
      defense: 5,
    });
    setTurn(0);
    setScore(0);
    setBattleLog(['Бой начался!']);
    setIsPlayerTurn(true);
    setScreen('battle');
  };

  const addToLog = (message: string) => {
    setBattleLog(prev => [...prev.slice(-4), message]);
  };

  const playerAttack = () => {
    if (!isPlayerTurn) return;

    const damage = Math.max(1, player.attack - enemy.defense + Math.floor(Math.random() * 5));
    const newEnemyHp = Math.max(0, enemy.hp - damage);
    
    setDamageEnemy(true);
    setTimeout(() => setDamageEnemy(false), 300);
    
    setEnemy({ ...enemy, hp: newEnemyHp });
    addToLog(`${player.name} атакует! Урон: ${damage}`);
    setScore(prev => prev + damage);

    if (newEnemyHp <= 0) {
      addToLog(`${enemy.name} повержен!`);
      saveRecord();
      toast({
        title: '🎉 Победа!',
        description: `Вы победили за ${turn + 1} ходов! Счет: ${score + damage}`,
      });
      setTimeout(() => setScreen('records'), 2000);
      return;
    }

    setIsPlayerTurn(false);
    setTimeout(() => enemyAttack(newEnemyHp), 1000);
  };

  const playerMagic = () => {
    if (!isPlayerTurn || player.mp < 20) {
      toast({
        title: '❌ Недостаточно MP',
        description: 'Нужно 20 MP для магии',
        variant: 'destructive',
      });
      return;
    }

    const damage = Math.max(10, player.attack * 2 - enemy.defense);
    const newEnemyHp = Math.max(0, enemy.hp - damage);
    
    setDamageEnemy(true);
    setTimeout(() => setDamageEnemy(false), 300);
    
    setEnemy({ ...enemy, hp: newEnemyHp });
    setPlayer({ ...player, mp: player.mp - 20 });
    addToLog(`${player.name} кастует магию! Урон: ${damage}`);
    setScore(prev => prev + damage * 2);

    if (newEnemyHp <= 0) {
      addToLog(`${enemy.name} повержен!`);
      saveRecord();
      toast({
        title: '🎉 Победа!',
        description: `Вы победили за ${turn + 1} ходов! Счет: ${score + damage * 2}`,
      });
      setTimeout(() => setScreen('records'), 2000);
      return;
    }

    setIsPlayerTurn(false);
    setTimeout(() => enemyAttack(newEnemyHp), 1000);
  };

  const playerDefend = () => {
    if (!isPlayerTurn) return;

    const healAmount = 10;
    const newHp = Math.min(player.maxHp, player.hp + healAmount);
    setPlayer({ ...player, hp: newHp, defense: player.defense + 5 });
    addToLog(`${player.name} защищается и лечится на ${healAmount} HP!`);

    setIsPlayerTurn(false);
    setTimeout(() => {
      enemyAttack(enemy.hp);
      setPlayer(prev => ({ ...prev, defense: prev.defense - 5 }));
    }, 1000);
  };

  const enemyAttack = (currentEnemyHp: number) => {
    if (currentEnemyHp <= 0) return;

    const damage = Math.max(1, enemy.attack - player.defense + Math.floor(Math.random() * 3));
    const newPlayerHp = Math.max(0, player.hp - damage);
    
    setDamagePlayer(true);
    setTimeout(() => setDamagePlayer(false), 300);
    
    setPlayer(prev => ({ ...prev, hp: newPlayerHp }));
    addToLog(`${enemy.name} атакует! Урон: ${damage}`);

    if (newPlayerHp <= 0) {
      addToLog(`${player.name} пал в бою...`);
      toast({
        title: '☠️ Поражение',
        description: 'Вы проиграли...',
        variant: 'destructive',
      });
      setTimeout(() => setScreen('menu'), 2000);
      return;
    }

    setTurn(prev => prev + 1);
    setIsPlayerTurn(true);
  };

  const saveRecord = () => {
    const newRecord: Record = {
      id: Date.now(),
      score: score,
      turns: turn + 1,
      date: new Date().toLocaleDateString('ru-RU'),
    };
    const updatedRecords = [...records, newRecord]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    setRecords(updatedRecords);
    localStorage.setItem('rpg-records', JSON.stringify(updatedRecords));
  };

  const renderMenu = () => (
    <div className="min-h-screen flex items-center justify-center bg-[var(--pixel-dark)] p-4">
      <Card className="w-full max-w-md p-8 bg-[var(--pixel-purple)] border-4 border-[var(--pixel-light)] pixel-border">
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-bold text-[var(--pixel-light)] pixel-text mb-2 pixel-blink">
            ⚔️ RPG
          </h1>
          <h2 className="text-xl text-[var(--pixel-cyan)] pixel-text">
            БИТВА
          </h2>
          
          <div className="space-y-4 mt-8">
            <Button
              onClick={startNewGame}
              className="w-full bg-[var(--pixel-cyan)] hover:bg-[var(--pixel-blue)] text-[var(--pixel-dark)] pixel-text text-sm py-6 pixel-border border-2 border-[var(--pixel-white)]"
            >
              НОВАЯ ИГРА
            </Button>
            
            <Button
              onClick={() => setScreen('records')}
              className="w-full bg-[var(--pixel-blue)] hover:bg-[var(--pixel-purple)] text-[var(--pixel-white)] pixel-text text-sm py-6 pixel-border border-2 border-[var(--pixel-cyan)]"
            >
              РЕКОРДЫ
            </Button>
          </div>

          <div className="mt-8 text-xs text-[var(--pixel-white)] pixel-text opacity-70">
            v1.0 • 8-BIT EDITION
          </div>
        </div>
      </Card>
    </div>
  );

  const renderBattle = () => (
    <div className="min-h-screen bg-[var(--pixel-dark)] p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex justify-between items-center mb-4">
          <div className="pixel-text text-[var(--pixel-cyan)] text-sm">
            ХОД: {turn + 1}
          </div>
          <div className="pixel-text text-[var(--pixel-light)] text-sm">
            СЧЕТ: {score}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className={`p-6 bg-[var(--pixel-blue)] border-4 border-[var(--pixel-cyan)] pixel-border ${damagePlayer ? 'damage-flash' : ''}`}>
            <div className="space-y-4">
              <h3 className="text-2xl pixel-text text-[var(--pixel-white)] text-center">
                👤 {player.name}
              </h3>
              
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs pixel-text text-[var(--pixel-white)] mb-1">
                    <span>HP</span>
                    <span>{player.hp}/{player.maxHp}</span>
                  </div>
                  <div className="h-4 bg-[var(--pixel-dark)] pixel-border border-2 border-[var(--pixel-white)]">
                    <div
                      className="h-full bg-[var(--pixel-red)] transition-all duration-300"
                      style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs pixel-text text-[var(--pixel-white)] mb-1">
                    <span>MP</span>
                    <span>{player.mp}/{player.maxMp}</span>
                  </div>
                  <div className="h-4 bg-[var(--pixel-dark)] pixel-border border-2 border-[var(--pixel-white)]">
                    <div
                      className="h-full bg-[var(--pixel-cyan)] transition-all duration-300"
                      style={{ width: `${(player.mp / player.maxMp) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pixel-text text-[var(--pixel-white)]">
                <div>⚔️ ATK: {player.attack}</div>
                <div>🛡️ DEF: {player.defense}</div>
              </div>
            </div>
          </Card>

          <Card className={`p-6 bg-[var(--pixel-purple)] border-4 border-[var(--pixel-red)] pixel-border ${damageEnemy ? 'shake' : ''}`}>
            <div className="space-y-4">
              <h3 className="text-2xl pixel-text text-[var(--pixel-white)] text-center">
                👾 {enemy.name}
              </h3>
              
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs pixel-text text-[var(--pixel-white)] mb-1">
                    <span>HP</span>
                    <span>{enemy.hp}/{enemy.maxHp}</span>
                  </div>
                  <div className="h-4 bg-[var(--pixel-dark)] pixel-border border-2 border-[var(--pixel-white)]">
                    <div
                      className="h-full bg-[var(--pixel-red)] transition-all duration-300"
                      style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pixel-text text-[var(--pixel-white)]">
                <div>⚔️ ATK: {enemy.attack}</div>
                <div>🛡️ DEF: {enemy.defense}</div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-4 bg-[var(--pixel-dark)] border-4 border-[var(--pixel-white)] pixel-border min-h-[120px]">
          <div className="space-y-2">
            {battleLog.map((log, index) => (
              <div
                key={index}
                className="text-xs pixel-text text-[var(--pixel-white)] animate-fade-in"
              >
                &gt; {log}
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-4">
          <Button
            onClick={playerAttack}
            disabled={!isPlayerTurn}
            className="bg-[var(--pixel-red)] hover:bg-[var(--pixel-red)]/80 text-[var(--pixel-white)] pixel-text text-sm py-8 pixel-border border-4 border-[var(--pixel-white)] disabled:opacity-50"
          >
            ⚔️<br />АТАКА
          </Button>
          
          <Button
            onClick={playerMagic}
            disabled={!isPlayerTurn || player.mp < 20}
            className="bg-[var(--pixel-cyan)] hover:bg-[var(--pixel-cyan)]/80 text-[var(--pixel-dark)] pixel-text text-sm py-8 pixel-border border-4 border-[var(--pixel-white)] disabled:opacity-50"
          >
            ✨<br />МАГИЯ
          </Button>
          
          <Button
            onClick={playerDefend}
            disabled={!isPlayerTurn}
            className="bg-[var(--pixel-blue)] hover:bg-[var(--pixel-blue)]/80 text-[var(--pixel-white)] pixel-text text-sm py-8 pixel-border border-4 border-[var(--pixel-white)] disabled:opacity-50"
          >
            🛡️<br />ЗАЩИТА
          </Button>
        </div>

        <Button
          onClick={() => setScreen('menu')}
          variant="outline"
          className="w-full bg-transparent text-[var(--pixel-white)] pixel-text text-xs border-2 border-[var(--pixel-white)] hover:bg-[var(--pixel-white)] hover:text-[var(--pixel-dark)]"
        >
          ВЫЙТИ
        </Button>
      </div>
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
                    <div>Счет: {record.score}</div>
                    <div className="text-[var(--pixel-cyan)]">{record.turns} ходов • {record.date}</div>
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
      {screen === 'battle' && renderBattle()}
      {screen === 'records' && renderRecords()}
    </>
  );
};

export default Index;
