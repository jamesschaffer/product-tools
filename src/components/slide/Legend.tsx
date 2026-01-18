export function Legend() {
  return (
    <div className="flex items-center justify-center gap-6">
      <div className="flex items-center gap-2">
        <div className="w-3.5 h-3.5 rounded bg-slate-800" />
        <span className="text-xs text-slate-600">Shipped</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3.5 h-3.5 rounded bg-teal-600" />
        <span className="text-xs text-slate-600">In Progress</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3.5 h-3.5 rounded bg-white border border-slate-300" />
        <span className="text-xs text-slate-600">Planned</span>
      </div>
    </div>
  );
}
