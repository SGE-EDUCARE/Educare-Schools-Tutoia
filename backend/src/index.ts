import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
import adminRoutes from './routes/adminRoutes'
import authRoutes from './routes/authRoutes'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Educare Backend is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
})
