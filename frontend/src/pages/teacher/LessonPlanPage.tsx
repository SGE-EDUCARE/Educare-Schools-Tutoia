import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { ChevronLeft, Save, Loader2, FileText, Calendar, Tag } from 'lucide-react'

export const LessonPlanPage: React.FC = () => {
  const { classId } = useParams()
  const navigate = useNavigate()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [content, setContent] = useState('')
  const [type, setType] = useState('Diário')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!content) return toast.error('O conteúdo do plano é obrigatório')
    setSaving(true)
    try {
      await api('/teacher/lesson-plans', {
        method: 'POST',
        body: JSON.stringify({ date, content, type, classId })
      })
      toast.success('Plano de aula salvo!')
      navigate('/teacher/dashboard')
    } catch (error) {
      toast.error('Erro ao salvar plano')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button onClick={() => navigate(-1)} className="btn-ghost" style={{ padding: '0.5rem' }}>
          <ChevronLeft size={22} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'hsl(var(--text))' }}>
            Plano de Aula
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-light))', fontWeight: 500 }}>
            Planeje suas atividades e objetivos.
          </p>
        </div>
      </div>

      {/* CONFIG ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: 0 }}>
            <Calendar size={14} /> Data
          </label>
          <input 
            type="date" 
            className="input" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            style={{ border: 'none', padding: '0.5rem 0', fontWeight: 700, fontSize: '0.95rem' }}
          />
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: 0 }}>
            <Tag size={14} /> Tipo
          </label>
          <select 
            className="input" 
            value={type} 
            onChange={e => setType(e.target.value)}
            style={{ border: 'none', padding: '0.5rem 0', fontWeight: 700, fontSize: '0.95rem', appearance: 'none' }}
          >
            <option value="Diário">Diário</option>
            <option value="Semanal">Semanal</option>
            <option value="Projetos">Projetos</option>
          </select>
        </div>
      </div>

      {/* CONTENT CARD */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} color="hsl(var(--primary))" />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--text))' }}>Conteúdo do Plano</span>
        </div>
        <textarea 
          className="input" 
          style={{ minHeight: '220px', resize: 'vertical' }}
          placeholder="Objetivos, atividades, recursos didáticos..."
          value={content}
          onChange={e => setContent(e.target.value)}
        />
      </div>

      {/* SAVE */}
      <button 
        onClick={handleSave} 
        disabled={saving} 
        className="btn btn-primary" 
        style={{ width: '100%', height: '52px', fontSize: '1rem' }}
      >
        {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Salvar Plano</>}
      </button>
    </div>
  )
}
