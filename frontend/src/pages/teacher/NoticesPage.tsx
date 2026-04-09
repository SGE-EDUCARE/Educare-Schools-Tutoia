import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { ChevronLeft, Send, Loader2, Target } from 'lucide-react'

export const NoticesPage: React.FC = () => {
  const { classId } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [targetRole, setTargetRole] = useState('PARENT')
  const [scope, setScope] = useState('CLASS') // CLASS or GLOBAL (if permitted)
  const [saving, setSaving] = useState(false)

  const handleSend = async () => {
    if (!title || !content) return toast.error('Título e conteúdo são obrigatórios')
    setSaving(true)
    try {
      await api('/teacher/notices', {
        method: 'POST',
        body: JSON.stringify({ 
          title, 
          content, 
          targetRole, 
          classId: scope === 'CLASS' ? classId : null 
        })
      })
      toast.success('Comunicado enviado com sucesso!')
      navigate('/teacher/dashboard')
    } catch (error) {
      toast.error('Erro ao enviar comunicado')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-ghost" style={{ padding: '0.5rem' }}>
            <ChevronLeft size={24} />
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Comunicado</h1>
        </div>
        <button onClick={handleSend} disabled={saving} className="btn btn-primary" style={{ padding: '1rem 2rem' }}>
          {saving ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> Enviar Comunicado</>}
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <label className="label">Título do Comunicado</label>
            <input 
              className="input" 
              placeholder="Ex: Reunião de Pais - 1º Bimestre" 
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Mensagem Detalhada</label>
            <textarea 
              className="input" 
              style={{ minHeight: '250px' }}
              placeholder="Escreva aqui as informações que deseja transmitir..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="label">Destinatários</label>
              <select className="input" value={targetRole} onChange={e => setTargetRole(e.target.value)}>
                <option value="PARENT">Apenas Pais / Responsáveis</option>
                <option value="STUDENT">Apenas Alunos</option>
                <option value="ALL">Todos</option>
              </select>
            </div>
            <div>
              <label className="label">Abrangência</label>
              <select className="input" value={scope} onChange={e => setScope(e.target.value)}>
                <option value="CLASS">Apenas esta Turma</option>
                <option value="GLOBAL">Geral da Instituição</option>
              </select>
            </div>
          </div>
          <div className="card" style={{ backgroundColor: 'hsl(var(--warning) / 0.1)', border: '1px dashed hsl(var(--warning) / 0.3)' }}>
             <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text))', display: 'flex', gap: '0.5rem' }}>
               <Target size={18} className="shrink-0" />
               Atenção: Comunicados de abrangência global podem ser revisados pela coordenação.
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
