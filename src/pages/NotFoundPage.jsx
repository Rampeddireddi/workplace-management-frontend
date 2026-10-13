export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="card max-w-md p-8 text-center">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">404</div>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-slate-600">The route you requested does not exist, or access is restricted.</p>
      </div>
    </div>
  );
}
