import { Router } from 'express';
import { WikiService } from './wiki.service';
import { authMiddleware } from '../../middleware/auth';

const router = Router();
const wikiService = new WikiService();

// Создать вики-страницу
router.post('/', authMiddleware, async (req, res) => {
  const { title, content, category } = req.body;
  const page = await wikiService.createPage(title, content, category);
  res.json(page);
});

// Поиск вики-страниц
router.get('/search', authMiddleware, async (req, res) => {
  const { query } = req.query;
  const pages = await wikiService.searchPages(query as string);
  res.json(pages);
});

// Получить вики-страницу по ID
router.get('/:pageID', authMiddleware, async (req, res) => {
  const { pageID } = req.params;
  const page = await wikiService.getPageByID(Number(pageID));
  res.json(page);
});

// Обновить вики-страницу
router.patch('/:pageID', authMiddleware, async (req, res) => {
  const { pageID } = req.params;
  const { newContent } = req.body;
  const page = await wikiService.updatePage(Number(pageID), newContent);
  res.json(page);
});

// Удалить вики-страницу
router.delete('/:pageID', authMiddleware, async (req, res) => {
  const { pageID } = req.params;
  await wikiService.deletePage(Number(pageID));
  res.json({ message: 'Wiki page deleted successfully' });
});

export default router;