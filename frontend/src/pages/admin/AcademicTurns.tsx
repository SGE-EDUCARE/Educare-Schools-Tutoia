import React, { useEffect, useState } from 'react'
import { Clock, Plus, Trash2 } from 'lucide-react'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'

export const AcademicTurns: React.FC = () => {
  const [turns, setTurns] = useState<any[]>([])
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTurns()
  }, [])

  const fetchTurns = async () => {
    try {
      const data = await api('/admin/academic/turns')
      setTurns(data)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName) return
    try {
      await api('/admin/academic/turns', {
        method: 'POST',
        body: JSON.stringify({ name: newName })
      })
      toast.success('Turno cadastrado com sucesso!')
      setNewName('')
      fetchTurns()
    } catch (e) {
      toast.error("Erro ao adicionar turno")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este turno?')) return
    const loadId = toast.loading('Excluindo...')
    try {
      await api(`/admin/academic/turns/${id}`, { method: 'DELETE' })
      toast.success('Turno excluído!', { id: loadId })
      fetchTurns()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir turno', { id: loadId })
    }
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="icon-box" style={{ width: '70px', height: '70px', backgroundColor: 'hsl(var(--success) / 0.1)', color: 'hsl(var(--success))', borderRadius: 'var(--radius-lg)' }}>
            <Clock size={36} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em' }}>Turnos</h1>
            <p style={{ color: 'hsl(var(--text-light))', fontSize: '1.2rem', fontWeight: 500 }}>Gerencie os períodos de funcionamento das turmas.</p>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '3rem', alignItems: 'start' }}>
        <section className="flex flex-col gap-6">
          <div className="card" style={{ padding: '2.5rem' }}>
            <div className="flex items-center gap-3 mb-8">
              <Plus size={20} style={{ color: 'hsl(var(--success))' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Novo Turno</h3>
            </div>
            
            <form onSubmit={handleAdd} className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <label style={{ fontSize: '0.95rem', fontWeight: 700 }}>Nome do Turno</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} className="input" placeholder="Ex: Matutino" required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.25rem' }}>
                <Plus size={22} /> Adicionar Turno
              </button>
            </form>
          </div>
        </section>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid hsl(var(--border) / 0.5)', backgroundColor: 'hsl(var(--background) / 0.2)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Turnos Disponíveis</h3>
          </div>
          <div className="table-container" style={{ margin: 0 }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Nome do Turno</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={2} style={{ textAlign: 'center', padding: '6rem' }}>Carregando...</td></tr>
                ) : turns.length === 0 ? (
                  <tr><td colSpan={2} style={{ textAlign: 'center', padding: '6rem' }}>Nenhum turno cadastrado.</td></tr>
                ) : turns.map(turn => (
                  <tr key={turn.id}>
                    <td style={{ fontWeight: 800, fontSize: '1.1rem' }}>{turn.name}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleDelete(turn.id)} className="btn-ghost" style={{ color: 'hsl(var(--error))', backgroundColor: 'hsl(var(--error) / 0.05)' }}>
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
