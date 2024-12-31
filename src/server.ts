import express from "express"
import router from "./router"
import { connectDB } from "./config/db"
import 'dotenv/config'
import { corsConfig } from "./config/cors"
import cors from 'cors'

connectDB()

const app = express()



app.use(cors(corsConfig))

// leer datos de forms

app.use(express.json())

app.use('/', router)

export default app