import { Router } from 'express';
import { CatalogController } from '../../controllers/catalog.controller';

const router = Router();

router.get('/products', CatalogController.getProducts);
router.get('/products/:slug', CatalogController.getProductBySlug);
router.get('/categories', CatalogController.getCategories);

export default router;
