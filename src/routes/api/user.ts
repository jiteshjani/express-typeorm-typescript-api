import {
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from '../../controller/userController';
import { Router } from 'express';
import { guard } from '../../controller/authController';

const router = Router();

router.route('/').get(getUsers).patch(guard, updateUser);
router.route('/:id').get(getUserById).delete(guard, deleteUser);

export default router;
