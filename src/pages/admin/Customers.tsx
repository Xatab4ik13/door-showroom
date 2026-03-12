import { Search } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const demoCustomers = [
  { id: '1', name: 'Иванов Алексей', phone: '+7 900 111-22-33', orders: 3, total: '87 200 ₽', lastOrder: '12.03.2026' },
  { id: '2', name: 'Петрова Мария', phone: '+7 900 444-55-66', orders: 1, total: '34 500 ₽', lastOrder: '11.03.2026' },
  { id: '3', name: 'Сидоров Кирилл', phone: '+7 900 777-88-99', orders: 5, total: '142 600 ₽', lastOrder: '10.03.2026' },
  { id: '4', name: 'Козлова Елена', phone: '+7 900 222-33-44', orders: 2, total: '54 000 ₽', lastOrder: '09.03.2026' },
  { id: '5', name: 'Николаев Дмитрий', phone: '+7 900 555-66-77', orders: 1, total: '22 400 ₽', lastOrder: '08.03.2026' },
];

const Customers = () => {
  const [search, setSearch] = useState('');

  const filtered = demoCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search),
  );

  return (
    <div className="space-y-6">
      <h1
        className="text-3xl tracking-wider uppercase text-foreground"
        style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 500 }}
      >
        Клиенты
      </h1>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по имени или телефону..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card border-border focus-visible:ring-[hsl(205,85%,45%)]"
        />
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
              <thead>
                <tr className="border-b border-border text-left">
                  <th
                    className="p-4 font-medium text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    Имя
                  </th>
                  <th
                    className="p-4 font-medium text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    Телефон
                  </th>
                  <th
                    className="p-4 font-medium text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    Заказов
                  </th>
                  <th
                    className="p-4 font-medium text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    Сумма
                  </th>
                  <th
                    className="p-4 font-medium text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    Последний заказ
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors">
                    <td className="p-4 font-medium text-foreground">{c.name}</td>
                    <td className="p-4 text-muted-foreground">{c.phone}</td>
                    <td className="p-4">
                      <span
                        className="font-semibold text-foreground"
                        style={{ fontFamily: "'Oswald', sans-serif" }}
                      >
                        {c.orders}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-foreground">{c.total}</td>
                    <td className="p-4 text-muted-foreground">{c.lastOrder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">Клиенты не найдены</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;
