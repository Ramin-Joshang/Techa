'use client';

import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null);
  const [selectedCategory, setSelectedCategory] = useState<string>('همه');
  const [query, setQuery] = useState<string>('');

  const categories = ['همه', ...Array.from(new Set(items.map((item) => item.category)))];

  const filtered = items.filter((item) => {
    const matchesCat = selectedCategory === 'همه' || item.category === selectedCategory;
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery =
      !normalizedQuery ||
      item.question.toLowerCase().includes(normalizedQuery) ||
      item.answer.toLowerCase().includes(normalizedQuery);
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Search & Category Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-4 shadow-xs">
        <div className="relative">
          <Search className="h-4 w-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در میان پرسش‌ها..."
            className="w-full rounded-xl border border-gray-200 bg-slate-50 pr-10 pl-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  active
                    ? 'bg-[#042A1B] text-[#7AE36A]'
                    : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center space-y-2">
          <p className="text-sm font-bold text-gray-800">پرسشی مطابق جستجوی شما یافت نشد</p>
          <p className="text-xs text-gray-500">
            عبارت دیگری را امتحان کنید یا از صفحه تماس با ما سوال خود را بپرسید.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-colors ${
                  isOpen ? 'border-emerald-300 shadow-sm' : 'border-gray-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-right"
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-emerald-700 block">
                      {item.category}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-gray-950 block">
                      {item.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-700' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-100 text-justify">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
