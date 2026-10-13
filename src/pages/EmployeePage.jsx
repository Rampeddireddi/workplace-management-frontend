import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import apiClient from '../api/apiClient';
import { KpiCard } from '../components/KpiCard';

const comparisonMeta = {
  meetings: 'Meeting effectiveness',
  office: 'Office utilisation',
  engagement: 'Engagement',
  learning: 'Learning participation',
  hybrid: 'Hybrid work effectiveness',
};

export function EmployeePage() {
  const { employeeId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const fetchEmployee = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await apiClient.get(`/people/${employeeId}`);
        if (active) {
          setData(res.data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load employee report.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchEmployee();
    return () => {
      active = false;
    };
  }, [employeeId]);

  const cards = useMemo(() => {
    if (!data?.kpis) return [];

    return [
      { title: 'Meeting Effectiveness', value: data.kpis.meetings?.meetingEffectivenessScore != null ? `${data.kpis.meetings.meetingEffectivenessScore}%` : '—', subtitle: `${data.kpis.meetings?.totalMeetings ?? 0} meetings`, tone: 'blue' },
      { title: 'Office Utilisation', value: data.kpis.office?.attendanceRate != null ? `${data.kpis.office.attendanceRate}%` : '—', subtitle: `${data.kpis.office?.totalOfficeDays ?? 0} office days`, tone: 'purple' },
      { title: 'Employee Engagement', value: data.kpis.engagement?.avgWorkingHours != null ? `${data.kpis.engagement.avgWorkingHours.toFixed(1)}h` : '—', subtitle: `${data.kpis.engagement?.totalPresentDays ?? 0} present days`, tone: 'green' },
      { title: 'Learning Participation', value: data.kpis.learning?.completionRate != null ? `${data.kpis.learning.completionRate}%` : '—', subtitle: `${data.kpis.learning?.completed ?? 0} completed`, tone: 'amber' },
      { title: 'Hybrid Work Effectiveness', value: data.kpis.hybrid?.avgHoursPerOfficeDay != null ? `${data.kpis.hybrid.avgHoursPerOfficeDay.toFixed(1)}h` : '—', subtitle: `${data.kpis.hybrid?.totalOfficeHours ?? 0}h office`, tone: 'red' },
    ];
  }, [data]);

  const comparisonCards = useMemo(() => {
    if (!data?.comparison) return [];
    return Object.entries(data.comparison).map(([key, item]) => ({
      title: comparisonMeta[key] || key,
      value: item?.betterThanPercent != null ? `${item.betterThanPercent}%` : '—',
      subtitle: item?.betterThanPercent != null ? `Better than ${item.betterThanPercent}% of peers` : 'Limited peer comparison',
      tone: 'blue',
    }));
  }, [data]);

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="spinner" /></div>;
  }

  if (error) {
    return <div className="card p-6 text-red-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Employee</div>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{data?.employee?.name}</h2>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-slate-600">
            <span className="badge badge-blue">{data?.employee?.role}</span>
            <span className="badge badge-purple">{data?.employee?.department}</span>
            <span className="badge badge-gray">{data?.employee?.location}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        {cards.map((card) => (
          <KpiCard key={card.title} {...card} />
        ))}
      </div>

      {comparisonCards.length > 0 && (
        <div className="card p-5">
          <div className="mb-4 text-lg font-semibold text-slate-900">Peer comparison</div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {comparisonCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{card.title}</div>
                <div className="mt-3 text-2xl font-bold text-slate-900">{card.value}</div>
                <div className="mt-1 text-sm text-slate-600">{card.subtitle}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 text-lg font-semibold text-slate-900">Meeting trend</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.trends?.meetings || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="effectiveness" stroke="#2563eb" fill="#bfdbfe" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-4 text-lg font-semibold text-slate-900">Working hours</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.trends?.engagement || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avgWorkingHours" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
