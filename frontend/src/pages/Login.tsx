import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { GraduationCap, Mail, Lock, LogIn, Eye, EyeOff, Loader2 } from 'lucide-react'
import { api } from '../utils/api'
import { toast } from 'react-hot-toast'

export const Login: React.FC = () => {
  const login = useAuthStore(state => state.login)
  const navigate = useNavigate()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })

      login(data.user, data.token)
      toast.success(`Bem-vindo, ${data.user.name.split(' ')[0]}!`)
      
      const role = data.user.role
      if (role === 'PARENT') navigate('/parent/dashboard')
      else if (role === 'TEACHER') navigate('/teacher/dashboard')
      else navigate('/admin/dashboard')
    } catch (error: any) {
      toast.error('E-mail ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100dvh',
      display: 'flex', 
      backgroundColor: 'hsl(var(--background))' 
    }}>
      
      {/* LEFT PANEL — Branding (Desktop Only) */}
      <div style={{
        flex: 1.2,
        background: 'linear-gradient(145deg, hsl(var(--primary)), hsl(260 85% 50%), hsl(230 85% 45%))',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        position: 'relative',
        overflow: 'hidden'
      }} className="desktop-only">
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', width: 600, height: 600, background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', top: '-15%', left: '-10%', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', width: 400, height: 400, background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', bottom: '10%', right: '-5%', borderRadius: '50%' }}></div>
        
        <div style={{ zIndex: 1, maxWidth: 480 }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '1rem', 
            background: 'rgba(255,255,255,0.12)', 
            borderRadius: 'var(--radius-lg)', 
            marginBottom: '2rem', 
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.15)' 
          }}>
             <GraduationCap size={44} />
          </div>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: 900, 
            lineHeight: 1.05, 
            marginBottom: '1.5rem', 
            letterSpacing: '-0.04em' 
          }}>
            Transformando<br/>a educação.
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.85, lineHeight: 1.7, fontWeight: 500 }}>
            Centralize a gestão escolar, comunique-se com precisão e acompanhe a evolução de cada aluno em tempo real.
          </p>
        </div>

        <div style={{ marginTop: 'auto', zIndex: 1 }}>
           <p style={{ opacity: 0.5, fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.04em' }}>EDUCARE · VERSÃO 3.0</p>
        </div>
      </div>

      {/* RIGHT PANEL — Login Form */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '2rem 1.5rem',
        minHeight: '100dvh'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          
          {/* Mobile Logo */}
          <div className="mobile-only" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            marginBottom: '2.5rem',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '64px', 
              height: '64px', 
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(260 85% 60%))',
              borderRadius: 'var(--radius-lg)',
              color: 'white',
              marginBottom: '1rem',
              boxShadow: '0 8px 24px -4px hsl(var(--primary) / 0.35)'
            }}>
              <GraduationCap size={32} />
            </div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 900, 
              color: 'hsl(var(--text))', 
              letterSpacing: '-0.03em' 
            }}>
              Educare
            </h2>
            <p style={{ 
              fontSize: '0.8rem', 
              color: 'hsl(var(--text-light))', 
              fontWeight: 600 
            }}>
              Gestão Escolar Inteligente
            </p>
          </div>

          {/* Desktop Title */}
          <div className="desktop-only" style={{ flexDirection: 'column', marginBottom: '2.5rem' }}>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: 800, 
              color: 'hsl(var(--text))', 
              marginBottom: '0.5rem', 
              letterSpacing: '-0.03em' 
            }}>
              Acessar Portal
            </h2>
            <p style={{ color: 'hsl(var(--text-light))', fontSize: '0.95rem', fontWeight: 500 }}>
              Entre com suas credenciais.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ animation: 'slideUp 0.4s ease-out 0.1s both' }}>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={14} /> E-mail
              </label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input" 
                placeholder="nome@educare.com"
                autoComplete="email"
                style={{ height: '52px' }}
              />
            </div>

            <div style={{ animation: 'slideUp 0.4s ease-out 0.2s both' }}>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Lock size={14} /> Senha
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input" 
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ height: '52px', paddingRight: '3.5rem' }}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                    position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', 
                    color: 'hsl(var(--text-light))', display: 'flex', padding: '0.25rem' 
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              animation: 'slideUp 0.4s ease-out 0.3s both'
            }}>
               <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--text-light))' }}>
                 <input type="checkbox" style={{ width: '1rem', height: '1rem', accentColor: 'hsl(var(--primary))' }} /> Lembrar
               </label>
               <button type="button" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>Esqueci a senha</button>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary" 
              style={{ 
                height: '54px', 
                fontSize: '1rem', 
                fontWeight: 700,
                marginTop: '0.5rem',
                animation: 'slideUp 0.4s ease-out 0.4s both'
              }}
            >
              {loading ? <Loader2 className="animate-spin" size={22} /> : (
                <><LogIn size={20} /> Entrar</>
              )}
            </button>
          </form>

          <p style={{ 
            textAlign: 'center', 
            marginTop: '3rem', 
            fontSize: '0.75rem', 
            color: 'hsl(var(--text-light) / 0.5)', 
            fontWeight: 600,
            lineHeight: 1.5
          }}>
            © 2026 Educare · Dados protegidos
          </p>

        </div>
      </div>
    </div>
  )
}
