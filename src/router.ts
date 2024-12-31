import { Router } from "express";
import { body } from "express-validator";
import { createAccount, getUser, getUserByHandle, login, searchByHandle, updateProfile, uploadImage } from "./handlers";
import { handleInputErrors } from "./middleware/validation";
import { authenticate } from "./middleware/auth";

const router = Router()


router.post('/auth/register',
    body('handle')
        .notEmpty()
        .withMessage('El handle no puede estar vacío'),
    body('name')
        .notEmpty()
        .withMessage('El nombre no puede estar vacío'),
    body('email')
        .isEmail()
        .withMessage('El email no es válido'),
    body('password')
        .isLength({min: 6})
        .withMessage('La contraseña debe contener al menos 6 caracteres'),
    handleInputErrors,
    createAccount)

router.post('/auth/login',
    body('email')
        .isEmail()
        .withMessage('El email no es válido'),
    body('password')
        .notEmpty()
        .withMessage('La contraseña es obligatoria'),
    handleInputErrors,
    login)

    router.get('/user',authenticate, getUser)
    router.patch('/user',
        body('handle')
            .notEmpty()
            .withMessage('El handle no puede estar vacío'),
        body('description')
            .notEmpty()
            .withMessage('La descripcion no puede estar vacía'),
        handleInputErrors,authenticate, updateProfile)

    router.post('/user/image', authenticate, uploadImage)

    router.get('/:handle', getUserByHandle)

    router.post('/search',
        body('handle')
            .notEmpty()
            .withMessage('El handle no puede estar vacío'),
            handleInputErrors,
        searchByHandle
    )

export default router