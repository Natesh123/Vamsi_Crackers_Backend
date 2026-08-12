const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const verifyToken = require('../middleware/authMiddleware');
router.get('/', productController.getProducts);
router.post('/global-discount', verifyToken, productController.applyGlobalDiscount);
router.post('/bulk', verifyToken, productController.bulkCreateProducts);
router.post('/', verifyToken, productController.createProduct);
router.put('/:id', verifyToken, productController.updateProduct);
router.patch('/:id/toggle-discount', verifyToken, productController.toggleApplyDiscount);
router.delete('/:id', verifyToken, productController.deleteProduct);
router.post('/bulk-delete', verifyToken, productController.deleteMultipleProducts);

module.exports = router;
