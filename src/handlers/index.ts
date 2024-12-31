import type { Request, Response } from "express"
import slug from 'slug'
import formidable from 'formidable'
import {v4 as uuid} from 'uuid'
import User from "../models/User"
import { checkPassword, hashPassword } from "../utils/auth"
import { generateJWT } from "../utils/jwt"
import cloudinary from "../config/cloudinary"

export const createAccount = async (req: Request, res: Response) => {


    const { email, password } = req.body

    const userExists = await User.findOne({ email })

    if (userExists) {
        const error = new Error('El email ya está en uso')
        res.status(409).json({ error: error.message })
        return
    }

    const handle = slug(req.body.handle, '')
    const handleExists = await User.findOne({ handle })

    if (handleExists) {
        const error = new Error('Nombre de usuario no disponible')
        res.status(409).json({ error: error.message })
        return
    }

    const user = new User(req.body)
    user.password = await hashPassword(password)
    user.handle = handle

    await user.save()

    res.status(201).send('Registro creado correctamente')
}

export const login = async (req: Request, res: Response) => {

    
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user) {
        const error = new Error('El usuario no existe')
        res.status(404).json({ error: error.message })
        return
    }

    const isPasswordCorrect = await checkPassword(password, user.password)

    if (!isPasswordCorrect) {
        const error = new Error('Contraseña incorrecta')
        res.status(401).json({ error: error.message })
        return
    }

    const token = generateJWT({id:user._id})
    res.send(token)
}

export const getUser = async (req: Request, res: Response) => {
    res.json(req.user)
}

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { description, links } = req.body

        const handle = slug(req.body.handle, '')
        const handleExists = await User.findOne({ handle })

        if (handleExists && handleExists.email !== req.user.email) {
            const error = new Error('Nombre de usuario no disponible')
            res.status(409).json({ error: error.message })
            return
        }

        req.user.description = description
        req.user.handle = handle
        req.user.links = links
        await req.user.save()
        res.send('Perfil actualizado correctamente')

    } catch (error) {
        res.status(500).json({ error: error.message })
        return
        
    }
}

export const uploadImage = async (req: Request, res: Response) => {

    const form = formidable({multiples:false})

    try {
        form.parse(req, (error, fields, files) => {
            cloudinary.uploader.upload(files.file[0].filepath, {public_id: uuid()}, async (error, result) => {
                if (error) {
                    res.status(500).json({ error: error.message })
                    return
                }
                if(result){
                    req.user.image = result.secure_url
                    await req.user.save()
                    res.json({image: result.secure_url})
                }
            })
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
        return
        
    }
}


export const getUserByHandle = async (req: Request, res: Response) => {

    try {

        const { handle } = req.params
        const user = await User.findOne({ handle}).select('-password -_id -__v -email')

        if (!user) {
            const error = new Error('Usuario no encontrado')
            res.status(404).json({ error: error.message })
            return
        }

        res.json(user)

    } catch (error) {
        res.status(500).json({ error: error.message })
        return

    }
}

export const searchByHandle = async (req: Request, res: Response) => {

    try {

        const {handle} = req.body
        const userExists = await User.findOne({handle})
        if(userExists){
            const error = new Error(`${handle} ya está registrado`)
            res.status(409).json({error: error.message})
            return
        }
        res.send(`${handle} está disponible`)

    } catch (error) {
        res.status(500).json({ error: error.message })
        return

    }
}