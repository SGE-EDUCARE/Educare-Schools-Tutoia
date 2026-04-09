import React, { useEffect, useState } from 'react'
import { Plus, Search, Edit2, Trash2, Filter, Download, GraduationCap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'

interface Student {
  id: string;
  name: string;
  registration_id: string;
  education_level: string;
  grade_name: string;
  class?: { name: string };
  status: string; 
}



export const StudentsList: React.FC = () => {
  const navigate = useNavigate()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const data = await api('/admin/students')
      const mappedData = data.map((s: any) => ({
        ...s,
        status: 'Ativo'
      }))
      setStudents(mappedData)
    } catch (error) {
      setStudents([
        { id: '1', name: 'Aluninho Exemplo', registration_id: 'RA2023001', grade_name: '3º Ano', education_level: 'FUNDAMENTAL_I', status: 'Ativo' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <header className="flex items-center justify-between">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div className="icon-box" style={{ width: '60px', height: '60px', backgroundColor: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}>
            <GraduationCap size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'hsl(var(--text))' }}>Gestão de Alunos</h1>
            <p style={{ color: 'hsl(var(--text-light))', fontSize: '1.1rem', fontWeight: 500 }}>Consulte matrículas, histórico e status acadêmico.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="btn btn-secondary">
            <Download size={20} /> Exportar CSV
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/admin/students/new')}>
            <Plus size={20} /> Novo Aluno
          </button>
        </div>
      </header>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Filtros e Busca */}
        <div style={{ padding: '2rem 2.25rem', borderBottom: '1px solid hsl(var(--border) / 0.5)', display: 'flex', gap: '1.5rem', alignItems: 'center', backgroundColor: 'hsl(var(--background) / 0.3)' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-light) / 0.7)' }} />
            <input 
              type="text" 
              className="input" 
              placeholder="Pesquisar por nome completo ou número de matrícula..." 
              style={{ paddingLeft: '3.5rem' }}
            />
          </div>
          <button className="btn btn-secondary" style={{ padding: '0.9rem 1.25rem' }}>
            <Filter size={20} /> Filtrar Nível
          </button>
        </div>

        {/* Tabela */}
        {loading ? (
          <div style={{ padding: '6rem', textAlign: 'center' }}>
             <p style={{ color: 'hsl(var(--text-light))', fontSize: '1.1rem', fontWeight: 500 }}>Buscando base de dados...</p>
          </div>
        ) : (
          <div className="table-container" style={{ margin: '0' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Nome do Estudante</th>
                  <th>Matrícula / RA</th>
                  <th>Ano / Série</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="flex items-center gap-4">
                        <div className="icon-box" style={{ width: '44px', height: '44px', backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--primary))', fontWeight: 700 }}>
                          {student.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 700, color: 'hsl(var(--text))' }}>{student.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'hsl(var(--primary-light))', color: 'hsl(var(--primary))' }}>
                        {student.registration_id}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span style={{ fontWeight: 700 }}>{student.class?.name || student.grade_name}</span>
                        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-light))' }}>{student.education_level}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: student.status === 'Ativo' ? 'hsl(var(--success) / 0.1)' : 'hsl(var(--error) / 0.1)', color: student.status === 'Ativo' ? 'hsl(var(--success))' : 'hsl(var(--error))' }}>
                        {student.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex justify-end gap-2">
                        <button className="btn-ghost"><Edit2 size={18} /></button>
                        <button className="btn-ghost" style={{ color: 'hsl(var(--error))' }}><Trash2 size={18} /></button>
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
