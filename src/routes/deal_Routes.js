import express from 'express';
import {
    assignDeal,
    bulkDeleteDeals,
    createDeal,
    deleteDeal,
    filterDeals,
    getDeal,
    getDealAnalytics,
    getDeals,
    moveDeal,
    updateDeal,
    updateDealPriority,
    updateDealStage
} from '../controller/deal_Controller.js';

const router = express.Router();

// GET Routes
// @route   GET /api/deals
// @desc    Get all deals (for Kanban/List view)

router.get('/', getDeals);

// @route   GET /api/deals/filter
// @desc    Filter deals by criteria

router.get('/filter', filterDeals);

// @route   GET /api/deals/analytics
// @desc    Get pipeline analytics

router.get('/analytics', getDealAnalytics);

// @route   GET /api/deals/:id
// @desc    Get single deal details

router.get('/:id', getDeal);

// POST Routes
// @route   POST /api/deals
// @desc    Create new deal (Add Deal modal)

router.post('/', createDeal);

// @route   POST /api/deals/:id/move
// @desc    Move deal between stages

router.post('/:id/move', moveDeal);

// PUT Routes
// @route   PUT /api/deals/:id
// @desc    Update entire deal (Edit deal)

router.put('/:id', updateDeal);

// PATCH Routes
// @route   PATCH /api/deals/:id/stage
// @desc    Change deal stage (drag & drop)

router.patch('/:id/stage', updateDealStage);

// @route   PATCH /api/deals/:id/priority
// @desc    Update deal priority

router.patch('/:id/priority', updateDealPriority);

// @route   PATCH /api/deals/:id/assign
// @desc    Assign executive/manager

router.patch('/:id/assign', assignDeal);

// DELETE Routes
// @route   DELETE /api/deals/bulk
// @desc    Delete multiple deals

router.delete('/bulk', bulkDeleteDeals);

// @route   DELETE /api/deals/:id
// @desc    Delete deal

router.delete('/:id', deleteDeal);

export default router;