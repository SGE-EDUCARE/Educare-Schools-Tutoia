import React, { useEffect, useState } from 'react'
import { ListOrdered, Plus, Trash2 } from 'lucide-react'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'

export const AcademicGrades: React.FC = () => {
  const [grades, setGrades] = useState<any[]>([])
  const [levels, setLevels] = useState<any[]>([])
  const [newName, setNewName] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [gradesData, levelsData] = await Promise.all([
        api('/admin/academic/grades'),
        api('/admin/academic/levels')
      ])
      setGrades(gradesData)
      setLevels(levelsData)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !selectedLevel) return
    try {
      await api('/admin/academic/grades', {
        method: 'POST',
        body: JSON.stringify({ name: newName, level_id: selectedLevel })
      })
      toast.success('Série cadastrada com sucesso!')
      setNewName('')
      fetchData()
    } catch (e) {
      toast.error("Erro ao adicionar série")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta série? Isso pode afetar turmas já criadas.')) return
    const loadId = toast.loading('Excluindo...')
    try {
      await api(`/admin/academic/grades/${id}`, { method: 'DELETE' })
      toast.success('Série excluída!', { id: loadId })
      fetchData()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir série', { id: loadId })
    }
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="icon-box" style={{ width: '70px', height: '70px', backgroundColor: 'hsl(var(--warning) / 0.1)', color: 'hsl(var(--warning))', borderRadius: 'var(--radius-lg)' }}>
            <ListOrdered size={36} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em' }}>Anos / Séries</h1>
            <p style={{ color: 'hsl(var(--text-light))', fontSize: '1.2rem', fontWeight: 500 }}>Vincule os anos escolares aos níveis de ensino.</p>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '3rem', alignItems: 'start' }}>
        <section className="flex flex-col gap-6">
          <div className="card" style={{ padding: '2.5rem' }}>
            <div className="flex items-center gap-3 mb-8">
              <Plus size={20} style={{ color: 'hsl(var(--warning))' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Novo Registro</h3>
            </div>
            
            <form onSubmit={handleAdd} className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <label style={{ fontSize: '0.95rem', fontWeight: 700 }}>Nível de Ensino</label>
                <select value={selectedLevel} onChange={e => setSelectedLevel(e.target.value)} className="input" required>
                  <option value="">Selecione o Nível...</option>
                  {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label style={{ fontSize: '0.95rem', fontWeight: 700 }}>Nome da Série / Ano</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} className="input" placeholder="Ex: 1º Ano" required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.25rem' }}>
                <Plus size={22} /> Adicionar Série
              </button>
            </form>
          </div>
        </section>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid hsl(var(--border) / 0.5)', backgroundColor: 'hsl(var(--background) / 0.2)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Séries Cadastradas</h3>
          </div>
          <div className="table-container" style={{ margin: 0 }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>Série / Ano</th>
                  <th style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>Nível</th>
                  <th style={{ textAlign: 'center', whiteSpace: 'nowrap', width: '100px' }}>Gerenciar</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', padding: '6rem' }}>Carregando...</td></tr>
                ) : grades.length === 0 ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', padding: '6rem' }}>Nenhuma série encontrada.</td></tr>
                ) : grades.map(grade => (
                  <tr key={grade.id}>
                    <td style={{ fontWeight: 800, fontSize: '1.1rem', color: 'hsl(var(--text))' }}>{grade.name}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge" style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--text-light))', padding: '0.5rem 1rem' }}>
                        {grade.level?.name}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => handleDelete(grade.id)} className="btn-ghost" style={{ 
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
