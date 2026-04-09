import React, { useEffect, useState } from 'react'
import { Layers, Plus, Trash2, ArrowRight } from 'lucide-react'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'

export const AcademicLevels: React.FC = () => {
  const [levels, setLevels] = useState<any[]>([])
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLevels()
  }, [])

  const fetchLevels = async () => {
    try {
      const data = await api('/admin/academic/levels')
      setLevels(data)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName) return
    try {
      await api('/admin/academic/levels', {
        method: 'POST',
        body: JSON.stringify({ name: newName })
      })
      toast.success('Nível cadastrado com sucesso!')
      setNewName('')
      fetchLevels()
    } catch (e) {
      toast.error("Erro ao adicionar nível")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este nível? Isso pode afetar as séries vinculadas.')) return
    
    const loadId = toast.loading('Excluindo...')
    try {
      await api(`/admin/academic/levels/${id}`, { method: 'DELETE' })
      toast.success('Nível excluído!', { id: loadId })
      fetchLevels()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir nível', { id: loadId })
    }
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="icon-box" style={{ 
            width: '70px', 
            height: '70px', 
            backgroundColor: 'hsl(var(--primary) / 0.1)', 
            color: 'hsl(var(--primary))',
            borderRadius: 'var(--radius-xl)'
          }}>
            <Layers size={36} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'hsl(var(--text))' }}>Níveis de Ensino</h1>
            <p style={{ color: 'hsl(var(--text-light))', fontSize: '1.2rem', fontWeight: 500 }}>Configure as etapas educacionais da instituição.</p>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(330px, 0.4fr) 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Formulário Refinado */}
        <section className="flex flex-col gap-6">
          <div className="card" style={{ padding: '2.5rem' }}>
            <div className="flex items-center gap-3 mb-8">
              <Plus size={20} style={{ color: 'hsl(var(--primary))' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Novo Registro</h3>
            </div>
            
            <form onSubmit={handleAdd} className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <label style={{ fontSize: '0.95rem', fontWeight: 700, color: 'hsl(var(--text))' }}>Nome do Nível</label>
                <input 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="input" 
                  placeholder="Ex: Educação Infantil" 
                  style={{ width: '100%' }}
                  required
                  autoFocus
                />
                <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-light))' }}>Use nomes claros e oficiais para os níveis.</p>
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.25rem', borderRadius: 'var(--radius-xl)' }}>
                <Plus size={22} /> Adicionar Nível
              </button>
            </form>
          </div>

          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'hsl(var(--primary-light) / 0.2)', border: '1px dashed hsl(var(--primary) / 0.3)' }}>
             <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text))', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <ArrowRight size={16} /> Dica: Após criar o nível, vá em "Anos / Séries" para vinculá-los.
             </p>
          </div>
        </section>

        {/* Listagem Premium */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid hsl(var(--border) / 0.5)', backgroundColor: 'hsl(var(--background) / 0.2)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Níveis Registrados</h3>
          </div>
          <div className="table-container no-scrollbar" style={{ margin: 0 }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>Nível de Ensino</th>
                  <th style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>Vínculos</th>
                  <th style={{ textAlign: 'center', whiteSpace: 'nowrap', width: '100px' }}>Gerenciar</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', padding: '6rem' }}>Carregando dados...</td></tr>
                ) : levels.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '6rem' }}>
                       <p style={{ color: 'hsl(var(--text-light))', fontSize: '1.1rem', fontWeight: 500 }}>Nenhum nível encontrado no sistema.</p>
                    </td>
                  </tr>
                ) : levels.map(level => (
                  <tr key={level.id}>
                    <td style={{ fontWeight: 800, fontSize: '1.1rem', color: 'hsl(var(--primary))', whiteSpace: 'nowrap' }}>
                      {level.name}
                    </td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span className="badge" style={{ backgroundColor: 'hsl(var(--primary-light))', color: 'hsl(var(--primary))', padding: '0.6rem 1.25rem' }}>
                        {level.grades?.length || 0} Séries
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => handleDelete(level.id)} className="btn-ghost" style={{ 
                        color: 'hsl(var(--error))', 
                        backgroundColor: 'hsl(var(--error) / 0.05)',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        borderRadius: '12px'
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
