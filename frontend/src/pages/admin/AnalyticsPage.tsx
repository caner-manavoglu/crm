import { useStaffPerformance, useResolutionTrend, useStatusBreakdown } from '@/hooks/queries/useAnalytics';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts';

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

interface StaffPerf {
  name: string;
  surname: string;
  totalAssigned: string;
}

export function AnalyticsPage() {
  const { data: staffPerf = [], isLoading } = useStaffPerformance();
  const { data: trendData = [] } = useResolutionTrend(30);
  const { data: statusData = [] } = useStatusBreakdown();

  const perf = (staffPerf as StaffPerf[]).map((s) => ({
    name: `${s.name} ${s.surname}`,
    total: parseInt(s.totalAssigned),
  }));

  const statusList = (statusData as { status: string; count: string }[]).map((d) => ({
    label: STATUS_LABELS[d.status] || d.status,
    count: parseInt(d.count),
  }));

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-md">
        <h2 className="font-headline-lg text-headline-lg text-on-background font-bold">Analitik</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Personel performansı ve eğilimler</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-sm mb-md">
        {statusList.map((s) => (
          <div key={s.label} className="bg-surface-container border border-outline-variant rounded-xl p-md">
            <p className="font-label-md text-label-md text-on-surface-variant uppercase">{s.label}</p>
            <p className="font-headline-xl text-headline-xl font-bold text-on-surface mt-xs">{s.count}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-container border border-outline-variant rounded-xl p-md mb-md">
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase mb-md">Personel İş Yükü</h3>
        {perf.length === 0 ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant text-center py-lg">Veri yok.</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(220, perf.length * 36)}>
            <BarChart data={perf} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#424754" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#c2c6d6' }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: '#c2c6d6' }} />
              <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(173,198,255,0.08)' }} />
              <Bar dataKey="total" name="Toplam Atama" fill="#adc6ff" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-surface-container border border-outline-variant rounded-xl p-md mb-md">
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase mb-md">Son 30 Gün — Şikayet Trendi</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData as { date: string; count: string }[]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#424754" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#c2c6d6' }}
              tickFormatter={(v) => new Date(v).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
            />
            <YAxis tick={{ fontSize: 10, fill: '#c2c6d6' }} allowDecimals={false} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Line type="monotone" dataKey="count" stroke="#adc6ff" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
        <div className="px-md py-sm border-b border-outline-variant">
          <h3 className="font-label-md text-label-md text-on-surface-variant uppercase">Personel Sıralaması</h3>
        </div>
        {isLoading ? (
          <div className="flex h-32 items-center justify-center gap-sm text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin" style={{ fontSize: '20px' }}>progress_activity</span>
            <span className="font-body-sm text-body-sm">Yükleniyor...</span>
          </div>
        ) : perf.length === 0 ? (
          <p className="px-md py-xl text-center font-body-sm text-body-sm text-on-surface-variant">Veri yok.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline-variant">
                <th className="px-md py-sm text-left font-label-md text-label-md text-on-surface-variant uppercase">#</th>
                <th className="px-md py-sm text-left font-label-md text-label-md text-on-surface-variant uppercase">Personel</th>
                <th className="px-md py-sm text-right font-label-md text-label-md text-on-surface-variant uppercase">Toplam Atama</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {perf.map((p, i) => (
                <tr key={p.name} className="hover:bg-surface-container-highest/50 transition-colors">
                  <td className="px-md py-sm font-body-sm text-body-sm text-on-surface-variant">{i + 1}</td>
                  <td className="px-md py-sm font-body-sm text-body-sm text-on-surface font-medium">{p.name}</td>
                  <td className="px-md py-sm text-right font-body-sm text-body-sm text-on-surface font-semibold">{p.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
