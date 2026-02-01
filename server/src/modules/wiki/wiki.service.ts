import { WikiRepository } from "./wiki.repository";
import { WikiPage } from "./wiki.entity";

export class WikiService {
  async createPage(title: string, content: string, category?: string) {
    const page = new WikiPage();
    page.title = title;
    page.content = content;
    page.category = category;

    await WikiRepository.save(page);
    return page;
  }

  async getPageByID(id: number) {
    return await WikiRepository.findOneBy({ id });
  }

  async updatePage(id: number, newContent: string) {
    const page = await WikiRepository.findOneBy({ id });
    if (!page) throw new Error("Wiki page not found");

    page.content = newContent;
    page.updatedAt = new Date();
    await WikiRepository.save(page);
    return page;
  }

  async deletePage(pageID: number) {
    await WikiRepository.delete(pageID);
  }

  async searchPages(query: string) {
    return await WikiRepository.createQueryBuilder("page")
      .where("page.title LIKE :query OR page.content LIKE :query", {
        query: `%${query}%`,
      })
      .getMany();
  }
}
