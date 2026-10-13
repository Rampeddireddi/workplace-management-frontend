import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import apiClient from '../api/apiClient';
import { KpiCard } from '../components/KpiCard';

const meta = {
  meetings: {
    title: 'Meeting Effectiveness',
    endpoint: 'meetings',
    tone: 'blue',
  },
  office: {
    title: 'Office Utilisation',
    endpoint: 'office',
    tone: 'purple',
  },
  engagement: {
    title: 'Employee Engagement',
    endpoint: 'engagement',
    tone: 'green',
  },
  learning: {
    title: 'Learning Participation',
    endpoint: 'learning',
    tone: 'amber',
  },
  hybrid: {
    title: 'Hybrid Work Effectiveness',
    endpoint: 'hybrid',
    tone: 'red',
  },
};

const palette = ['#2563eb', '#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

const aiSuggestions = {
  meetings: [
    'Reduce recurring meeting time by 15% by trimming status updates into async updates.',
    'Create short standing agendas for cross-functional reviews to improve decision speed.',
    'Follow up with departments showing low feedback scores to identify blockers in weekly reviews.',
  ],
  office: [
    'Improve desk-sharing utilization by aligning team schedules to office peak days.',
    'Review underused office days and redistribute in-office events to higher attendance periods.',
    'Offer staggered start times to reduce peak-hour congestion and improve space utilization.',
  ],
  engagement: [
    'Target attendance consistency issues by identifying teams with repeated late starts.',
    'Use pulse check-ins for the lowest-performing departments to surface morale risks early.',
    'Recognize teams with strong consistency and reuse their scheduling patterns across functions.',
  ],
  learning: [
    'Promote short, role-aligned learning paths to improve completion rates without overload.',
    'Send reminders to employees with in-progress courses nearing the deadline.',
    'Align course topics with the most common team skill gaps identified in performance reviews.',
  ],
  hybrid: [
    'Balance remote and office schedules to reduce strain on collaboration-heavy days.',
    'Review departments with the highest remote-time variance and standardize hybrid norms.',
    'Shift recurring workshops to office days with stronger attendance to boost team connectivity.',
  ],
};

export function ReportsPage() {
  const { kpi } = useParams();
  const normalizedKpi = kpi === 'meeting' ? 'meetings' : meta[kpi] ? kpi : 'meetings';
  const key = normalizedKpi;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ startDate: '2024-09-02', endDate: '2024-10-11' });
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchReport = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await apiClient.get(`/reports/${meta[key].endpoint}`, { params: filters });
        if (active) {
          setReport(res.data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load report.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchReport();
    return () => {
      active = false;
    };
  }, [filters, key]);

  const summaryCards = useMemo(() => {
    if (!report?.summary) return [];

    const map = {
      meetings: [
        { title: 'Effectiveness', value: report.summary.meetingEffectivenessScore != null ? `${report.summary.meetingEffectivenessScore}%` : '—', subtitle: 'Average feedback-based score', tone: 'blue' },
        { title: 'Meetings', value: report.summary.totalMeetings ?? '—', subtitle: 'Completed this period', tone: 'blue' },
        { title: 'Hours', value: report.summary.totalMeetingHours != null ? `${report.summary.totalMeetingHours.toFixed(1)}h` : '—', subtitle: 'Total meeting hours', tone: 'blue' },
      ],
      office: [
        { title: 'Attendance rate', value: report.summary.attendanceRate != null ? `${report.summary.attendanceRate}%` : '—', subtitle: 'Office utilisation rate', tone: 'purple' },
        { title: 'Office Days', value: report.summary.totalOfficeDays ?? '—', subtitle: 'Office attendance days', tone: 'purple' },
        { title: 'WFH Days', value: report.summary.totalWfhDays ?? '—', subtitle: 'Remote work days', tone: 'purple' },
      ],
      engagement: [
        { title: 'Avg Sign-in', value: report.summary.avgSignIn || '—', subtitle: 'Average start time', tone: 'green' },
        { title: 'Avg Sign-out', value: report.summary.avgSignOut || '—', subtitle: 'Average end time', tone: 'green' },
        { title: 'Avg Hours', value: report.summary.avgWorkingHours != null ? `${report.summary.avgWorkingHours.toFixed(1)}h` : '—', subtitle: 'Average working hours', tone: 'green' },
      ],
      learning: [
        { title: 'Completion', value: report.summary.completionRate != null ? `${report.summary.completionRate}%` : '—', subtitle: 'Completion rate across activities', tone: 'amber' },
        { title: 'Enrollments', value: report.summary.totalEnrollments ?? '—', subtitle: 'Total records in scope', tone: 'amber' },
        { title: 'Learning hours', value: report.summary.totalLearningHours != null ? `${report.summary.totalLearningHours.toFixed(1)}h` : '—', subtitle: 'Total learning effort', tone: 'amber' },
      ],
      hybrid: [
        { title: 'Office Hours', value: report.summary.totalOfficeHours != null ? `${report.summary.totalOfficeHours.toFixed(1)}h` : '—', subtitle: 'Office work time', tone: 'red' },
        { title: 'WFH Hours', value: report.summary.totalWfhHours != null ? `${report.summary.totalWfhHours.toFixed(1)}h` : '—', subtitle: 'Remote work time', tone: 'red' },
        { title: 'Avg Office Day', value: report.summary.avgHoursPerOfficeDay != null ? `${report.summary.avgHoursPerOfficeDay.toFixed(1)}h` : '—', subtitle: 'Average hours in-office', tone: 'red' },
      ],
    };

    return map[key] || [];
  }, [report, key]);

  const statusBreakdown = useMemo(() => {
    if (!report?.records) return [];
    const counts = { completed: 0, 'in-progress': 0, enrolled: 0 };

    report.records.forEach((record) => {
      const status = record.status || 'enrolled';
      if (counts[status] != null) {
        counts[status] += 1;
      }
    });

    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({ status, count }));
  }, [report]);

  const trendSeriesKey = {
    meetings: 'totalHours',
    office: 'officeDays',
    engagement: 'avgWorkingHours',
    learning: 'learningHours',
    hybrid: 'totalHours',
  }[key];

  const departmentSeriesKey = {
    meetings: 'totalHours',
    office: 'officeDays',
    engagement: 'avgWorkingHours',
    learning: 'learningHours',
    hybrid: 'totalHours',
  }[key];

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="spinner" /></div>;
  }

  if (error) {
    return <div className="card p-6 text-red-700">{error}</div>;
  }

  const trendData = report?.weeklyTrend || [];
  const departmentData = report?.departmentBreakdown || [];
  const typeData = report?.typeBreakdown || [];

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">KPI</div>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{meta[key].title}</h2>
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
      </div>

      <div className="card p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {Object.entries(meta).map(([slug, item]) => (
              <Link
                key={slug}
                to={`/reports/${slug}`}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  key === slug
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {item.title}
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowAiSuggestions((current) => !current)}
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            {showAiSuggestions ? 'Hide AI suggestions' : 'AI improvement suggestions'}
          </button>
        </div>
      </div>

      {showAiSuggestions && (
        <div className="card p-5">
          <div className="mb-4 text-lg font-semibold text-slate-900">AI improvement suggestions</div>
          <div className="space-y-3">
            {(aiSuggestions[key] || []).map((suggestion, index) => (
              <div key={`${key}-${index}`} className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-slate-700">
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                  {index + 1}
                </div>
                <div>{suggestion}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
          <KpiCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 text-lg font-semibold text-slate-900">
            {key === 'hybrid' ? 'Hybrid weekly hours' : 'Weekly trend'}
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              {key === 'engagement' ? (
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avgWorkingHours" stroke="#10b981" strokeWidth={3} name="Avg working hours" />
                </LineChart>
              ) : key === 'hybrid' ? (
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="officeHours" stackId="hours" fill="#2563eb" name="Office" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="wfhHours" stackId="hours" fill="#7c3aed" name="WFH" radius={[8, 8, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey={trendSeriesKey} stroke="#2563eb" fill="url(#trendFill)" strokeWidth={3} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-4 text-lg font-semibold text-slate-900">Department comparison</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey={departmentSeriesKey} fill="#7c3aed" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {key === 'meetings' && typeData.length > 0 && (
        <div className="card p-5">
          <div className="mb-4 text-lg font-semibold text-slate-900">Meeting type distribution</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeData} dataKey="count" nameKey="type" innerRadius={55} outerRadius={95} paddingAngle={3} label>
                  {typeData.map((entry, index) => (
                    <Cell key={entry.type || index} fill={palette[index % palette.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {key === 'learning' && statusBreakdown.length > 0 && (
        <div className="card p-5">
          <div className="mb-4 text-lg font-semibold text-slate-900">Course status distribution</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusBreakdown} dataKey="count" nameKey="status" innerRadius={55} outerRadius={95} paddingAngle={3} label>
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={entry.status || index} fill={palette[index % palette.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
