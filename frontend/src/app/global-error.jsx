'use client';

export default function GlobalError({
  error,
  reset,
}) {
  return (
    <html lang="fa">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">خطایی در سامانه رخ داده است</h2>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            تلاش مجدد
          </button>
        </div>
      </body>
    </html>
  );
}
