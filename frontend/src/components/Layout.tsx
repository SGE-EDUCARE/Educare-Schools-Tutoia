import React from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  GraduationCap, 
  Bell,
  MessageSquare,
  ClipboardCheck,
  ChevronRight,
  Layers,
  ListOrdered,
  Clock,
  School
} from 'lucide-react'

export const Layout: React.FC = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdmin = user?.role === 'DIRECTOR' || user?.role === 'COORDINATOR' || user?.role === 'SECRETARY'
  const isTeacher = user?.role === 'TEACHER'

  const getPageTitle = () => {
    const path = location.pathname.split('/').pop() || 'Dashboard'
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ')
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ 
          padding: '2.5rem 2rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div className="icon-box" style={{ 
            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(255 85% 65%))',
            color: 'white',
            width: '48px',
            height: '48px',
            boxShadow: '0 8px 16px -4px hsl(var(--primary) / 0.4)'
          }}>
            <GraduationCap size={28} />
          </div>
          <div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 800, 
              letterSpacing: '-0.04em',
              color: 'hsl(var(--text))',
              lineHeight: 1
            }}>
              Educare
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-light))', fontWeight: 600, letterSpacing: '0.02em' }}>EDUCAÇÃO PRIVADA</span>
          </div>
        </div>

        <nav style={{ 
          flex: 1, 
          padding: '0 1.25rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.4rem',
          overflowY: 'auto'
        }}>
          <div style={{ padding: '0.5rem 1rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'hsl(var(--text-light) / 0.5)' }}>Operacional</div>
          
          {isAdmin && (
            <>
              <SidebarLink to="/admin/dashboard" icon={<LayoutDashboard />} label="Dashboard" />
              <SidebarLink to="/admin/students" icon={<Users />} label="Gestão de Alunos" />
              <SidebarLink to="/admin/teachers" icon={<UserSquare2 />} label="Corpo Docente" />
            </>
          )}

          {isTeacher && (
            <>
              <SidebarLink to="/teacher/dashboard" icon={<LayoutDashboard />} label="Meu Painel" />
              <SidebarLink to="/teacher/attendance" icon={<ClipboardCheck />} label="Chamada Diária" />
            </>
          )}

          {isAdmin && (
            <>
              <div style={{ marginTop: '1.5rem', padding: '0.5rem 1rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'hsl(var(--text-light) / 0.5)' }}>Estrutura Acadêmica</div>
              <SidebarLink to="/admin/levels" icon={<Layers />} label="Níveis de Ensino" />
              <SidebarLink to="/admin/grades" icon={<ListOrdered />} label="Anos / Séries" />
              <SidebarLink to="/admin/turns" icon={<Clock />} label="Turnos" />
              <SidebarLink to="/admin/classes" icon={<School />} label="Turmas" />
            </>
          )}

          <div style={{ marginTop: '1.5rem', padding: '0.5rem 1rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'hsl(var(--text-light) / 0.5)' }}>Comunicação</div>
          <SidebarLink to="/chat" icon={<MessageSquare />} label="Chat e Mural" />
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid hsl(var(--border) / 0.5)' }}>
          <button 
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '0.75rem', gap: '0.5rem' }}
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              backgroundColor: 'hsl(var(--primary-light))', 
              padding: '0.5rem 1rem', 
              borderRadius: 'var(--radius-full)',
              color: 'hsl(var(--primary))',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {user?.role}
            </div>
            <ChevronRight size={16} opacity={0.4} />
            <span style={{ fontSize: '0.95rem', color: 'hsl(var(--text))', fontWeight: 600 }}>{getPageTitle()}</span>
          </div>
          <div className="flex items-center gap-6">
             <button className="btn-ghost" style={{ position: 'relative' }}>
               <Bell size={22} />
               <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', backgroundColor: 'hsl(var(--error))', borderRadius: '50%', border: '2px solid hsl(var(--surface))' }}></span>
             </button>
            <div className="flex items-center gap-3">
               <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{user?.name}</p>
               </div>
               <div className="icon-box" style={{ width: '40px', height: '40px', backgroundColor: 'hsl(var(--primary))', color: 'white', fontWeight: 700 }}>
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="page-content animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

const SidebarLink = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--text-light))',
        backgroundColor: isActive ? 'hsl(var(--primary) / 0.08)' : 'transparent',
        borderRadius: 'var(--radius-md)',
        fontWeight: isActive ? 700 : 600,
        fontSize: '0.9rem',
        transition: 'var(--transition-all)',
      })}
    >
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
      </span>
      {label}
    </NavLink>
  )
}
