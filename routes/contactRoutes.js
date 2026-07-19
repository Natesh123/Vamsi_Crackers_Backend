const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

router.get('/', contactController.getContacts);
router.post('/', contactController.createContact);
router.put('/mark-read', contactController.markAllContactsAsRead);
router.put('/:id/mark-read', contactController.markContactAsRead);
router.delete('/:id', contactController.deleteContact);

module.exports = router;
