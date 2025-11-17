import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface GameRecord {
  id: number;
  score: number;
  wave: number;
  date: string;
}

interface RecordsTableProps {
  records: GameRecord[];
  onBackToMenu: () => void;
}

const RecordsTable = ({ records, onBackToMenu }: RecordsTableProps) => {
  return (
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
          onClick={onBackToMenu}
          className="w-full bg-[var(--pixel-cyan)] hover:bg-[var(--pixel-blue)] text-[var(--pixel-dark)] pixel-text text-sm py-6 pixel-border border-2 border-[var(--pixel-white)]"
        >
          НАЗАД
        </Button>
      </Card>
    </div>
  );
};

export default RecordsTable;
