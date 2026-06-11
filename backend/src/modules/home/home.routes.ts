import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { homeService } from './home.service';

const router = Router();

router.get('/summary', authMiddleware, async (req: any, res: any, next: any) => {
  try {
    const data = await homeService.getSummary(req.userId);
    res.json({ success: true, ...data });
  } catch (e) {
    next(e);
  }
});

export default router;
