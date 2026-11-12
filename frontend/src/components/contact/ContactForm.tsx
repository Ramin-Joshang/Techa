'use client';

import React, { useState } from 'react';
import { CheckCircle2, Send, AlertCircle } from 'lucide-react';

const TOPICS = [
  'مشاوره انتخاب مسیر و دوره آموزشی',
  'پرسش درباره سرفصل‌ها و مستندات',
  'کارآموزی و معرفی به بازار کار',
  'همکاری دانشگاهی و تولید محتوا',
  'گزارش خطای فنی یا پیشنهاد بهبود',
];

export default function ContactForm() {
  const [fullName, setFullName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submittedRecord, setSubmittedRecord] = useState<{
    fullName: string;
    topic: string;
    trackingCode: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = fullName.trim();
    const trimmedContact = contactInfo.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 2) {
      setError('لطفاً نام و نام خانوادگی خود را وارد کنید.');
      return;
    }
    if (trimmedContact.length < 5) {
      setError('لطفاً شماره تماس یا ایمیل معتبر وارد کنید.');
      return;
    }
    if (trimmedMessage.length < 10) {
      setError('متن پیام باید حداقل ۱۰ کاراکتر باشد تا کارشناسان ما بتوانند پاسخ دقیق بدهند.');
      return;
    }

    const trackingCode = `TC-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedRecord({
      fullName: trimmedName,
      topic,
      trackingCode,
    });
    setFullName('');
    setContactInfo('');
    setMessage('');
  };

  if (submittedRecord) {
    return (
      <div className="bg-white rounded-3xl border border-emerald-200 p-8 text-center space-y-4 shadow-sm">
        <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-black text-gray-950">پیام شما با موفقیت ثبت شد</h3>
        <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
          <strong className="text-gray-900">{submittedRecord.fullName}</strong> عزیز، درخواست شما در موضوع{' '}
          <strong className="text-gray-900">«{submittedRecord.topic}»</strong> دریافت شد. در روزهای کاری حداکثر تا ۲۴ ساعت با شما تماس گرفته می‌شود.
        </p>
        <div className="inline-flex items-center gap-2 bg-slate-50 border border-gray-200 rounded-xl px-4 py-2 text-xs">
          <span className="text-gray-500">کد پیگیری:</span>
          <span className="font-mono font-bold text-emerald-800" dir="ltr">
            {submittedRecord.trackingCode}
          </span>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setSubmittedRecord(null)}
            className="px-5 py-2.5 rounded-xl bg-[#042A1B] text-white text-xs font-bold hover:bg-[#063d28] transition-colors"
          >
            ارسال پیام جدید
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-5 shadow-xs"
      noValidate
    >
      <div className="space-y-1">
        <h2 className="text-xl font-black text-gray-950">ارسال مستقیم پیام یا مشاوره</h2>
        <p className="text-xs sm:text-sm text-gray-500">
          فرم زیر را تکمیل کنید تا کارشناسان آموزشی تکا در کوتاه‌ترین زمان با شما ارتباط بگیرند.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2.5 text-xs text-red-800 font-medium">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="contact-name" className="block text-xs font-bold text-gray-700">
            نام و نام خانوادگی
          </label>
          <input
            id="contact-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="مثلاً: سارا محمدی"
            required
            className="w-full rounded-xl border border-gray-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contact-channel" className="block text-xs font-bold text-gray-700">
            شماره تماس یا ایمیل
          </label>
          <input
            id="contact-channel"
            type="text"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            placeholder="09120000000 یا email@domain.com"
            dir="ltr"
            required
            className="w-full rounded-xl border border-gray-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-gray-900 text-right focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-topic" className="block text-xs font-bold text-gray-700">
          موضوع درخواست
        </label>
        <select
          id="contact-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
        >
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-message" className="block text-xs font-bold text-gray-700">
          شرح پیام
        </label>
        <textarea
          id="contact-message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="پرسش یا توضیح خود را با جزئیات بنویسید..."
          required
          className="w-full rounded-xl border border-gray-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all resize-y"
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <span className="text-xs text-gray-500">
          پاسخگویی در روزهای شنبه تا چهارشنبه، ساعت ۹ تا ۱۷
        </span>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#042A1B] hover:bg-[#07422a] text-white font-bold text-sm transition-colors"
        >
          <Send className="h-4 w-4 text-[#7AE36A]" />
          <span>ثبت و ارسال پیام</span>
        </button>
      </div>
    </form>
  );
}
