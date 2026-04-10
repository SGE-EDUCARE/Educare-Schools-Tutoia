import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  GraduationCap, 
  Bell,
  Layers,
  ListOrdered,
  Clock,
  School,
  Menu,
  X as CloseIcon,
  Home,
  ClipboardCheck,
  BarChart3,
  User
} from 'lucide-react'
import { PasswordResetModal } from './PasswordResetModal'

const roleLabels: Record<string, string> = {
  DIRECTOR: 'Diretor(a)',
  COORDINATOR: 'Coordenador(a)',
  SECRETARY: 'Secretário(a)',
  TEACHER: 'Professor(a)',
  PARENT: 'Responsável'
}

export const Layout: React.FC = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  React.useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isSidebarOpen])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdmin = user?.role === 'DIRECTOR' || user?.role === 'COORDINATOR' || user?.role === 'SECRETARY'
  const isTeacher = user?.role === 'TEACHER'
  const isParent = user?.role === 'PARENT'
  const showBottomTabs = isTeacher || isParent

  const getPageTitle = () => {
    const path = location.pathname
    const titles: Record<string, string> = {
      '/teacher/dashboard': 'Painel',
      '/teacher/attendance': 'Chamada',
      '/teacher/grades': 'Notas',
      '/teacher/lesson-plan': 'Plano de Aula',
      '/teacher/homework': 'Agenda',
      '/teacher/notices': 'Comunicados',
      '/teacher/routine': 'Rotina Infantil',
      '/admin/dashboard': 'Dashboard',
      '/admin/students': 'Alunos',
      '/admin/teachers': 'Docentes',
      '/admin/levels': 'Níveis',
      '/admin/grades': 'Séries',
      '/admin/turns': 'Turnos',
      '/admin/classes': 'Turmas',
      '/parent/dashboard': 'Início',
    }
    const match = Object.keys(titles).find(key => path.startsWith(key))
    return match ? titles[match] : 'Educare'
  }

  const firstName = user?.name?.split(' ')[0] || 'Usuário'

  return (
    <div className="app-container">
      {/* SIDEBAR OVERLAY (Mobile) */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* SIDEBAR — Desktop Admin Only */}
      {isAdmin && (
        <aside className={`sidebar ${isSidebarOpen ? 'mobile-open' : ''}`}>
          {/* Logo */}
          <div style={{ 
            padding: '2rem 1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            borderBottom: '1px solid hsl(var(--border) / 0.3)',
            position: 'relative'
          }}>
            <button 
              className="mobile-only" 
              onClick={() => setIsSidebarOpen(false)}
              style={{ position: 'absolute', right: '1rem', top: '1rem', color: 'hsl(var(--text-light))', padding: '0.5rem' }}
            >
              <CloseIcon size={18} />
            </button>
            <div className="icon-box" style={{ 
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(260 85% 60%))',
              color: 'white',
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 4px 12px -2px hsl(var(--primary) / 0.35)'
            }}>
              <GraduationCap size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'hsl(var(--text))', lineHeight: 1.1 }}>
                Educare
              </h2>
              <span style={{ fontSize: '0.65rem', color: 'hsl(var(--text-light))', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Gestão Escolar
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
            <NavSection label="Operacional">
              <SidebarLink to="/admin/dashboard" icon={<LayoutDashboard />} label="Dashboard" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/admin/students" icon={<Users />} label="Alunos" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/admin/teachers" icon={<UserSquare2 />} label="Docentes" onClick={() => setIsSidebarOpen(false)} />
            </NavSection>

            <NavSection label="Acadêmico">
              <SidebarLink to="/admin/levels" icon={<Layers />} label="Níveis" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/admin/grades" icon={<ListOrdered />} label="Séries" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/admin/turns" icon={<Clock />} label="Turnos" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/admin/classes" icon={<School />} label="Turmas" onClick={() => setIsSidebarOpen(false)} />
            </NavSection>
          </nav>

          {/* User Card + Logout */}
          <div style={{ padding: '1rem', borderTop: '1px solid hsl(var(--border) / 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', padding: '0 0.5rem' }}>
              <div className="icon-box" style={{ width: '36px', height: '36px', backgroundColor: 'hsl(var(--primary))', color: 'white', fontWeight: 700, fontSize: '0.85rem', borderRadius: 'var(--radius-full)' }}>
                {firstName.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
                <p style={{ fontSize: '0.7rem', color: 'hsl(var(--text-light))', fontWeight: 600 }}>{roleLabels[user?.role || ''] || user?.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              style={{ 
                width: '100%', 
                padding: '0.65rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'hsl(var(--error) / 0.06)',
                color: 'hsl(var(--error))',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'var(--transition-all)'
              }}
            >
              <LogOut size={16} /> Sair da Conta
            </button>
          </div>
        </aside>
      )}

      {/* MAIN CONTENT */}
      <div className="main-content">
        {/* TOPBAR */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Hamburger (Admin mobile only) */}
            {isAdmin && (
              <button 
                className="mobile-only btn-ghost" 
                onClick={() => setIsSidebarOpen(true)}
                style={{ padding: '0.5rem' }}
              >
                <Menu size={22} />
              </button>
            )}

            {/* Role Badge (Desktop) */}
            {isAdmin && (
              <div className="desktop-only" style={{ 
                backgroundColor: 'hsl(var(--primary) / 0.06)', 
                padding: '0.375rem 0.75rem', 
                borderRadius: 'var(--radius-full)',
                color: 'hsl(var(--primary))',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.02em'
              }}>
                {roleLabels[user?.role || ''] || user?.role}
              </div>
            )}

            {/* Page Title */}
            <h1 style={{ 
              fontSize: showBottomTabs ? '1.25rem' : '1rem', 
              fontWeight: 800, 
              color: 'hsl(var(--text))',
              letterSpacing: '-0.02em'
            }}>
              {showBottomTabs ? `Olá, ${firstName}` : getPageTitle()}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="btn-ghost" style={{ position: 'relative' }}>
              <Bell size={20} />
              <span style={{ 
                position: 'absolute', top: '6px', right: '6px', 
                width: '7px', height: '7px', 
                backgroundColor: 'hsl(var(--error))', 
                borderRadius: '50%', 
                border: '2px solid hsl(var(--surface))' 
              }}></span>
            </button>
            <div className="icon-box" style={{ 
              width: '34px', height: '34px', 
              backgroundColor: 'hsl(var(--primary))', 
              color: 'white', 
              fontWeight: 700, 
              fontSize: '0.85rem', 
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer' 
            }}>
              {firstName.charAt(0)}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="page-content">
          <Outlet />
        </main>

        {/* PASSWORD RESET MODAL */}
        <PasswordResetModal />
      </div>

      {/* BOTTOM TAB BAR — Professor & Parent (Mobile Only) */}
      {showBottomTabs && (
        <nav className="bottom-tabs">
          {isTeacher && (
            <>
              <BottomTab to="/teacher/dashboard" icon={<Home size={22} />} label="Início" />
              <BottomTab to="/teacher/attendance" icon={<ClipboardCheck size={22} />} label="Chamada" matchPrefix />
              <BottomTab to="/teacher/grades" icon={<BarChart3 size={22} />} label="Notas" matchPrefix />
              <BottomTabAction icon={<User size={22} />} label="Perfil" onClick={handleLogout} />
            </>
          )}
          {isParent && (
            <>
              <BottomTab to="/parent/dashboard" icon={<Home size={22} />} label="Início" />
              <BottomTab to="/parent/grades" icon={<BarChart3 size={22} />} label="Boletim" matchPrefix />
              <BottomTab to="/parent/messages" icon={<Bell size={22} />} label="Avisos" matchPrefix />
              <BottomTabAction icon={<User size={22} />} label="Sair" onClick={handleLogout} />
            </>
          )}
        </nav>
      )}
    </div>
  )
}

/* =================== SUB-COMPONENTS =================== */

const NavSection = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div style={{ marginBottom: '0.5rem' }}>
    <div style={{ 
      padding: '0.5rem 0.75rem', 
      fontSize: '0.6rem', 
      fontWeight: 800, 
      textTransform: 'uppercase', 
      letterSpacing: '0.1em', 
      color: 'hsl(var(--text-light) / 0.5)',
      marginTop: '0.5rem'
    }}>
      {label}
    </div>
    {children}
  </div>
)

const SidebarLink = ({ to, icon, label, onClick }: { to: string, icon: React.ReactNode, label: string, onClick?: () => void }) => (
  <NavLink 
    to={to} 
    onClick={onClick}
    style={({ isActive }) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '0.625rem',
      padding: '0.6rem 0.75rem',
      color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--text-light))',
      backgroundColor: isActive ? 'hsl(var(--primary) / 0.06)' : 'transparent',
      borderRadius: 'var(--radius-sm)',
      fontWeight: isActive ? 700 : 600,
      fontSize: '0.85rem',
      transition: 'var(--transition-fast)',
      textDecoration: 'none'
    })}
  >
    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
      {React.cloneElement(icon as React.ReactElement<any>, { size: 18 })}
    </span>
    {label}
  </NavLink>
)

const BottomTab = ({ to, icon, label, matchPrefix }: { to: string, icon: React.ReactNode, label: string, matchPrefix?: boolean }) => {
  const location = useLocation()
  const isActive = matchPrefix ? location.pathname.startsWith(to) : location.pathname === to

  return (
    <NavLink 
      to={to} 
      className={`bottom-tab-item ${isActive ? 'active' : ''}`}
      style={{ textDecoration: 'none' }}
    >
      <span className="bottom-tab-icon">{icon}</span>
      <span className="bottom-tab-label">{label}</span>
    </NavLink>
  )
}

const BottomTabAction = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
  <button className="bottom-tab-item" onClick={onClick}>
    <span className="bottom-tab-icon">{icon}</span>
    <span className="bottom-tab-label">{label}</span>
  </button>
)
