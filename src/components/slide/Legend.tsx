export function Legend() {
  return (
    <div className="flex items-center justify-center gap-6">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-green-600" />
        <span className="text-xs text-slate-600">Shipped</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
        <span className="text-xs text-slate-600">In Progress</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-white border border-slate-300" />
        <span className="text-xs text-slate-600">Planned</span>
      </div>
    </div>
  );
}
