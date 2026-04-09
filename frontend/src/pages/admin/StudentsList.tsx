import React, { useEffect, useState } from 'react'
import { Plus, Search, Edit2, Trash2, Filter, Download, GraduationCap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'

interface Student {
  id: string;
  name: string;
  registration_id: string;
  education_level: string;
  grade_name: string;
  class?: { 
    name: string;
    grade?: {
      name: string;
      level?: { name: string };
    };
    turn?: { name: string };
  };
  status: string; 
  photo_url?: string;
}



export const StudentsList: React.FC = () => {
  const navigate = useNavigate()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModal, setDeleteModal] = useState<{ show: boolean, id: string, name: string }>({ show: false, id: '', name: '' })
  const [deleting, setDeleting] = useState(false)

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

  const handleDelete = async () => {
    if (!deleteModal.id) return
    setDeleting(true)
    const loadId = toast.loading('Excluindo aluno...')
    try {
      await api(`/admin/students/${deleteModal.id}`, { method: 'DELETE' })
      setStudents(prev => prev.filter(s => s.id !== deleteModal.id))
      setDeleteModal({ show: false, id: '', name: '' })
      toast.success('Aluno removido com sucesso!', { id: loadId })
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Erro ao excluir aluno', { id: loadId })
    } finally {
      setDeleting(false)
    }
  }

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.registration_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="flex items-center gap-4">
                        <div className="icon-box" style={{ 
                          width: '44px', 
                          height: '44px', 
                          backgroundColor: 'hsl(var(--primary-light))', 
                          color: 'hsl(var(--primary))', 
                          fontWeight: 700,
                          overflow: 'hidden',
                          borderRadius: '12px'
                        }}>
                          {student.photo_url ? (
                            <img src={student.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            student.name.charAt(0)
                          )}
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'hsl(var(--text))', lineHeight: 1.2 }}>
                          {student.class?.grade?.name || student.grade_name} — {student.class?.name || 'S/T'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'hsl(var(--primary))', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            {student.class?.grade?.level?.name || student.education_level}
                          </span>
                          {student.class?.turn?.name && (
                            <>
                              <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'hsl(var(--border))' }}></span>
                              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'hsl(var(--text-light))' }}>
                                {student.class.turn.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: student.status === 'Ativo' ? 'hsl(var(--success) / 0.1)' : 'hsl(var(--error) / 0.1)', color: student.status === 'Ativo' ? 'hsl(var(--success))' : 'hsl(var(--error))' }}>
                        {student.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/admin/students/edit/${student.id}`)}
                          className="btn-ghost" 
                          style={{ color: 'hsl(var(--primary))', backgroundColor: 'hsl(var(--primary) / 0.05)' }}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => setDeleteModal({ show: true, id: student.id, name: student.name })}
                          className="btn-ghost" 
                          style={{ color: 'hsl(var(--error))', backgroundColor: 'hsl(var(--error) / 0.05)' }}
                        >
                           <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {deleteModal.show && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem', textAlign: 'center', animation: 'scaleIn 0.2s ease-out' }}>
            <div className="icon-box" style={{ 
              width: '80px', height: '80px', backgroundColor: 'hsl(var(--error) / 0.1)', color: 'hsl(var(--error))',
              margin: '0 auto 1.5rem'
            }}>
              <Trash2 size={40} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Confirmar Exclusão</h2>
            <p style={{ color: 'hsl(var(--text-light))', marginBottom: '2rem', lineHeight: 1.5 }}>
              Você está prestes a excluir o registro de <strong>{deleteModal.name}</strong>. Esta ação é definitiva e não pode ser desfeita.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button 
                onClick={() => setDeleteModal({ show: false, id: '', name: '' })}
                className="btn btn-secondary"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button 
                onClick={handleDelete}
                className="btn"
                style={{ backgroundColor: 'hsl(var(--error))', color: 'white' }}
                disabled={deleting}
              >
                {deleting ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
