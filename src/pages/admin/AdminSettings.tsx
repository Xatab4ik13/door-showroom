import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const demoManagers = [
  { id: '1', name: 'Администратор', login: 'admin', role: 'admin' as const },
  { id: '2', name: 'Менеджер', login: 'manager', role: 'manager' as const },
];

const roleLabel = { admin: 'Админ', manager: 'Менеджер' };

const AdminSettings = () => (
  <div className="space-y-6 max-w-2xl">
    <h1
      className="text-3xl tracking-wider uppercase text-foreground"
      style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 500 }}
    >
      Настройки
    </h1>

    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle
          className="text-lg uppercase tracking-wider"
          style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 500 }}
        >
          Сотрудники
        </CardTitle>
        <Button size="sm" className="gap-2 bg-[hsl(205,85%,45%)] hover:bg-[hsl(205,85%,40%)] text-white">
          <Plus className="w-4 h-4" />
          <span style={{ fontFamily: "'Manrope', sans-serif" }}>Добавить</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {demoManagers.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-4 border-b border-border/50 last:border-0">
              <div>
                <p className="font-medium text-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  {m.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Логин: <span className="text-foreground">{m.login}</span>
                </p>
              </div>
              <span
                className={`text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-full ${
                  m.role === 'admin'
                    ? 'bg-[hsl(205,85%,45%)]/10 text-[hsl(205,85%,45%)]'
                    : 'bg-muted text-muted-foreground'
                }`}
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {roleLabel[m.role]}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default AdminSettings;
