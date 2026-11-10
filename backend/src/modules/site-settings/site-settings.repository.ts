import { SiteSettingsModel, SiteSettingsRaw } from '../../models/site-settings.model';

export class SiteSettingsRepository {
  public async getGlobalSettings(): Promise<SiteSettingsRaw | null> {
    return SiteSettingsModel.findOne({ settingsKey: 'global' }).lean<SiteSettingsRaw>();
  }
}

export const siteSettingsRepository = new SiteSettingsRepository();
