'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Globe,
  Image as ImageIcon,
  Layout,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Trash2,
} from 'lucide-react';
import { AdminUpdateSiteSettingsDtoSchema, NavigationItem, SocialLink } from '@techa/shared';
import AdminGuard from '../../../components/admin/auth/AdminGuard';
import { MediaPickerModal } from '../../../components/admin/media/MediaPickerModal';
import {
  AdminField,
  AdminInput,
  AdminSelect,
  AdminTextarea,
} from '../../../components/admin/ui/AdminFormFields';
import {
  AdminButton,
  AdminErrorState,
  AdminPageHeader,
  ConflictResolutionModal,
} from '../../../components/admin/ui/AdminPrimitives';
import { useAdminToast } from '../../../components/admin/ui/ToastProvider';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { AdminApiError, adminClient } from '../../../lib/admin/admin-client';
import { formatPersianDateTime, resolvePreviewMediaUrl } from '../../../lib/admin/admin-formatters';
import { AdminSiteSettingsDto } from '../../../lib/admin/admin-types';
import { useUnsavedChangesWarning } from '../../../lib/admin/use-unsaved-guard';

type SettingsTab = 'general' | 'branding' | 'header' | 'footer' | 'seo';

interface SettingsFormState {
  general: {
    primaryDomain: string;
    supportContact: string;
    timezone: string;
  };
  branding: {
    siteName: string;
    siteDescription: string;
    logoMediaKey: string;
    faviconMediaKey: string;
    defaultOgImageMediaKey: string;
  };
  header: {
    logoText: string;
    navigationItems: NavigationItem[];
    ctaButton: {
      label: string;
      url: string;
      enabled: boolean;
    };
  };
  footer: {
    description: string;
    copyright: string;
    linkGroups: Array<{
      title: string;
      links: NavigationItem[];
    }>;
    socialLinks: SocialLink[];
  };
  seo: {
    defaultMetaTitle: string;
    defaultMetaDescription: string;
    robotsPolicy: 'index, follow' | 'noindex, nofollow' | 'index, nofollow';
  };
}

function mapDtoToForm(dto: AdminSiteSettingsDto): SettingsFormState {
  return {
    general: {
      primaryDomain: dto.general?.primaryDomain || '',
      supportContact: dto.general?.supportContact || '',
      timezone: dto.general?.timezone || 'Asia/Tehran',
    },
    branding: {
      siteName: dto.branding?.siteName || '',
      siteDescription: dto.branding?.siteDescription || '',
      logoMediaKey: dto.branding?.logoMediaKey || '',
      faviconMediaKey: dto.branding?.faviconMediaKey || '',
      defaultOgImageMediaKey: dto.branding?.defaultOgImageMediaKey || '',
    },
    header: {
      logoText: dto.header?.logoText || '',
      navigationItems: (dto.header?.navigationItems || []).map((item, idx) => ({
        id: item.id || `nav-${idx + 1}`,
        label: item.label || '',
        path: item.path || '/',
        external: Boolean(item.external),
        order: typeof item.order === 'number' ? item.order : idx + 1,
      })),
      ctaButton: {
        label: dto.header?.ctaButton?.label || '',
        url: dto.header?.ctaButton?.url || '',
        enabled: dto.header?.ctaButton?.enabled ?? false,
      },
    },
    footer: {
      description: dto.footer?.description || '',
      copyright: dto.footer?.copyright || '',
      linkGroups: (dto.footer?.linkGroups || []).map((grp) => ({
        title: grp.title || '',
        links: (grp.links || []).map((l, idx) => ({
          id: l.id || `flink-${idx + 1}`,
          label: l.label || '',
          path: l.path || '/',
          external: Boolean(l.external),
          order: typeof l.order === 'number' ? l.order : idx + 1,
        })),
      })),
      socialLinks: (dto.footer?.socialLinks || []).map((s) => ({
        platform: s.platform || '',
        label: s.label || '',
        url: s.url || '',
      })),
    },
    seo: {
      defaultMetaTitle: dto.seo?.defaultMetaTitle || '',
      defaultMetaDescription: dto.seo?.defaultMetaDescription || '',
      robotsPolicy: dto.seo?.robotsPolicy || 'index, follow',
    },
  };
}

function SettingsContent() {
  const { hasPermission } = useAdminAuth();
  const canUpdate = hasPermission('settings:update');
  const toast = useAdminToast();

  const [settings, setSettings] = useState<AdminSiteSettingsDto | null>(null);
  const [form, setForm] = useState<SettingsFormState | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [changeSummary, setChangeSummary] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [conflictMessage, setConflictMessage] = useState<string | undefined>();

  const [pickerTarget, setPickerTarget] = useState<
    'logoMediaKey' | 'faviconMediaKey' | 'defaultOgImageMediaKey' | null
  >(null);

  useUnsavedChangesWarning(isDirty);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dto = await adminClient.getSettings();
      setSettings(dto);
      setForm(mapDtoToForm(dto));
      setIsDirty(false);
      setValidationError(null);
      setConflictOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت تنظیمات سایت');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const patchForm = (updater: (prev: SettingsFormState) => SettingsFormState) => {
    setForm((prev) => {
      if (!prev) return prev;
      return updater(prev);
    });
    setIsDirty(true);
    setValidationError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !settings || !canUpdate) return;

    const ctaTrimmedLabel = form.header.ctaButton.label.trim();
    const ctaTrimmedUrl = form.header.ctaButton.url.trim();

    const payload = {
      expectedVersion: settings.version,
      changeSummary: changeSummary.trim() || undefined,
      general: {
        primaryDomain: form.general.primaryDomain.trim(),
        supportContact: form.general.supportContact.trim() || undefined,
        timezone: form.general.timezone.trim() || 'Asia/Tehran',
      },
      branding: {
        siteName: form.branding.siteName.trim(),
        siteDescription: form.branding.siteDescription.trim(),
        logoMediaKey: form.branding.logoMediaKey.trim() || undefined,
        faviconMediaKey: form.branding.faviconMediaKey.trim() || undefined,
        defaultOgImageMediaKey: form.branding.defaultOgImageMediaKey.trim() || undefined,
      },
      header: {
        logoText: form.header.logoText.trim(),
        navigationItems: form.header.navigationItems.map((item, idx) => ({
          id: item.id.trim() || `nav-${idx + 1}`,
          label: item.label.trim(),
          path: item.path.trim(),
          external: Boolean(item.external),
          order: idx + 1,
        })),
        ...(ctaTrimmedLabel || ctaTrimmedUrl
          ? {
              ctaButton: {
                label: ctaTrimmedLabel,
                url: ctaTrimmedUrl,
                enabled: form.header.ctaButton.enabled,
              },
            }
          : {}),
      },
      footer: {
        description: form.footer.description.trim(),
        copyright: form.footer.copyright.trim(),
        linkGroups: form.footer.linkGroups.map((grp) => ({
          title: grp.title.trim(),
          links: grp.links.map((l, idx) => ({
            id: l.id.trim() || `flink-${idx + 1}`,
            label: l.label.trim(),
            path: l.path.trim(),
            external: Boolean(l.external),
            order: idx + 1,
          })),
        })),
        socialLinks: form.footer.socialLinks.map((s) => ({
          platform: s.platform.trim(),
          label: s.label.trim(),
          url: s.url.trim(),
        })),
      },
      seo: {
        defaultMetaTitle: form.seo.defaultMetaTitle.trim(),
        defaultMetaDescription: form.seo.defaultMetaDescription.trim(),
        robotsPolicy: form.seo.robotsPolicy,
      },
    };

    const parsed = AdminUpdateSiteSettingsDtoSchema.safeParse(payload);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const msg = `${firstIssue.path.join('.') || 'فرم'}: ${firstIssue.message}`;
      setValidationError(msg);
      toast.error('اطلاعات تنظیمات معتبر نیست', msg);
      return;
    }

    setSaving(true);
    setValidationError(null);
    try {
      const updated = await adminClient.updateSettings(parsed.data);
      setSettings(updated);
      setForm(mapDtoToForm(updated));
      setChangeSummary('');
      setIsDirty(false);
      toast.success('تنظیمات سایت ذخیره شد', `نسخه جدید: v${updated.version}`);
    } catch (err) {
      if (err instanceof AdminApiError && err.isConflict()) {
        setConflictMessage(err.message);
        setConflictOpen(true);
      } else {
        const msg = err instanceof Error ? err.message : 'خطا در ذخیره تنظیمات سایت';
        setValidationError(msg);
        toast.error('ذخیره ناموفق بود', msg);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-14 bg-slate-200 rounded-lg" />
        <div className="h-96 bg-white border border-slate-200 rounded-lg" />
      </div>
    );
  }

  if (error || !settings || !form) {
    return <AdminErrorState message={error || 'تنظیمات یافت نشد.'} onRetry={loadSettings} />;
  }

  const tabs: Array<{ key: SettingsTab; label: string; icon: React.ReactNode }> = [
    { key: 'general', label: 'عمومی و دامنه', icon: <Settings className="w-4 h-4" /> },
    { key: 'branding', label: 'هویت بصری و رسانه‌ها', icon: <ImageIcon className="w-4 h-4" /> },
    { key: 'header', label: 'ناوبری هدر', icon: <Layout className="w-4 h-4" /> },
    { key: 'footer', label: 'فوتر و شبکه‌های اجتماعی', icon: <Globe className="w-4 h-4" /> },
    { key: 'seo', label: 'تنظیمات پیش‌فرض سئو', icon: <Search className="w-4 h-4" /> },
  ];

  const moveNavItem = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= form.header.navigationItems.length) return;
    patchForm((prev) => {
      const copy = [...prev.header.navigationItems];
      const [moved] = copy.splice(index, 1);
      copy.splice(target, 0, moved);
      return {
        ...prev,
        header: { ...prev.header, navigationItems: copy },
      };
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <AdminPageHeader
        title="تنظیمات عمومی سایت"
        description={`نسخه فعلی: v${settings.version} · آخرین بروزرسانی: ${formatPersianDateTime(settings.updatedAt)}`}
        breadcrumbs={[{ label: 'داشبورد', href: '/admin' }, { label: 'تنظیمات سایت' }]}
        actions={
          <div className="flex items-center gap-2">
            <AdminButton
              variant="outline"
              onClick={loadSettings}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              بازخوانی
            </AdminButton>
            {canUpdate && (
              <AdminButton
                type="submit"
                variant="primary"
                isLoading={saving}
                icon={<Save className="w-4 h-4" />}
              >
                ذخیره تنظیمات
              </AdminButton>
            )}
          </div>
        }
      />

      {!canUpdate && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800">
          شما فقط دسترسی مشاهده تنظیمات را دارید و امکان ویرایش تنظیمات عمومی برای نقش فعلی فعال نیست.
        </div>
      )}

      {validationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-red-700">
          {validationError}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 bg-white border border-slate-200 p-1.5 rounded-lg">
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold transition-colors ${
                active
                  ? 'bg-[#042A1B] text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-5">
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminField label="دامنه اصلی (Primary Domain)" required>
              <AdminInput
                dir="ltr"
                disabled={!canUpdate}
                value={form.general.primaryDomain}
                onChange={(e) =>
                  patchForm((p) => ({
                    ...p,
                    general: { ...p.general, primaryDomain: e.target.value },
                  }))
                }
                placeholder="techa.ir"
              />
            </AdminField>

            <AdminField label="منطقه زمانی (Timezone)" required>
              <AdminInput
                dir="ltr"
                disabled={!canUpdate}
                value={form.general.timezone}
                onChange={(e) =>
                  patchForm((p) => ({
                    ...p,
                    general: { ...p.general, timezone: e.target.value },
                  }))
                }
                placeholder="Asia/Tehran"
              />
            </AdminField>

            <div className="md:col-span-2">
              <AdminField label="اطلاعات تماس پشتیبانی" hint="مثلاً ایمیل یا نشانی کانال پشتیبانی">
                <AdminInput
                  dir="ltr"
                  disabled={!canUpdate}
                  value={form.general.supportContact}
                  onChange={(e) =>
                    patchForm((p) => ({
                      ...p,
                      general: { ...p.general, supportContact: e.target.value },
                    }))
                  }
                  placeholder="support@techa.ir"
                />
              </AdminField>
            </div>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminField label="نام سایت" required>
                <AdminInput
                  disabled={!canUpdate}
                  value={form.branding.siteName}
                  onChange={(e) =>
                    patchForm((p) => ({
                      ...p,
                      branding: { ...p.branding, siteName: e.target.value },
                    }))
                  }
                />
              </AdminField>
              <AdminField label="توضیحات کوتاه سایت" counter={`${form.branding.siteDescription.length}/300`}>
                <AdminInput
                  disabled={!canUpdate}
                  value={form.branding.siteDescription}
                  onChange={(e) =>
                    patchForm((p) => ({
                      ...p,
                      branding: { ...p.branding, siteDescription: e.target.value },
                    }))
                  }
                />
              </AdminField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              {(
                [
                  { key: 'logoMediaKey', label: 'لوگوی سایت (Logo)' },
                  { key: 'faviconMediaKey', label: 'آیکون تب مرورگر (Favicon)' },
                  { key: 'defaultOgImageMediaKey', label: 'تصویر اشتراک‌گذاری پیش‌فرض (OG Image)' },
                ] as const
              ).map((asset) => {
                const value = form.branding[asset.key];
                const preview = resolvePreviewMediaUrl(value || undefined);
                return (
                  <div
                    key={asset.key}
                    className="border border-slate-200 rounded-lg p-3.5 space-y-3 bg-slate-50/50"
                  >
                    <div className="text-xs font-semibold text-slate-800">{asset.label}</div>
                    <div className="h-24 rounded-md bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
                      {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt={asset.label} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-[11px] text-slate-400">تصویری انتخاب نشده</span>
                      )}
                    </div>
                    <AdminInput
                      dir="ltr"
                      disabled={!canUpdate}
                      value={value}
                      onChange={(e) =>
                        patchForm((p) => ({
                          ...p,
                          branding: { ...p.branding, [asset.key]: e.target.value },
                        }))
                      }
                      placeholder="media/site_asset/..."
                      className="text-xs font-mono"
                    />
                    {canUpdate && (
                      <div className="flex items-center gap-2">
                        <AdminButton
                          size="sm"
                          variant="outline"
                          onClick={() => setPickerTarget(asset.key)}
                          className="flex-1"
                        >
                          انتخاب از کتابخانه
                        </AdminButton>
                        {value && (
                          <AdminButton
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              patchForm((p) => ({
                                ...p,
                                branding: { ...p.branding, [asset.key]: '' },
                              }))
                            }
                          >
                            پاک کردن
                          </AdminButton>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'header' && (
          <div className="space-y-6">
            <AdminField label="متن کنار لوگو در هدر">
              <AdminInput
                disabled={!canUpdate}
                value={form.header.logoText}
                onChange={(e) =>
                  patchForm((p) => ({
                    ...p,
                    header: { ...p.header, logoText: e.target.value },
                  }))
                }
              />
            </AdminField>

            {/* Navigation Items */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">آیتم‌های منوی ناوبری بالا</h3>
                {canUpdate && (
                  <AdminButton
                    size="sm"
                    variant="outline"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() =>
                      patchForm((p) => ({
                        ...p,
                        header: {
                          ...p.header,
                          navigationItems: [
                            ...p.header.navigationItems,
                            {
                              id: `nav-${Date.now().toString(36)}`,
                              label: 'لینک جدید',
                              path: '/docs',
                              external: false,
                              order: p.header.navigationItems.length + 1,
                            },
                          ],
                        },
                      }))
                    }
                  >
                    افزودن آیتم منو
                  </AdminButton>
                )}
              </div>

              {form.header.navigationItems.length === 0 ? (
                <p className="text-xs text-slate-500">آیتم منویی ثبت نشده است.</p>
              ) : (
                <div className="space-y-2.5">
                  {form.header.navigationItems.map((item, idx) => (
                    <div
                      key={`${item.id}_${idx}`}
                      className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center bg-slate-50 border border-slate-200 rounded-lg p-3"
                    >
                      <div className="md:col-span-3">
                        <AdminInput
                          disabled={!canUpdate}
                          value={item.label}
                          onChange={(e) =>
                            patchForm((p) => ({
                              ...p,
                              header: {
                                ...p.header,
                                navigationItems: p.header.navigationItems.map((n, i) =>
                                  i === idx ? { ...n, label: e.target.value } : n
                                ),
                              },
                            }))
                          }
                          placeholder="عنوان منو"
                        />
                      </div>
                      <div className="md:col-span-4">
                        <AdminInput
                          dir="ltr"
                          disabled={!canUpdate}
                          value={item.path}
                          onChange={(e) =>
                            patchForm((p) => ({
                              ...p,
                              header: {
                                ...p.header,
                                navigationItems: p.header.navigationItems.map((n, i) =>
                                  i === idx ? { ...n, path: e.target.value } : n
                                ),
                              },
                            }))
                          }
                          placeholder="/docs"
                        />
                      </div>
                      <div className="md:col-span-2 flex items-center gap-2 text-xs">
                        <input
                          id={`ext-${idx}`}
                          type="checkbox"
                          disabled={!canUpdate}
                          checked={item.external}
                          onChange={(e) =>
                            patchForm((p) => ({
                              ...p,
                              header: {
                                ...p.header,
                                navigationItems: p.header.navigationItems.map((n, i) =>
                                  i === idx ? { ...n, external: e.target.checked } : n
                                ),
                              },
                            }))
                          }
                        />
                        <label htmlFor={`ext-${idx}`} className="text-slate-700">
                          لینک خارجی
                        </label>
                      </div>
                      {canUpdate && (
                        <div className="md:col-span-3 flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => moveNavItem(idx, -1)}
                            disabled={idx === 0}
                            className="p-2 rounded border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
                            title="انتقال به بالا"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveNavItem(idx, 1)}
                            disabled={idx === form.header.navigationItems.length - 1}
                            className="p-2 rounded border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
                            title="انتقال به پایین"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              patchForm((p) => ({
                                ...p,
                                header: {
                                  ...p.header,
                                  navigationItems: p.header.navigationItems.filter((_, i) => i !== idx),
                                },
                              }))
                            }
                            className="p-2 rounded border border-slate-200 bg-white text-red-600 hover:bg-red-50"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Header CTA Button */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">دکمه اقدام (CTA) هدر</h3>
                <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    disabled={!canUpdate}
                    checked={form.header.ctaButton.enabled}
                    onChange={(e) =>
                      patchForm((p) => ({
                        ...p,
                        header: {
                          ...p.header,
                          ctaButton: { ...p.header.ctaButton, enabled: e.target.checked },
                        },
                      }))
                    }
                  />
                  <span>فعال‌سازی دکمه CTA</span>
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AdminField label="متن دکمه CTA">
                  <AdminInput
                    disabled={!canUpdate}
                    value={form.header.ctaButton.label}
                    onChange={(e) =>
                      patchForm((p) => ({
                        ...p,
                        header: {
                          ...p.header,
                          ctaButton: { ...p.header.ctaButton, label: e.target.value },
                        },
                      }))
                    }
                    placeholder="شروع یادگیری"
                  />
                </AdminField>
                <AdminField label="آدرس لینک CTA">
                  <AdminInput
                    dir="ltr"
                    disabled={!canUpdate}
                    value={form.header.ctaButton.url}
                    onChange={(e) =>
                      patchForm((p) => ({
                        ...p,
                        header: {
                          ...p.header,
                          ctaButton: { ...p.header.ctaButton, url: e.target.value },
                        },
                      }))
                    }
                    placeholder="/docs"
                  />
                </AdminField>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'footer' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminField label="توضیحات فوتر">
                <AdminTextarea
                  rows={3}
                  disabled={!canUpdate}
                  value={form.footer.description}
                  onChange={(e) =>
                    patchForm((p) => ({
                      ...p,
                      footer: { ...p.footer, description: e.target.value },
                    }))
                  }
                />
              </AdminField>
              <AdminField label="متن کپی‌رایت فوتر">
                <AdminTextarea
                  rows={3}
                  disabled={!canUpdate}
                  value={form.footer.copyright}
                  onChange={(e) =>
                    patchForm((p) => ({
                      ...p,
                      footer: { ...p.footer, copyright: e.target.value },
                    }))
                  }
                />
              </AdminField>
            </div>

            {/* Footer Link Groups */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">گروه‌های لینک فوتر</h3>
                {canUpdate && (
                  <AdminButton
                    size="sm"
                    variant="outline"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() =>
                      patchForm((p) => ({
                        ...p,
                        footer: {
                          ...p.footer,
                          linkGroups: [...p.footer.linkGroups, { title: 'ستون جدید', links: [] }],
                        },
                      }))
                    }
                  >
                    افزودن گروه لینک
                  </AdminButton>
                )}
              </div>

              {form.footer.linkGroups.map((group, gIdx) => (
                <div key={gIdx} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50/50">
                  <div className="flex items-center justify-between gap-2">
                    <AdminInput
                      disabled={!canUpdate}
                      value={group.title}
                      onChange={(e) =>
                        patchForm((p) => ({
                          ...p,
                          footer: {
                            ...p.footer,
                            linkGroups: p.footer.linkGroups.map((g, idx) =>
                              idx === gIdx ? { ...g, title: e.target.value } : g
                            ),
                          },
                        }))
                      }
                      placeholder="عنوان ستون فوتر"
                    />
                    {canUpdate && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <AdminButton
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            patchForm((p) => ({
                              ...p,
                              footer: {
                                ...p.footer,
                                linkGroups: p.footer.linkGroups.map((g, idx) =>
                                  idx === gIdx
                                    ? {
                                        ...g,
                                        links: [
                                          ...g.links,
                                          {
                                            id: `fl-${Date.now().toString(36)}`,
                                            label: 'لینک',
                                            path: '/docs',
                                            external: false,
                                            order: g.links.length + 1,
                                          },
                                        ],
                                      }
                                    : g
                                ),
                              },
                            }))
                          }
                        >
                          لینک جدید
                        </AdminButton>
                        <button
                          type="button"
                          onClick={() =>
                            patchForm((p) => ({
                              ...p,
                              footer: {
                                ...p.footer,
                                linkGroups: p.footer.linkGroups.filter((_, idx) => idx !== gIdx),
                              },
                            }))
                          }
                          className="p-2 rounded border border-slate-200 bg-white text-red-600"
                          title="حذف گروه"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {group.links.map((link, lIdx) => (
                    <div key={`${link.id}_${lIdx}`} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                      <div className="md:col-span-4">
                        <AdminInput
                          disabled={!canUpdate}
                          value={link.label}
                          onChange={(e) =>
                            patchForm((p) => ({
                              ...p,
                              footer: {
                                ...p.footer,
                                linkGroups: p.footer.linkGroups.map((g, gi) =>
                                  gi === gIdx
                                    ? {
                                        ...g,
                                        links: g.links.map((ln, li) =>
                                          li === lIdx ? { ...ln, label: e.target.value } : ln
                                        ),
                                      }
                                    : g
                                ),
                              },
                            }))
                          }
                          placeholder="عنوان لینک"
                        />
                      </div>
                      <div className="md:col-span-5">
                        <AdminInput
                          dir="ltr"
                          disabled={!canUpdate}
                          value={link.path}
                          onChange={(e) =>
                            patchForm((p) => ({
                              ...p,
                              footer: {
                                ...p.footer,
                                linkGroups: p.footer.linkGroups.map((g, gi) =>
                                  gi === gIdx
                                    ? {
                                        ...g,
                                        links: g.links.map((ln, li) =>
                                          li === lIdx ? { ...ln, path: e.target.value } : ln
                                        ),
                                      }
                                    : g
                                ),
                              },
                            }))
                          }
                          placeholder="/docs"
                        />
                      </div>
                      <div className="md:col-span-2 flex items-center gap-1.5 text-xs">
                        <input
                          type="checkbox"
                          disabled={!canUpdate}
                          checked={link.external}
                          onChange={(e) =>
                            patchForm((p) => ({
                              ...p,
                              footer: {
                                ...p.footer,
                                linkGroups: p.footer.linkGroups.map((g, gi) =>
                                  gi === gIdx
                                    ? {
                                        ...g,
                                        links: g.links.map((ln, li) =>
                                          li === lIdx ? { ...ln, external: e.target.checked } : ln
                                        ),
                                      }
                                    : g
                                ),
                              },
                            }))
                          }
                        />
                        <span>خارجی</span>
                      </div>
                      {canUpdate && (
                        <div className="md:col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              patchForm((p) => ({
                                ...p,
                                footer: {
                                  ...p.footer,
                                  linkGroups: p.footer.linkGroups.map((g, gi) =>
                                    gi === gIdx
                                      ? { ...g, links: g.links.filter((_, li) => li !== lIdx) }
                                      : g
                                  ),
                                },
                              }))
                            }
                            className="p-2 rounded border border-slate-200 bg-white text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">لینک‌های شبکه‌های اجتماعی</h3>
                {canUpdate && (
                  <AdminButton
                    size="sm"
                    variant="outline"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() =>
                      patchForm((p) => ({
                        ...p,
                        footer: {
                          ...p.footer,
                          socialLinks: [
                            ...p.footer.socialLinks,
                            { platform: 'github', label: 'گیت‌هاب', url: 'https://github.com/' },
                          ],
                        },
                      }))
                    }
                  >
                    افزودن شبکه اجتماعی
                  </AdminButton>
                )}
              </div>
              {form.footer.socialLinks.map((social, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="md:col-span-3">
                    <AdminInput
                      dir="ltr"
                      disabled={!canUpdate}
                      value={social.platform}
                      onChange={(e) =>
                        patchForm((p) => ({
                          ...p,
                          footer: {
                            ...p.footer,
                            socialLinks: p.footer.socialLinks.map((s, i) =>
                              i === idx ? { ...s, platform: e.target.value } : s
                            ),
                          },
                        }))
                      }
                      placeholder="telegram / github"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <AdminInput
                      disabled={!canUpdate}
                      value={social.label}
                      onChange={(e) =>
                        patchForm((p) => ({
                          ...p,
                          footer: {
                            ...p.footer,
                            socialLinks: p.footer.socialLinks.map((s, i) =>
                              i === idx ? { ...s, label: e.target.value } : s
                            ),
                          },
                        }))
                      }
                      placeholder="عنوان نمایشی"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <AdminInput
                      dir="ltr"
                      disabled={!canUpdate}
                      value={social.url}
                      onChange={(e) =>
                        patchForm((p) => ({
                          ...p,
                          footer: {
                            ...p.footer,
                            socialLinks: p.footer.socialLinks.map((s, i) =>
                              i === idx ? { ...s, url: e.target.value } : s
                            ),
                          },
                        }))
                      }
                      placeholder="https://..."
                    />
                  </div>
                  {canUpdate && (
                    <div className="md:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          patchForm((p) => ({
                            ...p,
                            footer: {
                              ...p.footer,
                              socialLinks: p.footer.socialLinks.filter((_, i) => i !== idx),
                            },
                          }))
                        }
                        className="p-2 rounded border border-slate-200 bg-white text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-4">
            <AdminField label="عنوان سئو پیش‌فرض (Meta Title)" required counter={`${form.seo.defaultMetaTitle.length}/100`}>
              <AdminInput
                disabled={!canUpdate}
                value={form.seo.defaultMetaTitle}
                onChange={(e) =>
                  patchForm((p) => ({
                    ...p,
                    seo: { ...p.seo, defaultMetaTitle: e.target.value },
                  }))
                }
              />
            </AdminField>
            <AdminField
              label="توضیحات سئو پیش‌فرض (Meta Description)"
              required
              counter={`${form.seo.defaultMetaDescription.length}/300`}
            >
              <AdminTextarea
                rows={3}
                disabled={!canUpdate}
                value={form.seo.defaultMetaDescription}
                onChange={(e) =>
                  patchForm((p) => ({
                    ...p,
                    seo: { ...p.seo, defaultMetaDescription: e.target.value },
                  }))
                }
              />
            </AdminField>
            <AdminField label="سیاست ایندکس موتورهای جستجو (Robots Policy)" required>
              <AdminSelect
                dir="ltr"
                disabled={!canUpdate}
                value={form.seo.robotsPolicy}
                onChange={(e) =>
                  patchForm((p) => ({
                    ...p,
                    seo: {
                      ...p.seo,
                      robotsPolicy: e.target.value as SettingsFormState['seo']['robotsPolicy'],
                    },
                  }))
                }
              >
                <option value="index, follow">index, follow (پیش‌فرض عمومی)</option>
                <option value="index, nofollow">index, nofollow</option>
                <option value="noindex, nofollow">noindex, nofollow</option>
              </AdminSelect>
            </AdminField>
          </div>
        )}
      </div>

      {canUpdate && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-end gap-3 justify-between">
          <div className="flex-1">
            <AdminField label="توضیح تغییر (اختیاری — ثبت در تاریخچه نسخه‌ها و Audit Log)">
              <AdminInput
                value={changeSummary}
                onChange={(e) => setChangeSummary(e.target.value)}
                placeholder="مثلاً: بروزرسانی لینک‌های منوی هدر و تصویر OG پیش‌فرض"
              />
            </AdminField>
          </div>
          <AdminButton
            type="submit"
            variant="primary"
            isLoading={saving}
            icon={<Save className="w-4 h-4" />}
          >
            ذخیره نهایی تنظیمات
          </AdminButton>
        </div>
      )}

      <MediaPickerModal
        open={Boolean(pickerTarget)}
        onClose={() => setPickerTarget(null)}
        allowedMediaType="image"
        defaultCategory="site_asset"
        onSelect={(media) => {
          if (!pickerTarget) return;
          patchForm((p) => ({
            ...p,
            branding: { ...p.branding, [pickerTarget]: media.storageKey },
          }));
          setPickerTarget(null);
        }}
      />

      <ConflictResolutionModal
        open={conflictOpen}
        onClose={() => setConflictOpen(false)}
        onReloadServer={loadSettings}
        localVersion={settings.version}
        message={conflictMessage}
      />
    </form>
  );
}

export default function AdminSiteSettingsPage() {
  return (
    <AdminGuard requiredPermission="settings:read">
      <SettingsContent />
    </AdminGuard>
  );
}
