import { SitePageModel, SitePageRaw } from '../../models/site-page.model';

export class SitePagesRepository {
  public async findByPageKey(pageKey: string): Promise<SitePageRaw | null> {
    return SitePageModel.findOne({ pageKey: pageKey as any }).lean<SitePageRaw>();
  }
}

export const sitePagesRepository = new SitePagesRepository();
