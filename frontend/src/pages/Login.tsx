import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { GraduationCap, Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react'
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
      toast.error('E-mail ou senha incorretos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'hsl(var(--background))' }}>
      
      {/* Left Panel - Branding */}
      <div style={{
        flex: 1.2,
        background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(230 85% 55%))',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div style={{ position: 'absolute', width: 800, height: 800, background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)', top: '-20%', left: '-10%', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', width: 400, height: 400, background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)', bottom: '10%', right: '-5%', borderRadius: '50%' }}></div>
        
        <div style={{ zIndex: 1, maxWidth: 540 }}>
          <div style={{ display: 'inline-flex', padding: '1.25rem', background: 'rgba(255,255,255,0.15)', borderRadius: '1.25rem', marginBottom: '2.5rem', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
             <GraduationCap size={56} />
          </div>
          <h1 style={{ fontSize: '4.5rem', fontWeight: 800, lineHeight: 1, marginBottom: '2rem', letterSpacing: '-0.05em' }}>
            Transformando o<br/>futuro da educação.
          </h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, lineHeight: 1.6, fontWeight: 500, letterSpacing: '-0.01em' }}>
            Centralize a gestão acadêmica, comunique-se com precisão e acompanhe a evolução de cada aluno em tempo real no portal Educare.
          </p>
        </div>

        <div style={{ marginTop: 'auto', zIndex: 1 }}>
           <p style={{ opacity: 0.6, fontSize: '0.9rem', fontWeight: 600 }}>VERSÃO PROFISSIONAL 2.0</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
        <div className="animate-fade-in" style={{ width: '100%', maxWidth: '440px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'hsl(var(--text))', marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>Acesso ao Portal</h2>
            <p style={{ color: 'hsl(var(--text-light))', fontSize: '1.05rem', fontWeight: 500 }}>Insira suas credenciais corporativas abaixo.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 700, color: 'hsl(var(--text))', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} /> E-mail Institucional
              </label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input" 
                placeholder="nome@educare.com"
                style={{ height: '3.5rem', fontSize: '1rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 700, color: 'hsl(var(--text))', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={16} /> Senha de Segurança
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input" 
                  placeholder="••••••••"
                  style={{ height: '3.5rem', paddingRight: '3.5rem', fontSize: '1rem' }}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'hsl(var(--text-light))', cursor: 'pointer', display: 'flex' }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '-0.5rem' }}>
               <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: 'hsl(var(--text-light))' }}>
                  <input type="checkbox" style={{ width: '1.1rem', height: '1.1rem' }} /> Lembrar acesso
               </label>
               <button type="button" className="btn-ghost" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>Esqueci a senha</button>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary" 
              style={{ height: '3.75rem', fontSize: '1.1rem', fontWeight: 700, marginTop: '1rem', gap: '1rem' }}
            >
              {loading ? (
                <div className="spinner" style={{ width: 24, height: 24 }}></div>
              ) : (
                <><LogIn size={20} /> Entrar no Sistema</>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '4rem', fontSize: '0.85rem', color: 'hsl(var(--text-light) / 0.6)', fontWeight: 600 }}>
            © 2026 INTELIGÊNCIA EDUCACIONAL EDUCARE. <br/>DADOS PROTEGIDOS POR CRIPTOGRAFIA SSL.
          </p>

        </div>
      </div>

    </div>
  )
}

