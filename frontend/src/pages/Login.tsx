import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, type Role } from '../store/useAuthStore'
import { GraduationCap } from 'lucide-react'

export const Login: React.FC = () => {
  const login = useAuthStore(state => state.login)
  const navigate = useNavigate()

  const handleFakeLogin = (role: Role) => {
    login(
      { id: '123', name: `Usuário ${role}`, email: `${role.toLowerCase()}@educare.com`, role },
      'fake-jwt-token'
    )
    
    if (role === 'PARENT') navigate('/parent/dashboard')
    else if (role === 'TEACHER') navigate('/teacher/dashboard')
    else navigate('/admin/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'hsl(var(--background))' }}>
      
      {/* Left Panel - Branding */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(230 85% 55%))',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circle */}
        <div style={{ position: 'absolute', width: 600, height: 600, background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)', top: '-10%', left: '-10%', borderRadius: '50%' }}></div>
        
        <div style={{ zIndex: 1, maxWidth: 500 }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', marginBottom: '2rem', backdropFilter: 'blur(10px)' }}>
             <GraduationCap size={48} />
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 700, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            Transformando o<br/>futuro da educação.
          </h1>
          <p style={{ fontSize: '1.125rem', opacity: 0.9, lineHeight: 1.6 }}>
            Bem-vindo ao novo portal da escola Educare. Acesse como gestor, educador ou responsável para acompanhar o desenvolvimento dos alunos de perto e em tempo real.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="animate-fade-in" style={{ width: '100%', maxWidth: '420px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'hsl(var(--text))', marginBottom: '0.5rem' }}>Olá novamente 👋</h2>
            <p style={{ color: 'hsl(var(--text-light))' }}>Selecione o seu perfil de acesso temporário abaixo para navegar no Mock de desenvolvimento.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={() => handleFakeLogin('DIRECTOR')} style={{ justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
              <span>Entrar como <strong>Diretoria</strong></span>
              <span style={{opacity: 0.5}}>→</span>
            </button>
            <button className="btn btn-primary" onClick={() => handleFakeLogin('COORDINATOR')} style={{ justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
              <span>Entrar como <strong>Coordenador</strong></span>
              <span style={{opacity: 0.5}}>→</span>
            </button>
            <button className="btn btn-primary" onClick={() => handleFakeLogin('SECRETARY')} style={{ justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
              <span>Entrar como <strong>Secretaria</strong></span>
              <span style={{opacity: 0.5}}>→</span>
            </button>

            <div style={{ height: 1, backgroundColor: 'hsl(var(--border))', margin: '1rem 0' }} />

            <button className="btn btn-secondary" onClick={() => handleFakeLogin('TEACHER')} style={{ justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
              <span>Entrar como <strong>Professor</strong></span>
              <span style={{opacity: 0.5}}>→</span>
            </button>
            <button className="btn btn-secondary" onClick={() => handleFakeLogin('PARENT')} style={{ justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
              <span>Entrar como <strong>Responsável</strong></span>
              <span style={{opacity: 0.5}}>→</span>
            </button>
          </div>

          <p style={{ textAlign: 'center', marginTop: '3rem', fontSize: '0.85rem', color: 'hsl(var(--text-light))' }}>
            © 2026 Inteligência Educacional Educare. <br/>Todos os direitos reservados.
          </p>

        </div>
      </div>

    </div>
  )
}
