import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { StudentsList } from './pages/admin/StudentsList'
import { TeachersList } from './pages/admin/TeachersList'
import { StudentCreate } from './pages/admin/StudentCreate'
import { TeacherCreate } from './pages/admin/TeacherCreate'
import { AcademicLevels } from './pages/admin/AcademicLevels'
import { AcademicGrades } from './pages/admin/AcademicGrades'
import { AcademicTurns } from './pages/admin/AcademicTurns'
import { AcademicClasses } from './pages/admin/AcademicClasses'
import { Toaster } from 'react-hot-toast'
import { TeacherDashboard } from './pages/teacher/TeacherDashboard'
import { ParentDashboard } from './pages/parent/ParentDashboard'
import { useAuthStore } from './store/useAuthStore'

// Helper para redirecionar usuários logados das rotas públicas
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore()
  if (isAuthenticated) {
    if (user?.role === 'PARENT') return <Navigate to="/parent/dashboard" replace />
    if (user?.role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />
    return <Navigate to="/admin/dashboard" replace />
  }
  return <>{children}</>
}

const Unauthorized = () => <div><h1>Acesso Negado</h1><p>Você não tem permissão para acessar esta página.</p></div>

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Rotas Protegidas com Layout Principal */}
        <Route element={<Layout />}>
          
          {/* Rotas de Administração */}
          <Route element={<ProtectedRoute allowedRoles={['DIRECTOR', 'COORDINATOR', 'SECRETARY']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<StudentsList />} />
            <Route path="/admin/students/new" element={<StudentCreate />} />
            <Route path="/admin/teachers" element={<TeachersList />} />
            <Route path="/admin/teachers/new" element={<TeacherCreate />} />
            
            {/* Gestão Acadêmica */}
            <Route path="/admin/levels" element={<AcademicLevels />} />
            <Route path="/admin/grades" element={<AcademicGrades />} />
            <Route path="/admin/turns" element={<AcademicTurns />} />
            <Route path="/admin/classes" element={<AcademicClasses />} />
            
            {/* Outras rotas entrarão aqui */}
          </Route>

          {/* Rotas de Professor */}
          <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            {/* Outras rotas entrarão aqui */}
          </Route>

          {/* Rotas de Pais */}
          <Route element={<ProtectedRoute allowedRoles={['PARENT']} />}>
            <Route path="/parent/dashboard" element={<ParentDashboard />} />
            {/* Outras rotas entrarão aqui */}
          </Route>

        </Route>
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--surface))',
            color: 'hsl(var(--text))',
            borderRadius: 'var(--radius-md)',
            border: '1px solid hsl(var(--border) / 0.5)',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: 'var(--shadow-lg)'
          },
          success: {
            iconTheme: {
              primary: 'hsl(var(--success))',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: 'hsl(var(--error))',
              secondary: '#fff',
            },
          }
        }}
      />
    </BrowserRouter>
  )
}

export default App
