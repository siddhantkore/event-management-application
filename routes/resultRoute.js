const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const authMiddleware = require('../middlewares/auth');
const eventOwnerMiddleware = require('../middlewares/eventOwner');

// Public routes
router.get('/event/:eventId', resultController.getEventResults);
router.get('/:id', resultController.getResultById);

// Protected routes
router.post('/',
    authMiddleware.authenticate,
    authMiddleware.authorize,
    resultController.createResult
);

router.get('/user/:userId',
    authMiddleware.authenticate,
    authMiddleware.authorize,
    resultController.getUserResults
);

router.put('/:id',
    authMiddleware.authenticate,
    authMiddleware.authorize,
    resultController.updateResult
);

router.delete('/:id',
    authMiddleware.authenticate,
    authMiddleware.authorize,
    resultController.deleteResult
);

// Certificate routes
router.post('/:id/certificate',
    authMiddleware.authenticate,
    authMiddleware.authorize,
    resultController.generateCertificate
);

router.get('/:id/certificate',
    authMiddleware.authenticate,
    authMiddleware.authorize,
    resultController.getCertificate
);

module.exports = router;

