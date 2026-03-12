import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const demoManagers = [
  { id: '1', name: 'Администратор', login: 'admin', role: 'admin' as const },
  { id: '2', name: 'Менеджер', login: 'manager', role: 'manager' as const },
];

const roleLabel = { admin: 'Админ', manager: 'Менеджер' };

const AdminSettings = () => (
  <div className="space-y-6 max-w-2xl">
    <h1 className="text-2xl font-semibold text-foreground">Настройки</h1>

    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Сотрудники</CardTitle>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Добавить
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {demoManagers.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <div>
                <p className="font-medium text-foreground">{m.name}</p>
                <p className="text-sm text-muted-foreground">Логин: {m.login}</p>
              </div>
              <Badge variant={m.role === 'admin' ? 'default' : 'secondary'}>
                {roleLabel[m.role]}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default AdminSettings;
