import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { ChevronLeft, Save, Loader2, Home, Calendar } from 'lucide-react'

export const HomeworkPage: React.FC = () => {
  const { classId } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!title || !description) return toast.error('Título e descrição são obrigatórios')
    setSaving(true)
    try {
      await api('/teacher/homework', {
        method: 'POST',
        body: JSON.stringify({ title, description, dueDate, classId })
      })
      toast.success('Atividade agendada!')
      navigate('/teacher/dashboard')
    } catch (error) {
      toast.error('Erro ao salvar atividade')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button 
          onClick={() => navigate(-1)} 
          className="btn-ghost"
          style={{ padding: '0.5rem' }}
        >
          <ChevronLeft size={22} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'hsl(var(--text))' }}>
            Agenda de Casa
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-light))', fontWeight: 500 }}>
            Atribua atividades para seus alunos.
          </p>
        </div>
      </div>

      {/* FORM */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Home size={18} color="hsl(var(--primary))" />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--text))' }}>Detalhes da Atividade</span>
        </div>
        
        <div>
          <label className="label">Título</label>
          <input 
            className="input" 
            placeholder="Ex: Exercícios do Capítulo 4" 
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="label">Instruções</label>
          <textarea 
            className="input" 
            style={{ minHeight: '150px', resize: 'vertical' }}
            placeholder="Descreva a atividade para os alunos..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={14} /> Data de Entrega
          </label>
          <input 
            type="date" 
            className="input" 
            value={dueDate} 
            onChange={e => setDueDate(e.target.value)} 
          />
        </div>
      </div>

      {/* SAVE BUTTON */}
      <button 
        onClick={handleSave} 
        disabled={saving} 
        className="btn btn-primary" 
        style={{ width: '100%', height: '52px', fontSize: '1rem' }}
      >
        {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Agendar Atividade</>}
      </button>
    </div>
  )
}
