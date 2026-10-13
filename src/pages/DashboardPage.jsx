import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { KpiCard } from '../components/KpiCard';
import { formatHours } from '../utils/formatters';

const defaultFilters = { startDate: '2024-09-02', endDate: '2024-10-11' };

export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    let active = true;

    const fetchDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await apiClient.get('/dashboard', { params: filters });
        if (active) {
          setData(res.data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load dashboard.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();
    return () => {
      active = false;
    };
  }, [filters]);

  const cards = useMemo(() => {
    if (!data) return [];

    return [
      {
        title: 'Meeting Effectiveness',
        value: data.meetings?.meetingEffectivenessScore != null ? `${data.meetings.meetingEffectivenessScore}%` : '—',
        subtitle: `${data.meetings?.totalMeetings ?? 0} meetings • ${formatHours(data.meetings?.totalMeetingHours)}`,
        trend: data.meetings?.meetingEffectivenessScore != null ? `${data.meetings.meetingEffectivenessScore.toFixed(1)}%` : null,
        tone: 'blue',
        to: '/reports/meetings',
      },
      {
        title: 'Office Utilisation',
        value: data.office?.attendanceRate != null ? `${data.office.attendanceRate}%` : '—',
        subtitle: `${data.office?.totalOfficeDays ?? 0} office days • ${data.office?.totalWfhDays ?? 0} WFH days`,
        trend: data.office?.attendanceRate != null ? `${data.office.attendanceRate.toFixed(1)}%` : null,
        tone: 'purple',
        to: '/reports/office',
      },
      {
        title: 'Employee Engagement',
        value: data.engagement?.avgWorkingHours != null ? `${data.engagement.avgWorkingHours.toFixed(1)}h` : '—',
        subtitle: `Avg sign-in ${data.engagement?.avgSignIn || '—'} • Avg sign-out ${data.engagement?.avgSignOut || '—'}`,
        trend: data.engagement?.avgWorkingHours != null ? `${data.engagement.avgWorkingHours.toFixed(1)}h` : null,
        tone: 'green',
        to: '/reports/engagement',
      },
      {
        title: 'Learning Participation',
        value: data.learning?.completionRate != null ? `${data.learning.completionRate}%` : '—',
        subtitle: `${data.learning?.completed ?? 0} completed • ${data.learning?.totalLearningHours ?? 0}h tracked`,
        trend: data.learning?.completionRate != null ? `${data.learning.completionRate.toFixed(1)}%` : null,
        tone: 'amber',
        to: '/reports/learning',
      },
      {
        title: 'Hybrid Work Effectiveness',
        value: data.hybrid?.avgHoursPerOfficeDay != null ? `${data.hybrid.avgHoursPerOfficeDay.toFixed(1)}h` : '—',
        subtitle: `${data.hybrid?.totalOfficeHours ?? 0}h office • ${data.hybrid?.totalWfhHours ?? 0}h remote`,
        trend: data.hybrid?.avgHoursPerOfficeDay != null ? `${data.hybrid.avgHoursPerOfficeDay.toFixed(1)}h` : null,
        tone: 'red',
        to: '/reports/hybrid',
      },
    ];
  }, [data]);

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="spinner" /></div>;
  }

  if (error) {
    return <div className="card p-6 text-red-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Role</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">{user?.role || 'Employee'} access</div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="form-label" htmlFor="startDate">Start date</label>
            <input
              id="startDate"
              type="date"
              className="form-input"
              value={filters.startDate}
              onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))}
            />
          </div>
          <div>
            <label className="form-label" htmlFor="endDate">End date</label>
            <input
              id="endDate"
              type="date"
              className="form-input"
              value={filters.endDate}
              onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        {cards.map((card) => (
          <KpiCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 text-lg font-semibold text-slate-900">Meeting effectiveness trend</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.weeklyMeetingTrend || []}>
                <defs>
                  <linearGradient id="meetingFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="effectiveness" stroke="#2563eb" fill="url(#meetingFill)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-4 text-lg font-semibold text-slate-900">Office utilisation</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.weeklyOfficeTrend || []}>
                <defs>
                  <linearGradient id="officeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="officeRate" stroke="#7c3aed" fill="url(#officeFill)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-4 text-lg font-semibold text-slate-900">Engagement hours</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.weeklyEngagementTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avgWorkingHours" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} name="Avg working hours" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-4 text-lg font-semibold text-slate-900">Learning participation</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyLearningTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="learningHours" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5 xl:col-span-2">
          <div className="mb-4 text-lg font-semibold text-slate-900">Hybrid work balance</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyHybridTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="officeHours" stackId="work" fill="#2563eb" radius={[8, 8, 0, 0]} name="Office" />
                <Bar dataKey="wfhHours" stackId="work" fill="#7c3aed" radius={[8, 8, 0, 0]} name="WFH" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
