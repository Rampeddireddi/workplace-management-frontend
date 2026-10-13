import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import apiClient from '../api/apiClient';
import { KpiCard } from '../components/KpiCard';

export function SustainabilityPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const fetchSustainability = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await apiClient.get('/reports/sustainability');
        if (active) {
          setData(res.data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load sustainability report.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchSustainability();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="spinner" /></div>;
  }

  if (error) {
    return <div className="card p-6 text-red-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard title="Energy" value={data?.summary?.totalEnergy != null ? `${data.summary.totalEnergy.toFixed(1)} kWh` : '—'} subtitle="Total operational energy" tone="green" />
        <KpiCard title="Carbon" value={data?.summary?.totalCarbon != null ? `${data.summary.totalCarbon.toFixed(1)} kg` : '—'} subtitle="Estimated emissions" tone="blue" />
        <KpiCard title="Paper" value={data?.summary?.totalPaper != null ? `${data.summary.totalPaper.toFixed(1)} kg` : '—'} subtitle="Paper usage" tone="amber" />
        <KpiCard title="Recycled" value={data?.summary?.totalRecycled != null ? `${data.summary.totalRecycled.toFixed(1)} kg` : '—'} subtitle="Recovered material" tone="purple" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 text-lg font-semibold text-slate-900">Energy and carbon trend</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.weeklyTrend || []}>
                <defs>
                  <linearGradient id="sustainabilityFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="officeEnergyKwh" stroke="#059669" fill="url(#sustainabilityFill)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-4 text-lg font-semibold text-slate-900">Department resource usage</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.departmentBreakdown || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="officeEnergyKwh" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-3 text-lg font-semibold text-slate-900">Context</div>
        <p className="text-sm text-slate-600">{data?.note}</p>
      </div>
    </div>
  );
}
