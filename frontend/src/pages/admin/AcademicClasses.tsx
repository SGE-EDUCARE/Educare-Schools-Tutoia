import React, { useEffect, useState } from 'react'
import { School, Plus, Trash2 } from 'lucide-react'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'

export const AcademicClasses: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([])
  const [grades, setGrades] = useState<any[]>([])
  const [turns, setTurns] = useState<any[]>([])
  
  const [newName, setNewName] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedTurn, setSelectedTurn] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [classesData, gradesData, turnsData] = await Promise.all([
        api('/admin/academic/classes'),
        api('/admin/academic/grades'),
        api('/admin/academic/turns')
      ])
      setClasses(classesData)
      setGrades(gradesData)
      setTurns(turnsData)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !selectedGrade || !selectedTurn) return
    try {
      await api('/admin/academic/classes', {
        method: 'POST',
        body: JSON.stringify({ 
          name: newName, 
          grade_id: selectedGrade, 
          turn_id: selectedTurn 
        })
      })
      toast.success('Turma criada com sucesso!')
      setNewName('')
      fetchData()
    } catch (e) {
      toast.error("Erro ao adicionar turma")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta turma?')) return
    const loadId = toast.loading('Excluindo...')
    try {
      await api(`/admin/academic/classes/${id}`, { method: 'DELETE' })
      toast.success('Turma excluída!', { id: loadId })
      fetchData()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir turma', { id: loadId })
    }
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="icon-box" style={{ width: '70px', height: '70px', backgroundColor: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', borderRadius: 'var(--radius-lg)' }}>
            <School size={36} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em' }}>Gestão de Turmas</h1>
            <p style={{ color: 'hsl(var(--text-light))', fontSize: '1.2rem', fontWeight: 500 }}>Vincule séries, turnos e nomes às turmas.</p>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '3rem', alignItems: 'start' }}>
        <section className="flex flex-col gap-6">
          <div className="card" style={{ padding: '2.5rem' }}>
            <div className="flex items-center gap-3 mb-8">
              <Plus size={20} style={{ color: 'hsl(var(--primary))' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Novo Registro</h3>
            </div>
            
            <form onSubmit={handleAdd} className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <label style={{ fontSize: '0.95rem', fontWeight: 700 }}>Série / Ano</label>
                <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)} className="input" required>
                  <option value="">Selecione a Série...</option>
                  {grades.map(g => <option key={g.id} value={g.id}>{g.name} ({g.level?.name})</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label style={{ fontSize: '0.95rem', fontWeight: 700 }}>Turno</label>
                <select value={selectedTurn} onChange={e => setSelectedTurn(e.target.value)} className="input" required>
                  <option value="">Selecione o Turno...</option>
                  {turns.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label style={{ fontSize: '0.95rem', fontWeight: 700 }}>Nome da Turma</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} className="input" placeholder="Ex: Turma A" required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.25rem' }}>
                <Plus size={22} /> Criar Turma
              </button>
            </form>
          </div>
        </section>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid hsl(var(--border) / 0.5)', backgroundColor: 'hsl(var(--background) / 0.2)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Turmas Ativas</h3>
          </div>
          <div className="table-container" style={{ margin: 0 }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>Turma</th>
                  <th style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>Série / Nível</th>
                  <th style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>Turno</th>
                  <th style={{ textAlign: 'center', whiteSpace: 'nowrap', width: '100px' }}>Gerenciar</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '6rem' }}>Carregando...</td></tr>
                ) : classes.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '6rem' }}>Nenhuma turma encontrada.</td></tr>
                ) : classes.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 800, fontSize: '1.1rem', color: 'hsl(var(--text))' }}>{c.name}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="flex flex-col items-center">
                        <span style={{ fontWeight: 800, color: 'hsl(var(--primary))' }}>{c.grade?.name}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-light))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {c.grade?.level?.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge" style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--text-light))', border: '1px solid hsl(var(--border) / 0.5)' }}>
                        {c.turn?.name}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => handleDelete(c.id)} className="btn-ghost" style={{ 
                        color: 'hsl(var(--error))', 
                        backgroundColor: 'hsl(var(--error) / 0.05)',
                        marginLeft: 'auto',
                        marginRight: 'auto'
                      }}>
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
