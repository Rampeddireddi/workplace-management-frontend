import { ArrowUpRight, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function KpiCard({ title, value, subtitle, trend, tone = 'blue', to = null }) {
  const toneClasses = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-100',
    purple: 'bg-violet-50 text-violet-700 ring-violet-100',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    red: 'bg-rose-50 text-rose-700 ring-rose-100',
  };

  const statContent = (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ring-1 ${toneClasses[tone] || toneClasses.blue}`}>
          {trend == null ? <Minus className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
          {trend == null ? 'N/A' : trend}
        </div>
      </div>

      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{subtitle}</div>
    </>
  );

  if (!to) {
    return <div className="stat-card p-5">{statContent}</div>;
  }

  return (
    <Link to={to} className="stat-card block p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      {statContent}
    </Link>
  );
}
