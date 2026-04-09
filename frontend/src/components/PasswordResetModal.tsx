import React, { useState } from 'react'
import { Lock, ShieldCheck, AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react'
import { api } from '../utils/api'
import { useAuthStore } from '../store/useAuthStore'
import { toast } from 'react-hot-toast'

export const PasswordResetModal: React.FC = () => {
  const { user, completePasswordReset } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Só renderiza se o usuário precisar trocar a senha
  if (!user?.mustResetPassword) return null

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    setLoading(true)
    try {
      await api('/auth/reset-first-password', {
        method: 'POST',
        body: JSON.stringify({
          email: user.email,
          newPassword
        })
      })

      toast.success('Senha redefinida com sucesso! Bem-vindo(a) ao portal.')
      completePasswordReset()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao redefinir senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      backgroundColor: 'hsl(var(--text) / 0.8)', 
      backdropFilter: 'blur(8px)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      zIndex: 9999,
      padding: '1.5rem'
    }}>
      <div className="card" style={{ 
        maxWidth: '500px', 
        width: '100%', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        animation: 'modalSlideUp 0.4s ease-out'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
          <div style={{ 
            width: '72px', 
            height: '72px', 
            backgroundColor: 'hsl(var(--warning) / 0.1)', 
            color: 'hsl(var(--warning))',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto'
          }}>
            <Lock size={32} />
          </div>

          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'hsl(var(--text))' }}>Segurança do Portal</h2>
            <p style={{ color: 'hsl(var(--text-light))', marginTop: '0.5rem' }}>
              Olá, <strong>{user.name}</strong>! Como este é seu primeiro acesso, para garantir sua privacidade, você precisa definir uma senha pessoal e exclusiva.
            </p>
          </div>

          <div style={{ 
            backgroundColor: 'hsl(var(--primary-light) / 0.3)', 
            padding: '1rem', 
            borderRadius: '12px',
            border: '1px solid hsl(var(--primary) / 0.2)',
            display: 'flex',
            gap: '0.75rem',
            textAlign: 'left'
          }}>
            <ShieldCheck className="shrink-0" size={20} color="hsl(var(--primary))" />
            <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text))', fontWeight: 500 }}>
              Sua nova senha deve ter no mínimo 6 caracteres e será usada para todos os seus próximos acessos.
            </span>
          </div>

          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ textAlign: 'left' }}>
              <label className="label">Nova Senha Pessoal</label>
              <div style={{ position: 'relative' }}>
                <input 
                  required
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  style={{ paddingRight: '3rem' }}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                    position: 'absolute', 
                    right: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: 'hsl(var(--text-light))',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'left' }}>
              <label className="label">Confirme a Nova Senha</label>
              <input 
                required
                type="password"
                className="input"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
              />
            </div>

            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p style={{ color: 'hsl(var(--error))', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                 <AlertTriangle size={14} /> As senhas digitadas não coincidem.
              </p>
            )}

            <button 
              type="submit" 
              disabled={loading || !newPassword || newPassword !== confirmPassword}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1rem', marginTop: '0.5rem' }}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Definir Senha e Entrar'}
            </button>
          </form>
        </div>
      </div>
      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
