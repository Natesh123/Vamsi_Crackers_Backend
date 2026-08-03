const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getProducts);
router.post('/global-discount', productController.applyGlobalDiscount);
router.post('/bulk', productController.bulkCreateProducts);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.patch('/:id/toggle-discount', productController.toggleApplyDiscount);
router.delete('/:id', productController.deleteProduct);
router.post('/bulk-delete', productController.deleteMultipleProducts);

module.exports = router;
