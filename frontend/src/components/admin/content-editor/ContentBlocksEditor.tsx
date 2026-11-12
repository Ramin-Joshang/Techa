'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  CONTENT_BLOCK_TYPES,
  ContentBlock,
  ContentBlockType,
  MAX_LESSON_BLOCKS_PAYLOAD_BYTES,
  MAX_LESSON_CONTENT_BLOCKS,
} from '@techa/shared';
import {
  CONTENT_BLOCK_LABELS,
  formatBytes,
  formatPersianNumber,
  prepareBlocksForPreview,
} from '../../../lib/admin/admin-formatters';
import ContentBlocksRenderer from '../../docs/content/ContentBlocksRenderer';
import { AdminButton, AdminModal } from '../ui/AdminPrimitives';
import { BlockFormBody } from './BlockForms';
import {
  createDefaultBlock,
  duplicateBlock,
  validateBlocksWithSharedSchema,
} from './block-factories';

const BLOCK_PICKER_CATEGORIES: Array<{
  title: string;
  types: ContentBlockType[];
}> = [
  {
    title: 'متن و ساختار',
    types: ['heading', 'paragraph', 'richText', 'list', 'table', 'callout', 'quote', 'divider'],
  },
  {
    title: 'کد و محیط تعاملی',
    types: ['codeBlock', 'interactiveExample'],
  },
  {
    title: 'رسانه و فایل‌ها',
    types: ['image', 'video', 'downloadableFile'],
  },
];

export default function ContentBlocksEditor({
  blocks,
  onChange,
  disabled = false,
}: {
  blocks: ContentBlock[];
  onChange: (nextBlocks: ContentBlock[]) => void;
  disabled?: boolean;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [insertAtIndex, setInsertAtIndex] = useState<number | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [previewBlockIds, setPreviewBlockIds] = useState<Set<string>>(new Set());
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const validation = useMemo(() => validateBlocksWithSharedSchema(blocks), [blocks]);

  const openPickerAt = (idx: number | null) => {
    setInsertAtIndex(idx);
    setPickerOpen(true);
  };

  const handleInsertBlock = (type: ContentBlockType) => {
    if (blocks.length >= MAX_LESSON_CONTENT_BLOCKS) return;
    const newBlock = createDefaultBlock(type);
    const next = [...blocks];
    if (insertAtIndex === null || insertAtIndex >= next.length) {
      next.push(newBlock);
    } else {
      next.splice(insertAtIndex, 0, newBlock);
    }
    onChange(next);
    setPickerOpen(false);
  };

  const moveBlock = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= blocks.length || fromIdx === toIdx) return;
    const next = [...blocks];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    onChange(next);
  };

  const handleDuplicate = (idx: number) => {
    if (blocks.length >= MAX_LESSON_CONTENT_BLOCKS) return;
    const copy = duplicateBlock(blocks[idx]);
    const next = [...blocks];
    next.splice(idx + 1, 0, copy);
    onChange(next);
  };

  const handleRemove = (idx: number) => {
    const next = blocks.filter((_, i) => i !== idx);
    onChange(next);
  };

  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleBlockPreview = (id: string) => {
    setPreviewBlockIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar Header */}
      <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 tabular-nums">
          <span>
            تعداد بلوک‌ها:{' '}
            <strong className="text-slate-900">
              {formatPersianNumber(blocks.length)} / {formatPersianNumber(MAX_LESSON_CONTENT_BLOCKS)}
            </strong>
          </span>
          <span className="text-slate-300">|</span>
          <span>
            حجم محتوا:{' '}
            <strong
              dir="ltr"
              className={
                validation.totalBytes > MAX_LESSON_BLOCKS_PAYLOAD_BYTES
                  ? 'text-red-600'
                  : 'text-slate-900'
              }
            >
              {formatBytes(validation.totalBytes)} / 2 MB
            </strong>
          </span>
          {!validation.valid && (
            <span className="inline-flex items-center gap-1 text-red-600 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>دارای خطای اعتبارسنجی</span>
            </span>
          )}
        </div>

        <AdminButton
          variant="primary"
          size="sm"
          disabled={disabled || blocks.length >= MAX_LESSON_CONTENT_BLOCKS}
          onClick={() => openPickerAt(null)}
          icon={<Plus className="w-4 h-4" />}
        >
          افزودن بلوک محتوا
        </AdminButton>
      </div>

      {validation.arrayErrors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 space-y-1">
          {validation.arrayErrors.map((err, i) => (
            <div key={i}>{err}</div>
          ))}
        </div>
      )}

      {/* Block List Canvas */}
      {blocks.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-lg p-10 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-800">هنوز هیچ بلوک محتوایی اضافه نشده است</p>
          <p className="text-xs text-slate-500">
            می‌توانید از میان ۱۳ نوع بلوک (تیتر، پاراگراف، متن غنی، کد، تصویر، ویدیو، جدول، مثال تعاملی و...) ساختار درس را بسازید.
          </p>
          <AdminButton
            variant="primary"
            size="sm"
            disabled={disabled}
            onClick={() => openPickerAt(0)}
            icon={<Plus className="w-4 h-4" />}
          >
            افزودن اولین بلوک
          </AdminButton>
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, idx) => {
            const isCollapsed = collapsedIds.has(block.id);
            const isPreviewing = previewBlockIds.has(block.id);
            const blockErrors = validation.blockErrors[idx] || [];

            return (
              <div
                key={block.id}
                draggable={!disabled}
                onDragStart={() => setDragIdx(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIdx !== null && dragIdx !== idx) {
                    moveBlock(dragIdx, idx);
                  }
                  setDragIdx(null);
                }}
                onDragEnd={() => setDragIdx(null)}
                className={`bg-white border rounded-lg transition-colors ${
                  blockErrors.length > 0
                    ? 'border-red-300'
                    : dragIdx === idx
                      ? 'border-emerald-500 opacity-75'
                      : 'border-slate-200'
                }`}
              >
                {/* Block Card Header */}
                <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="text-slate-400 cursor-grab active:cursor-grabbing"
                      title="جابجایی با کشیدن و رها کردن"
                    >
                      <GripVertical className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-mono text-slate-400 tabular-nums">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {CONTENT_BLOCK_LABELS[block.type]}
                    </span>
                    <span className="hidden sm:inline font-mono text-[11px] text-slate-400" dir="ltr">
                      {block.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleBlockPreview(block.id)}
                      className={`p-1.5 rounded border text-xs transition-colors ${
                        isPreviewing
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="پیش‌نمایش این بلوک"
                    >
                      {isPreviewing ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      disabled={disabled || idx === 0}
                      onClick={() => moveBlock(idx, idx - 1)}
                      className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                      title="انتقال به بالا"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={disabled || idx === blocks.length - 1}
                      onClick={() => moveBlock(idx, idx + 1)}
                      className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                      title="انتقال به پایین"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={disabled || blocks.length >= MAX_LESSON_CONTENT_BLOCKS}
                      onClick={() => handleDuplicate(idx)}
                      className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                      title="تکثیر بلوک"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCollapse(block.id)}
                      className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                      title={isCollapsed ? 'باز کردن' : 'جمع کردن'}
                    >
                      {isCollapsed ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronUp className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handleRemove(idx)}
                      className="p-1.5 rounded border border-slate-200 bg-white text-red-600 hover:bg-red-50 disabled:opacity-40"
                      title="حذف بلوک"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {blockErrors.length > 0 && (
                  <div className="px-4 py-2 bg-red-50/70 border-b border-red-200 text-xs text-red-700 space-y-0.5">
                    {blockErrors.map((msg, errIdx) => (
                      <div key={errIdx} className="flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{msg}</span>
                      </div>
                    ))}
                  </div>
                )}

                {!isCollapsed && (
                  <div className="p-4">
                    {isPreviewing ? (
                      <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <ContentBlocksRenderer blocks={prepareBlocksForPreview([block])} />
                      </div>
                    ) : (
                      <BlockFormBody
                        block={block}
                        onChange={(updatedBlock) => {
                          const next = blocks.map((b, i) => (i === idx ? updatedBlock : b));
                          onChange(next);
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Quick Insert Below */}
                <div className="px-4 py-1.5 border-t border-slate-100 flex justify-center">
                  <button
                    type="button"
                    disabled={disabled || blocks.length >= MAX_LESSON_CONTENT_BLOCKS}
                    onClick={() => openPickerAt(idx + 1)}
                    className="text-[11px] text-slate-400 hover:text-emerald-700 font-medium inline-flex items-center gap-1 transition-colors py-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>افزودن بلوک در این نقطه</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Categorized 13-Block Picker Modal */}
      <AdminModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="انتخاب نوع بلوک محتوا"
        description={`تمامی ${formatPersianNumber(CONTENT_BLOCK_TYPES.length)} نوع بلوک استاندارد موتور محتوای تکا`}
        maxWidthClass="max-w-2xl"
      >
        <div className="space-y-5">
          {BLOCK_PICKER_CATEGORIES.map((category) => (
            <div key={category.title} className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500">{category.title}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {category.types.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleInsertBlock(type)}
                    className="text-right px-3.5 py-2.5 rounded-lg border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/40 transition-colors flex items-center justify-between gap-2"
                  >
                    <span className="text-xs font-semibold text-slate-900">
                      {CONTENT_BLOCK_LABELS[type]}
                    </span>
                    <Plus className="w-4 h-4 text-emerald-700 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </AdminModal>
    </div>
  );
}
