'use client';

import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Bold,
  Code,
  Image as ImageIcon,
  Italic,
  Link2,
  Plus,
  Strikethrough,
  Trash2,
  Underline,
  Video as VideoIcon,
  FileDown,
} from 'lucide-react';
import {
  CALLOUT_TYPES,
  CODE_LANGUAGES,
  CalloutType,
  CodeLanguage,
  ContentBlock,
  LIST_FORMATS,
  ListFormat,
  MediaType,
  getUtf8ByteLength,
} from '@techa/shared';
import { formatBytes, resolvePreviewMediaUrl } from '../../../lib/admin/admin-formatters';
import { AdminMediaDto } from '../../../lib/admin/admin-types';
import { MediaPickerModal } from '../media/MediaPickerModal';
import { AdminButton } from '../ui/AdminPrimitives';
import { AdminField, AdminInput, AdminSelect, AdminTextarea } from '../ui/AdminFormFields';
import { InteractiveExampleBlockEditor } from './InteractiveExampleBlockEditor';

const CALLOUT_LABELS: Record<CalloutType, string> = {
  info: 'اطلاع‌رسانی (Info)',
  tip: 'نکته کلیدی (Tip)',
  warning: 'هشدار (Warning)',
  danger: 'خطر / خطای رایج (Danger)',
};

export function BlockFormBody({
  block,
  onChange,
}: {
  block: ContentBlock;
  onChange: (next: ContentBlock) => void;
}) {
  const [pickerConfig, setPickerConfig] = useState<{
    open: boolean;
    mediaType?: MediaType;
    targetField: 'primary' | 'poster';
  }>({ open: false, targetField: 'primary' });

  switch (block.type) {
    // 1. Heading
    case 'heading':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <AdminField label="سطح تیتر">
            <AdminSelect
              value={block.data.level}
              onChange={(e) =>
                onChange({
                  ...block,
                  data: { ...block.data, level: Number(e.target.value) as 2 | 3 | 4 },
                })
              }
            >
              <option value={2}>H2 (عنوان اصلی بخش)</option>
              <option value={3}>H3 (زیربخش)</option>
              <option value={4}>H4 (عنوان فرعی)</option>
            </AdminSelect>
          </AdminField>
          <div className="sm:col-span-3">
            <AdminField
              label="متن تیتر"
              required
              counter={`${block.data.text.length}/250`}
            >
              <AdminInput
                value={block.data.text}
                maxLength={250}
                onChange={(e) =>
                  onChange({ ...block, data: { ...block.data, text: e.target.value } })
                }
                placeholder="عنوان بخش را وارد کنید..."
              />
            </AdminField>
          </div>
        </div>
      );

    // 2. Paragraph
    case 'paragraph':
      return (
        <AdminField
          label="متن پاراگراف"
          required
          counter={`${block.data.text.length}/5000`}
        >
          <AdminTextarea
            rows={4}
            maxLength={5000}
            value={block.data.text}
            onChange={(e) =>
              onChange({ ...block, data: { ...block.data, text: e.target.value } })
            }
            placeholder="متن توضیحی این پاراگراف را بنویسید..."
          />
        </AdminField>
      );

    // 3. Rich Text (Structured Spans)
    case 'richText': {
      const spans = block.data.spans;
      const updateSpan = (idx: number, patch: Partial<(typeof spans)[number]>) => {
        const nextSpans = spans.map((sp, i) => (i === idx ? { ...sp, ...patch } : sp));
        onChange({ ...block, data: { spans: nextSpans } });
      };

      const addSpan = () => {
        if (spans.length >= 100) return;
        onChange({ ...block, data: { spans: [...spans, { text: ' قطعه متن جدید' }] } });
      };

      const removeSpan = (idx: number) => {
        if (spans.length <= 1) return;
        onChange({ ...block, data: { spans: spans.filter((_, i) => i !== idx) } });
      };

      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              قطعات متن ساختاریافته ({spans.length} قطعه)
            </span>
            <AdminButton
              variant="outline"
              size="sm"
              onClick={addSpan}
              disabled={spans.length >= 100}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              افزودن قطعه متن
            </AdminButton>
          </div>

          <div className="space-y-2.5">
            {spans.map((sp, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 space-y-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <AdminInput
                    value={sp.text}
                    maxLength={1000}
                    onChange={(e) => updateSpan(idx, { text: e.target.value })}
                    placeholder="متن قطعه..."
                    className="flex-1 min-w-[200px]"
                  />

                  <div className="flex items-center gap-1">
                    {(
                      [
                        { key: 'bold', label: 'ضخیم', icon: <Bold className="w-3.5 h-3.5" /> },
                        { key: 'italic', label: 'کج', icon: <Italic className="w-3.5 h-3.5" /> },
                        { key: 'code', label: 'کد', icon: <Code className="w-3.5 h-3.5" /> },
                        {
                          key: 'underline',
                          label: 'زیرخط',
                          icon: <Underline className="w-3.5 h-3.5" />,
                        },
                        {
                          key: 'strikethrough',
                          label: 'خط‌خورده',
                          icon: <Strikethrough className="w-3.5 h-3.5" />,
                        },
                      ] as const
                    ).map((btn) => {
                      const active = Boolean(sp[btn.key]);
                      return (
                        <button
                          key={btn.key}
                          type="button"
                          title={btn.label}
                          onClick={() => updateSpan(idx, { [btn.key]: !active })}
                          className={`p-2 rounded-md border text-xs transition-colors ${
                            active
                              ? 'bg-[#042A1B] text-white border-[#042A1B]'
                              : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {btn.icon}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      title="افزودن/حذف لینک"
                      onClick={() =>
                        updateSpan(idx, {
                          link: sp.link ? undefined : { url: 'https://techa.ir', openInNewTab: true },
                        })
                      }
                      className={`p-2 rounded-md border text-xs transition-colors ${
                        sp.link
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <Link2 className="w-3.5 h-3.5" />
                    </button>

                    {spans.length > 1 && (
                      <button
                        type="button"
                        title="حذف قطعه"
                        onClick={() => removeSpan(idx)}
                        className="p-2 rounded-md border border-slate-300 bg-white text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {sp.link && (
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <AdminInput
                      dir="ltr"
                      value={sp.link.url}
                      onChange={(e) =>
                        updateSpan(idx, {
                          link: { ...sp.link!, url: e.target.value },
                        })
                      }
                      placeholder="https://example.com"
                      className="flex-1 min-w-[200px] font-mono text-xs min-h-[36px]"
                    />
                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(sp.link.openInNewTab)}
                        onChange={(e) =>
                          updateSpan(idx, {
                            link: { ...sp.link!, openInNewTab: e.target.checked },
                          })
                        }
                        className="accent-emerald-700"
                      />
                      <span>باز شدن در تب جدید</span>
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 4. Code Block
    case 'codeBlock': {
      const codeBytes = getUtf8ByteLength(block.data.code || '');
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <AdminField label="زبان برنامه‌نویسی" required>
              <AdminSelect
                value={block.data.language}
                onChange={(e) =>
                  onChange({
                    ...block,
                    data: { ...block.data, language: e.target.value as CodeLanguage },
                  })
                }
              >
                {CODE_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>

            <AdminField label="عنوان فایل / توضیح کوتاه (اختیاری)">
              <AdminInput
                dir="ltr"
                value={block.data.title || ''}
                maxLength={100}
                onChange={(e) =>
                  onChange({ ...block, data: { ...block.data, title: e.target.value } })
                }
                placeholder="src/index.ts"
                className="font-mono text-xs"
              />
            </AdminField>

            <label className="inline-flex items-center gap-2 text-xs text-slate-700 min-h-[40px] cursor-pointer">
              <input
                type="checkbox"
                checked={block.data.showLineNumbers !== false}
                onChange={(e) =>
                  onChange({
                    ...block,
                    data: { ...block.data, showLineNumbers: e.target.checked },
                  })
                }
                className="accent-emerald-700"
              />
              <span>نمایش شماره خطوط</span>
            </label>
          </div>

          <AdminField
            label="کد"
            required
            counter={`${formatBytes(codeBytes)} / 50 KB`}
          >
            <AdminTextarea
              dir="ltr"
              rows={8}
              spellCheck={false}
              value={block.data.code}
              onChange={(e) =>
                onChange({ ...block, data: { ...block.data, code: e.target.value } })
              }
              className="font-mono text-xs bg-slate-950 text-slate-100 border-slate-800"
            />
          </AdminField>
        </div>
      );
    }

    // 5. Image Block
    case 'image': {
      const previewUrl = resolvePreviewMediaUrl(block.data.storageKey);
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[220px]">
              <AdminField label="کلید ذخیره‌سازی تصویر (storageKey)" required>
                <AdminInput
                  dir="ltr"
                  className="font-mono text-xs"
                  value={block.data.storageKey}
                  onChange={(e) =>
                    onChange({
                      ...block,
                      data: { ...block.data, storageKey: e.target.value },
                    })
                  }
                  placeholder="media/lesson_image/..."
                />
              </AdminField>
            </div>
            <AdminButton
              variant="outline"
              onClick={() =>
                setPickerConfig({ open: true, mediaType: 'image', targetField: 'primary' })
              }
              icon={<ImageIcon className="w-4 h-4" />}
            >
              انتخاب یا آپلود تصویر
            </AdminButton>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AdminField
              label="متن جایگزین (Alt Text)"
              required
              counter={`${block.data.altText.length}/200`}
            >
              <AdminInput
                value={block.data.altText}
                maxLength={200}
                onChange={(e) =>
                  onChange({ ...block, data: { ...block.data, altText: e.target.value } })
                }
                placeholder="توضیح تصویر برای دسترس‌پذیری..."
              />
            </AdminField>

            <AdminField label="کپشن زیر تصویر (اختیاری)" counter={`${(block.data.caption || '').length}/300`}>
              <AdminInput
                value={block.data.caption || ''}
                maxLength={300}
                onChange={(e) =>
                  onChange({ ...block, data: { ...block.data, caption: e.target.value } })
                }
                placeholder="توضیح زیر تصویر..."
              />
            </AdminField>
          </div>

          {previewUrl && previewUrl.startsWith('/') && (
            <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={block.data.altText || 'پیش‌نمایش'}
                className="max-h-36 rounded object-contain"
              />
            </div>
          )}

          <MediaPickerModal
            open={pickerConfig.open}
            onClose={() => setPickerConfig((p) => ({ ...p, open: false }))}
            allowedMediaType="image"
            defaultCategory="lesson_image"
            title="انتخاب تصویر درس"
            onSelect={(media: AdminMediaDto) => {
              onChange({
                ...block,
                data: {
                  ...block.data,
                  storageKey: media.storageKey,
                  altText: block.data.altText || media.altText || media.originalFileName,
                  width: media.width || block.data.width,
                  height: media.height || block.data.height,
                },
              });
            }}
          />
        </div>
      );
    }

    // 6. Video Block
    case 'video':
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[220px]">
              <AdminField label="کلید ذخیره‌سازی ویدیو (storageKey)" required>
                <AdminInput
                  dir="ltr"
                  className="font-mono text-xs"
                  value={block.data.storageKey}
                  onChange={(e) =>
                    onChange({ ...block, data: { ...block.data, storageKey: e.target.value } })
                  }
                  placeholder="media/lesson_video/..."
                />
              </AdminField>
            </div>
            <AdminButton
              variant="outline"
              onClick={() =>
                setPickerConfig({ open: true, mediaType: 'video', targetField: 'primary' })
              }
              icon={<VideoIcon className="w-4 h-4" />}
            >
              انتخاب / آپلود ویدیو
            </AdminButton>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="sm:col-span-2 flex items-end gap-2">
              <div className="flex-1">
                <AdminField label="تصویر کاور ویدیو (Poster اختیاری)">
                  <AdminInput
                    dir="ltr"
                    className="font-mono text-xs"
                    value={block.data.posterStorageKey || ''}
                    onChange={(e) =>
                      onChange({
                        ...block,
                        data: { ...block.data, posterStorageKey: e.target.value },
                      })
                    }
                    placeholder="media/lesson_image/..."
                  />
                </AdminField>
              </div>
              <AdminButton
                variant="outline"
                onClick={() =>
                  setPickerConfig({ open: true, mediaType: 'image', targetField: 'poster' })
                }
              >
                انتخاب کاور
              </AdminButton>
            </div>

            <AdminField label="مدت زمان (ثانیه)">
              <AdminInput
                type="number"
                min={1}
                dir="ltr"
                value={block.data.durationSeconds ?? ''}
                onChange={(e) =>
                  onChange({
                    ...block,
                    data: {
                      ...block.data,
                      durationSeconds: e.target.value ? Number(e.target.value) : undefined,
                    },
                  })
                }
                placeholder="360"
              />
            </AdminField>
          </div>

          <AdminField label="کپشن ویدیو (اختیاری)" counter={`${(block.data.caption || '').length}/300`}>
            <AdminInput
              value={block.data.caption || ''}
              maxLength={300}
              onChange={(e) =>
                onChange({ ...block, data: { ...block.data, caption: e.target.value } })
              }
              placeholder="توضیح ویدیو..."
            />
          </AdminField>

          <MediaPickerModal
            open={pickerConfig.open}
            onClose={() => setPickerConfig((p) => ({ ...p, open: false }))}
            allowedMediaType={pickerConfig.mediaType}
            defaultCategory={pickerConfig.targetField === 'poster' ? 'lesson_image' : 'lesson_video'}
            title={
              pickerConfig.targetField === 'poster' ? 'انتخاب تصویر کاور ویدیو' : 'انتخاب ویدیوی درس'
            }
            onSelect={(media: AdminMediaDto) => {
              if (pickerConfig.targetField === 'poster') {
                onChange({
                  ...block,
                  data: { ...block.data, posterStorageKey: media.storageKey },
                });
              } else {
                onChange({
                  ...block,
                  data: { ...block.data, storageKey: media.storageKey },
                });
              }
            }}
          />
        </div>
      );

    // 7. Table Block
    case 'table': {
      const { headers, rows } = block.data;

      const addCol = () => {
        if (headers.length >= 10) return;
        onChange({
          ...block,
          data: {
            headers: [...headers, `ستون ${headers.length + 1}`],
            rows: rows.map((r) => [...r, '']),
          },
        });
      };

      const removeCol = (colIdx: number) => {
        if (headers.length <= 1) return;
        onChange({
          ...block,
          data: {
            headers: headers.filter((_, i) => i !== colIdx),
            rows: rows.map((r) => r.filter((_, i) => i !== colIdx)),
          },
        });
      };

      const addRow = () => {
        if (rows.length >= 100) return;
        onChange({
          ...block,
          data: {
            headers,
            rows: [...rows, headers.map(() => '')],
          },
        });
      };

      const removeRow = (rowIdx: number) => {
        if (rows.length <= 1) return;
        onChange({
          ...block,
          data: {
            headers,
            rows: rows.filter((_, i) => i !== rowIdx),
          },
        });
      };

      return (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <AdminButton
              variant="outline"
              size="sm"
              onClick={addCol}
              disabled={headers.length >= 10}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              افزودن ستون ({headers.length}/10)
            </AdminButton>
            <AdminButton
              variant="outline"
              size="sm"
              onClick={addRow}
              disabled={rows.length >= 100}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              افزودن ردیف ({rows.length}/100)
            </AdminButton>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {headers.map((h, colIdx) => (
                    <th key={colIdx} className="p-2 min-w-[140px]">
                      <div className="flex items-center gap-1">
                        <AdminInput
                          value={h}
                          maxLength={100}
                          onChange={(e) => {
                            const nextHeaders = [...headers];
                            nextHeaders[colIdx] = e.target.value;
                            onChange({ ...block, data: { headers: nextHeaders, rows } });
                          }}
                          className="text-xs min-h-[34px] font-semibold"
                        />
                        {headers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCol(colIdx)}
                            className="p-1 text-slate-400 hover:text-red-600"
                            title="حذف ستون"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="w-10 p-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {row.map((cell, colIdx) => (
                      <td key={colIdx} className="p-2">
                        <AdminInput
                          value={cell}
                          maxLength={500}
                          onChange={(e) => {
                            const nextRows = rows.map((r, ri) =>
                              ri === rowIdx ? r.map((c, ci) => (ci === colIdx ? e.target.value : c)) : r
                            );
                            onChange({ ...block, data: { headers, rows: nextRows } });
                          }}
                          className="text-xs min-h-[34px]"
                        />
                      </td>
                    ))}
                    <td className="p-2 text-center">
                      {rows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(rowIdx)}
                          className="p-1 text-slate-400 hover:text-red-600"
                          title="حذف ردیف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // 8. Callout Block
    case 'callout':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <AdminField label="نوع پیام">
              <AdminSelect
                value={block.data.type}
                onChange={(e) =>
                  onChange({
                    ...block,
                    data: { ...block.data, type: e.target.value as CalloutType },
                  })
                }
              >
                {CALLOUT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {CALLOUT_LABELS[t]}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>

            <div className="sm:col-span-2">
              <AdminField label="عنوان (اختیاری)" counter={`${(block.data.title || '').length}/100`}>
                <AdminInput
                  value={block.data.title || ''}
                  maxLength={100}
                  onChange={(e) =>
                    onChange({ ...block, data: { ...block.data, title: e.target.value } })
                  }
                />
              </AdminField>
            </div>
          </div>

          <AdminField label="متن پیام" required counter={`${block.data.text.length}/2000`}>
            <AdminTextarea
              rows={3}
              maxLength={2000}
              value={block.data.text}
              onChange={(e) =>
                onChange({ ...block, data: { ...block.data, text: e.target.value } })
              }
            />
          </AdminField>
        </div>
      );

    // 9. Quote Block
    case 'quote':
      return (
        <div className="space-y-3">
          <AdminField label="متن نقل‌قول" required counter={`${block.data.text.length}/1000`}>
            <AdminTextarea
              rows={3}
              maxLength={1000}
              value={block.data.text}
              onChange={(e) =>
                onChange({ ...block, data: { ...block.data, text: e.target.value } })
              }
            />
          </AdminField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AdminField label="نام نویسنده / گوینده (اختیاری)">
              <AdminInput
                value={block.data.author || ''}
                maxLength={100}
                onChange={(e) =>
                  onChange({ ...block, data: { ...block.data, author: e.target.value } })
                }
              />
            </AdminField>
            <AdminField label="لینک منبع (اختیاری)">
              <AdminInput
                dir="ltr"
                className="font-mono text-xs"
                value={block.data.citationUrl || ''}
                maxLength={255}
                onChange={(e) =>
                  onChange({ ...block, data: { ...block.data, citationUrl: e.target.value } })
                }
                placeholder="https://..."
              />
            </AdminField>
          </div>
        </div>
      );

    // 10. Divider Block
    case 'divider':
      return (
        <div className="py-2">
          <hr className="border-t border-slate-300" />
          <p className="text-[11px] text-slate-400 text-center mt-2">
            خط جداکننده افقی بین بخش‌های درس
          </p>
        </div>
      );

    // 11. Downloadable File Block
    case 'downloadableFile':
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[220px]">
              <AdminField label="کلید ذخیره‌سازی فایل (storageKey)" required>
                <AdminInput
                  dir="ltr"
                  className="font-mono text-xs"
                  value={block.data.storageKey}
                  onChange={(e) =>
                    onChange({ ...block, data: { ...block.data, storageKey: e.target.value } })
                  }
                  placeholder="media/downloadable_asset/..."
                />
              </AdminField>
            </div>
            <AdminButton
              variant="outline"
              onClick={() =>
                setPickerConfig({ open: true, mediaType: 'document', targetField: 'primary' })
              }
              icon={<FileDown className="w-4 h-4" />}
            >
              انتخاب یا آپلود فایل
            </AdminButton>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <AdminField label="عنوان نمایشی فایل" required>
                <AdminInput
                  value={block.data.title}
                  maxLength={150}
                  onChange={(e) =>
                    onChange({ ...block, data: { ...block.data, title: e.target.value } })
                  }
                />
              </AdminField>
            </div>
            <AdminField label="حجم فایل (بایت)" required>
              <AdminInput
                type="number"
                min={1}
                dir="ltr"
                value={block.data.sizeBytes}
                onChange={(e) =>
                  onChange({
                    ...block,
                    data: { ...block.data, sizeBytes: Math.max(1, Number(e.target.value) || 1) },
                  })
                }
              />
            </AdminField>
          </div>

          <AdminField label="توضیح فایل (اختیاری)">
            <AdminInput
              value={block.data.description || ''}
              maxLength={500}
              onChange={(e) =>
                onChange({ ...block, data: { ...block.data, description: e.target.value } })
              }
            />
          </AdminField>

          <MediaPickerModal
            open={pickerConfig.open}
            onClose={() => setPickerConfig((p) => ({ ...p, open: false }))}
            allowedMediaType="document"
            defaultCategory="downloadable_asset"
            title="انتخاب فایل ضمیمه قابل دانلود"
            onSelect={(media: AdminMediaDto) => {
              onChange({
                ...block,
                data: {
                  ...block.data,
                  storageKey: media.storageKey,
                  sizeBytes: media.sizeBytes,
                  title: block.data.title || media.originalFileName,
                },
              });
            }}
          />
        </div>
      );

    // 12. List Block
    case 'list': {
      const { format, items } = block.data;

      const moveItem = (idx: number, dir: -1 | 1) => {
        const target = idx + dir;
        if (target < 0 || target >= items.length) return;
        const copy = [...items];
        const [item] = copy.splice(idx, 1);
        copy.splice(target, 0, item);
        onChange({ ...block, data: { format, items: copy } });
      };

      return (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="w-56">
              <AdminSelect
                value={format}
                onChange={(e) =>
                  onChange({
                    ...block,
                    data: { format: e.target.value as ListFormat, items },
                  })
                }
              >
                {LIST_FORMATS.map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {fmt === 'ordered' ? 'فهرست شماره‌دار (Ordered)' : 'فهرست نقطه‌ای (Unordered)'}
                  </option>
                ))}
              </AdminSelect>
            </div>
            <AdminButton
              variant="outline"
              size="sm"
              disabled={items.length >= 50}
              onClick={() =>
                onChange({ ...block, data: { format, items: [...items, 'مورد جدید'] } })
              }
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              افزودن مورد ({items.length}/50)
            </AdminButton>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 w-6 text-center tabular-nums">
                  {format === 'ordered' ? `${idx + 1}.` : '•'}
                </span>
                <AdminInput
                  value={item}
                  maxLength={500}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = e.target.value;
                    onChange({ ...block, data: { format, items: next } });
                  }}
                />
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveItem(idx, -1)}
                  className="p-2 rounded border border-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-40"
                  aria-label="بالا"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === items.length - 1}
                  onClick={() => moveItem(idx, 1)}
                  className="p-2 rounded border border-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-40"
                  aria-label="پایین"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...block,
                        data: { format, items: items.filter((_, i) => i !== idx) },
                      })
                    }
                    className="p-2 rounded border border-slate-200 text-red-600 hover:bg-red-50"
                    aria-label="حذف مورد"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 13. Interactive Example Block
    case 'interactiveExample':
      return (
        <InteractiveExampleBlockEditor
          data={block.data}
          onChange={(nextData) => onChange({ ...block, data: nextData })}
        />
      );
  }
}
