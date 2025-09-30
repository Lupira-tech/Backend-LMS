import express from 'express';
import {
    assignContact,
    createContact,
    deleteContact,
    getContacts,
    getSingleContact,
    updateContact
} from '../controller/contact_Controller.js';

const router = express.Router();


// @desc    Create a new contact

router.post('/', createContact);

// @route   GET /api/contacts
// @desc    Get all contacts

router.get('/', getContacts);

// @route   GET /api/contacts/:id
// @desc    Get single contact

router.get('/:id', getSingleContact);

// @route   PUT /api/contacts/:id
// @desc    Update contact

router.put('/:id', updateContact);

// @route   DELETE /api/contacts/:id
// @desc    Delete contact

router.delete('/:id', deleteContact);

// @route   PATCH /api/contacts/:id/assign
// @desc    Assign employee/manager to contact

router.patch('/:id/assign', assignContact);

export default router;