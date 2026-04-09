import React, { useEffect, useState } from 'react'
import { Plus, Search, Edit2, Mail, MoreVertical, ShieldCheck, UserSquare2 } from 'lucide-react'
import { api } from '../../utils/api'
import { useNavigate } from 'react-router-dom'

interface Teacher {
  id: string;
  name: string;
  email: string;
  lesson_plans?: any[]; 
  active: boolean;
}

export const TeachersList: React.FC = () => {
  const navigate = useNavigate()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await api('/admin/teachers')
        setTeachers(data)
      } catch (error) {
        setTeachers([
          { id: 't1', name: 'João Silva', email: 'joao.silva@educare.com', active: true, lesson_plans: [1, 2, 3, 4] },
          { id: 't2', name: 'Marta Dias', email: 'marta.dias@educare.com', active: true, lesson_plans: [1, 2] },
          { id: 't3', name: 'Ricardo Santos', email: 'ricardo.s@educare.com', active: false, lesson_plans: [] },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchTeachers()
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <header className="flex items-center justify-between">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div className="icon-box" style={{ width: '60px', height: '60px', backgroundColor: 'hsl(var(--success) / 0.1)', color: 'hsl(var(--success))' }}>
            <UserSquare2 size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'hsl(var(--text))' }}>Corpo Docente</h1>
            <p style={{ color: 'hsl(var(--text-light))', fontSize: '1.1rem', fontWeight: 500 }}>Gestão de equipe, atribuições e planos pedagógicos.</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/teachers/new')}>
          <Plus size={20} /> Admitir Professor
        </button>
      </header>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '2rem 2.25rem', borderBottom: '1px solid hsl(var(--border) / 0.5)', display: 'flex', gap: '1.5rem', alignItems: 'center', backgroundColor: 'hsl(var(--background) / 0.3)' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-light) / 0.7)' }} />
            <input 
              type="text" 
              className="input" 
              placeholder="Pesquisar por nome profissional ou e-mail corporativo..." 
              style={{ paddingLeft: '3.5rem' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '6rem', textAlign: 'center' }}>
             <p style={{ color: 'hsl(var(--text-light))', fontSize: '1.1rem', fontWeight: 500 }}>Carregando equipe docente...</p>
          </div>
        ) : (
          <div className="table-container" style={{ margin: '0' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Professor</th>
                  <th>Carga de Trabalho</th>
                  <th>Acesso ao Portal</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Ações de Gestão</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td>
                      <div className="flex items-center gap-4">
                        <div className="icon-box" style={{ 
                          width: '52px', 
                          height: '52px', 
                          borderRadius: '16px',
                          backgroundColor: 'hsl(var(--secondary))', 
                          color: 'hsl(var(--primary))',
                          fontWeight: 700,
                          fontSize: '1.25rem'
                        }}>
                          {teacher.name.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: 'hsl(var(--text))', fontSize: '1.1rem', lineHeight: 1.2 }}>{teacher.name}</p>
                          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-light))', fontWeight: 500 }}>{teacher.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '180px', padding: '0.5rem 0' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'hsl(var(--text))' }}>
                              {(teacher as any).allocations?.length || 0} Atribuições
                            </span>
                            <span style={{ 
                              fontSize: '0.8rem', 
                              fontWeight: 600, 
                              color: 'hsl(var(--primary))',
                              marginTop: '2px',
                              display: 'block',
                              maxWidth: '220px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }} title={(teacher as any).allocations?.map((a: any) => a.subject).filter(Boolean).join(', ')}>
                              {(teacher as any).allocations?.map((a: any) => a.subject).filter(Boolean).join(', ') || 'Professor Polivalente'}
                            </span>
                          </div>
                          
                          <div style={{ width: '100%', height: '6px', backgroundColor: 'hsl(var(--secondary))', borderRadius: '3px', overflow: 'hidden', marginTop: '4px' }}>
                             <div style={{ 
                               width: `${Math.min(((teacher as any).allocations?.length || 0) * 20, 100)}%`, 
                               height: '100%', 
                               backgroundColor: teacher.active ? 'hsl(var(--primary))' : 'hsl(var(--text-light))',
                               borderRadius: '3px'
                             }}></div>
                          </div>
                       </div>
                    </td>
                    <td>
                       <div className="flex items-center gap-2" style={{ color: 'hsl(var(--text))', fontSize: '0.9rem', fontWeight: 600 }}>
                          <ShieldCheck size={18} color="hsl(var(--success))" strokeWidth={2.5} />
                          <span>Habilitado</span>
                       </div>
                    </td>
                    <td>
                      <span className="badge" style={{ 
                        backgroundColor: teacher.active ? 'hsl(var(--success) / 0.1)' : 'hsl(var(--error) / 0.1)',
                        color: teacher.active ? 'hsl(var(--success))' : 'hsl(var(--error))',
                        padding: '0.5rem 1.25rem'
                      }}>
                        {teacher.active ? 'ATIVO' : 'AFASTADO'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex justify-end gap-3">
                        <button className="btn btn-secondary" style={{ padding: '0.6rem', borderRadius: '10px' }}><Mail size={18} /></button>
                        <button className="btn btn-secondary" style={{ padding: '0.6rem', borderRadius: '10px' }}><Edit2 size={18} /></button>
                        <button className="btn btn-secondary" style={{ padding: '0.6rem', borderRadius: '10px' }}><MoreVertical size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
