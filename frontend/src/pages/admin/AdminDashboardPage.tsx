import {
  useDashboardStats,
  useStatusBreakdown,
  useDepartmentBreakdown,
  useResolutionTrend,
} from '@/hooks/queries/useAnalytics';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  pending: '#ffb95f',
  assigned: '#adc6ff',
  in_progress: '#ffb786',
  resolved: '#4d8eff',
  closed: '#8c909f',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Beklemede',
  assigned: 'Atandı',
  in_progress: 'İşlemde',
  resolved: 'Çözüldü',
  closed: 'Kapatıldı',
};

const chartTooltipStyle = {
  backgroundColor: '#1d2027',
  border: '1px solid #424754',
  borderRadius: '8px',
  color: '#e1e2ec',
  fontSize: '12px',
};

export function AdminDashboardPage() {
  const { data: stats } = useDashboardStats();
  const { data: statusData = [] } = useStatusBreakdown();
  const { data: deptData = [] } = useDepartmentBreakdown();
  const { data: trendData = [] } = useResolutionTrend(30);

  const pieData = (statusData as { status: string; count: string }[]).map((d) => ({
    name: STATUS_LABELS[d.status] || d.status,
    value: parseInt(d.count),
    color: STATUS_COLORS[d.status] || '#8c909f',
  }));

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-md">
        <h2 className="font-headline-lg text-headline-lg text-on-background font-bold">Dashboard</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Sistem genel bakış</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-sm mb-md">
        {[
          { label: 'Toplam', value: stats?.total, icon: 'inbox', color: 'text-on-surface' },
          { label: 'Beklemede', value: stats?.pending, icon: 'pending', color: 'text-secondary' },
          { label: 'İşlemde', value: stats?.inProgress, icon: 'cached', color: 'text-tertiary' },
          { label: 'Çözüldü', value: stats?.resolved, icon: 'check_circle', color: 'text-primary' },
        ].map((s) => (
          <div key={s.label} className="bg-surface-container border border-outline-variant rounded-xl p-md">
            <div className="flex items-center justify-between mb-xs">
              <p className="font-label-md text-label-md text-on-surface-variant uppercase">{s.label}</p>
              <span className={`material-symbols-outlined ${s.color}`} style={{ fontSize: '20px' }}>{s.icon}</span>
            </div>
            <p className={`font-headline-xl text-headline-xl font-bold ${s.color}`}>{s.value ?? '—'}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md mb-md">
        <div className="bg-surface-container border border-outline-variant rounded-xl p-md">
          <h3 className="font-label-md text-label-md text-on-surface-variant uppercase mb-md">Durum Dağılımı</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={85} innerRadius={45}>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface-container border border-outline-variant rounded-xl p-md">
          <h3 className="font-label-md text-label-md text-on-surface-variant uppercase mb-md">Departman Dağılımı</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptData as { department: string; count: string }[]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#424754" />
              <XAxis dataKey="department" tick={{ fontSize: 10, fill: '#c2c6d6' }} />
              <YAxis tick={{ fontSize: 10, fill: '#c2c6d6' }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="count" fill="#adc6ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-surface-container border border-outline-variant rounded-xl p-md">
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase mb-md">Son 30 Gün — Şikayet Trendi</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData as { date: string; count: string }[]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#424754" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#c2c6d6' }}
              tickFormatter={(v) => new Date(v).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
            />
            <YAxis tick={{ fontSize: 10, fill: '#c2c6d6' }} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Line type="monotone" dataKey="count" stroke="#adc6ff" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
