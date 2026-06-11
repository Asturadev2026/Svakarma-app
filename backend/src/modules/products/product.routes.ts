import { Router } from 'express';
import { productService } from './product.service';

const router = Router();

// Public catalog — no auth needed to browse products.
router.get('/', (_req, res) => {
  res.json({ success: true, data: productService.getAll() });
});

router.get('/:key', (req, res, next) => {
  try {
    res.json({ success: true, data: productService.getByKey(req.params.key) });
  } catch (err) {
    next(err);
  }
});

export default router;
