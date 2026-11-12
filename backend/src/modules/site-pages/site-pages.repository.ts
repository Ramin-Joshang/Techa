import { SitePageModel, SitePageRaw } from '../../models/site-page.model';

export class SitePagesRepository {
  public async findByPageKey(pageKey: string): Promise<SitePageRaw | null> {
    return SitePageModel.findOne({ pageKey }).lean<SitePageRaw>();
  }

  public async findPublishedByPageKey(pageKey: string): Promise<SitePageRaw | null> {
    return SitePageModel.findOne({
      pageKey,
      $or: [{ status: 'published' }, { status: { $exists: false } }],
    }).lean<SitePageRaw>();
  }
}

export const sitePagesRepository = new SitePagesRepository();
