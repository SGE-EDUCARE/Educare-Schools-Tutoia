import { Router } from 'express'
import * as AuthController from '../controllers/AuthController'

const router = Router()

router.post('/login', AuthController.login)
router.post('/reset-first-password', AuthController.resetFirstPassword)

export default router
