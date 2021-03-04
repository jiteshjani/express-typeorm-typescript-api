import { Router } from 'express';
import {
  createStore,
  deleteStore,
  getStoreById,
  getStores,
  updateStore,
} from '../../controller/storeController';
import { guard } from '../../controller/authController';

const router = Router();

// TODO: Move validation logic for user and product in to separate middleware to avoid repetition
router.route('/').get(getStores).post(guard, createStore);
router
  .route('/:id')
  .get(getStoreById)
  .patch(guard, updateStore)
  .delete(guard, deleteStore);

export default router;
