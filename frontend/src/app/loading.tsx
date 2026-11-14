export default function HomeLoading() {
  return (
    <div className="w-full min-h-screen bg-white">
      <div className="bg-[#042A1B] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-10 items-center animate-pulse">
          <div className="lg:col-span-7 space-y-5">
            <div className="h-7 w-48 rounded-lg bg-white/10" />
            <div className="h-12 w-3/4 rounded-xl bg-white/15" />
            <div className="h-20 w-full rounded-xl bg-white/10" />
            <div className="flex gap-3">
              <div className="h-11 w-44 rounded-xl bg-[#7AE36A]/30" />
              <div className="h-11 w-44 rounded-xl bg-white/10" />
            </div>
          </div>
          <div className="lg:col-span-5 flex flex-col items-center gap-6">
            <div className="w-64 h-64 rounded-full bg-white/10" />
            <div className="w-full max-w-md h-20 rounded-2xl bg-white/10" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-8 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 overflow-hidden bg-white"
            >
              <div className="h-44 bg-slate-200" />
              <div className="p-6 space-y-3">
                <div className="h-4 w-2/3 bg-slate-200 rounded" />
                <div className="h-6 w-full bg-slate-200 rounded" />
                <div className="h-12 w-full bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
