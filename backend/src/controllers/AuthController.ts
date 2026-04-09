import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios' })
    }

    // 1. Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    if (!user.active) {
      return res.status(401).json({ error: 'Sua conta está inativa. Contate a diretoria.' })
    }

    // 2. Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    // 3. Gerar JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'educare_secret_key_123',
      { expiresIn: '7d' }
    )

    // 4. Retornar resposta
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustResetPassword: (user as any).must_reset_password
      },
      token
    })
  } catch (error) {
    console.error('Erro no login:', error)
    res.status(500).json({ error: 'Erro interno ao processar login' })
  }
}

export const resetFirstPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })

    const password_hash = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash,
        must_reset_password: false
      }
    })

    res.json({ message: 'Senha redefinida com sucesso' })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao redefinir senha' })
  }
}
