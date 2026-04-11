import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { 
  ChevronLeft, 
  Loader2, 
  FileText, 
  Calendar, 
  Plus, 
  Edit3, 
  Target, 
  LayoutList, 
  CheckCircle2,
  Trash2,
  ChevronDown
} from 'lucide-react'

type LessonPlan = {
  id?: string
  date: string
  subject: string
  bimester: string
  month: string
  custom_general_comp: string
  custom_specific_comp: string
  knowledge_objects: string
  programmatic_content: string
  skills: string
  bncc_skills?: any[]
  bncc_general_comp?: any[]
  bncc_specific_comp?: any[]
  methodology: string
  evaluation: string
  resources: string
  references: string
  type: string
}

type BnccRef = {
  id: string
  code?: string
  number?: number
  title?: string
  description: string
}

export const LessonPlanPage: React.FC = () => {
  const { classId } = useParams()
  const navigate = useNavigate()
  
  // States
  const [plans, setPlans] = useState<LessonPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPlan, setCurrentPlan] = useState<LessonPlan | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [subjects, setSubjects] = useState<string[]>([])
  
  // BNCC Search States (Habilidades)
  const [bnccSearch, setBnccSearch] = useState('')
  const [bnccResults, setBnccResults] = useState<BnccRef[]>([])
  const [searchingBNCC, setSearchingBNCC] = useState(false)
  const [selectedBnccIds, setSelectedBnccIds] = useState<string[]>([])
  const [selectedBnccObjects, setSelectedBnccObjects] = useState<BnccRef[]>([])

  // BNCC Search States (Gerais)
  const [genCompSearch, setGenCompSearch] = useState('')
  const [genCompResults, setGenCompResults] = useState<BnccRef[]>([])
  const [searchingGen, setSearchingGen] = useState(false)
  const [selectedGenIds, setSelectedGenIds] = useState<string[]>([])
  const [selectedGenObjects, setSelectedGenObjects] = useState<BnccRef[]>([])

  // BNCC Search States (Específicas)
  const [specCompSearch, setSpecCompSearch] = useState('')
  const [specCompResults, setSpecCompResults] = useState<BnccRef[]>([])
  const [searchingSpec, setSearchingSpec] = useState(false)
  const [selectedSpecIds, setSelectedSpecIds] = useState<string[]>([])
  const [selectedSpecObjects, setSelectedSpecObjects] = useState<BnccRef[]>([])

  // Custom Select States
  const [openSubject, setOpenSubject] = useState(false)
  const [openBimester, setOpenBimester] = useState(false)
  const [openMonth, setOpenMonth] = useState(false)

  const emptyPlan = (): LessonPlan => ({
    date: new Date().toISOString().split('T')[0],
    subject: '',
    bimester: '1',
    month: new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date()),
    custom_general_comp: '',
    custom_specific_comp: '',
    knowledge_objects: '',
    programmatic_content: '',
    skills: '',
    methodology: '',
    evaluation: '',
    resources: '',
    references: '',
    type: 'Mensal'
  })

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api(`/teacher/classes/${classId}/lesson-plans`)
      setPlans(data)
    } catch { toast.error('Erro ao carregar planos') }
    finally { setLoading(false) }
  }, [classId])

  const fetchAllocations = useCallback(async () => {
    try {
      const data = await api(`/teacher/classes/${classId}/allocations`)
      setSubjects(data)
    } catch (e) { console.error(e) }
  }, [classId])

  useEffect(() => {
    fetchPlans()
    fetchAllocations()
  }, [fetchPlans, fetchAllocations])

  // Busca assíncrona da BNCC: Habilidades
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (bnccSearch.length < 2) { setBnccResults([]); return }
      setSearchingBNCC(true)
      try {
        const query = new URLSearchParams({ q: bnccSearch })
        if (currentPlan?.subject) query.append('subject', currentPlan.subject)
        const results = await api(`/teacher/bncc/search?${query.toString()}`)
        setBnccResults(results)
      } catch (e) { console.error(e) }
      finally { setSearchingBNCC(false) }
    }, 400)
    return () => clearTimeout(timer)
  }, [bnccSearch, currentPlan?.subject])

  // Busca assíncrona da BNCC: Gerais (Puxa as 10 iniciais também)
  useEffect(() => {
    const timer = setTimeout(async () => {
      setSearchingGen(true)
      try {
        const query = new URLSearchParams({ q: genCompSearch })
        const results = await api(`/teacher/bncc/general-search?${query.toString()}`)
        setGenCompResults(results)
      } catch (e) { console.error(e) }
      finally { setSearchingGen(false) }
    }, genCompSearch ? 400 : 0)
    return () => clearTimeout(timer)
  }, [genCompSearch])

  // Busca assíncrona da BNCC: Específicas
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (specCompSearch.length < 1) { setSpecCompResults([]); return }
      // Para o caso do 'espaço' no onFocus, permitimos busca mesmo com length 1
      if (specCompSearch.length < 2 && specCompSearch !== ' ') { setSpecCompResults([]); return }
      
      setSearchingSpec(true)
      try {
        const query = new URLSearchParams({ q: specCompSearch })
        const results = await api(`/teacher/bncc/specific-search?${query.toString()}`)
        setSpecCompResults(results)
      } catch (e) { console.error(e) }
      finally { setSearchingSpec(false) }
    }, specCompSearch === ' ' ? 0 : 400)
    return () => clearTimeout(timer)
  }, [specCompSearch])

  const handleCreateNew = () => {
    const fresh = emptyPlan()
    if (subjects.length === 1) fresh.subject = subjects[0]
    setCurrentPlan(fresh)
    setSelectedBnccIds([]); setSelectedBnccObjects([])
    setSelectedGenIds([]); setSelectedGenObjects([])
    setSelectedSpecIds([]); setSelectedSpecObjects([])
    setIsEditing(true)
  }

  const handleEdit = (plan: LessonPlan) => {
    const normalized = { ...plan } as any
    Object.keys(normalized).forEach(key => { if (normalized[key] === null) normalized[key] = '' })
    setCurrentPlan(normalized)
    
    // Sincronizar IDs selecionados
    setSelectedBnccIds(plan.bncc_skills?.map(s => s.id) || [])
    setSelectedBnccObjects(plan.bncc_skills || [])
    setSelectedGenIds(plan.bncc_general_comp?.map(s => s.id) || [])
    setSelectedGenObjects(plan.bncc_general_comp || [])
    setSelectedSpecIds(plan.bncc_specific_comp?.map(s => s.id) || [])
    setSelectedSpecObjects(plan.bncc_specific_comp || [])
    
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!currentPlan?.subject) return toast.error('Informe a disciplina')
    if (!currentPlan?.knowledge_objects && selectedGenIds.length === 0) {
      return toast.error('Preencha ao menos as competências ou objetos de conhecimento')
    }

    setSaving(true)
    try {
      await api('/teacher/lesson-plans', {
        method: 'POST',
        body: JSON.stringify({ 
          ...currentPlan, 
          classId,
          bncc_skills_ids: selectedBnccIds,
          bncc_general_comp_ids: selectedGenIds,
          bncc_specific_comp_ids: selectedSpecIds
        })
      })
      toast.success('Plano de aula salvo!')
      setIsEditing(false)
      setCurrentPlan(null)
      fetchPlans()
    } catch (error) { toast.error('Erro ao salvar plano') }
    finally { setSaving(false) }
  }

  const bimesterOptions = [
    { value: '1', label: '1º Bimestre' }, { value: '2', label: '2º Bimestre' },
    { value: '3', label: '3º Bimestre' }, { value: '4', label: '4º Bimestre' },
  ]
  const monthOptions = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ].map(m => ({ value: m, label: m }))

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Loader2 className="animate-spin" size={48} color="hsl(var(--primary))" />
    </div>
  )


  // Auxiliar para buscadores
  const renderMultiselect = (
    label: string, 
    placeholder: string, 
    search: string, 
    setSearch: (v: string) => void,
    results: any[],
    searching: boolean,
    selected: any[],
    onAdd: (item: any) => void,
    onRemove: (id: string) => void
  ) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--text-light))', textTransform: 'uppercase', marginLeft: '0.2rem' }}>{label}</label>
      <div className="input-container" style={{ position: 'relative' }}>
        <input 
          type="text" 
          className="input" 
          placeholder={placeholder}
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={() => { 
            if ((label.includes('Gerais') || label.includes('Específicas')) && search === '') {
              setSearch(' ') // Espaço para disparar busca de todas ao focar
            }
          }} 
          onBlur={() => setTimeout(() => setSearch(''), 200)} // Limpa para fechar, mas com delay para o clique funcionar
          style={{ width: '100%' }}
        />
        {searching && (
          <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }}>
            <Loader2 size={16} className="animate-spin" color="hsl(var(--primary))" />
          </div>
        )}
        
        {results.length > 0 && search !== '' && (
          <div style={{
            position: 'absolute', top: '105%', left: 0, right: 0, backgroundColor: 'white',
            borderRadius: '12px', boxShadow: '0 12px 30px -4px rgba(0,0,0,0.2)',
            zIndex: 100, border: '1px solid hsl(var(--border) / 0.5)', overflowY: 'auto', maxHeight: '300px'
          }}>
            {results.map(res => (
              <div key={res.id} onMouseDown={() => onAdd(res)} style={{ 
                padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid hsl(var(--border) / 0.2)',
                transition: 'background 0.2s'
              }} className="search-result-item">
                <div style={{ fontWeight: 800, color: 'hsl(var(--primary))', fontSize: '0.8rem' }}>
                  {res.number ? `${res.number}. ` : ''}
                  {res.code ? `[${res.code}] ` : ''}
                  {res.title || ''}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'hsl(var(--text))', marginTop: '0.1rem', lineHeight: 1.3 }}>{res.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
        {selected.map(item => (
          <div key={item.id} style={{ 
            backgroundColor: 'hsl(var(--primary) / 0.05)', color: 'hsl(var(--text))', 
            padding: '0.8rem 1rem', borderRadius: '10px', fontSize: '0.8rem',
            display: 'flex', gap: '0.8rem', border: '1px solid hsl(var(--primary) / 0.1)',
            position: 'relative'
          }}>
            <div style={{ 
              backgroundColor: 'hsl(var(--primary))', color: 'white', 
              padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', 
              fontWeight: 900, height: 'fit-content', whiteSpace: 'nowrap'
            }}>
              {item.number || item.code || 'BNCC'}
            </div>
            <div style={{ fontWeight: 500, lineHeight: 1.4, flex: 1, paddingRight: '1rem' }}>
              {item.title && <span style={{ fontWeight: 800, color: 'hsl(var(--primary))', display: 'block', marginBottom: '0.2rem' }}>{item.title}</span>}
              {item.description}
            </div>
            <button onClick={() => onRemove(item.id)} style={{ position: 'absolute', right: '0.6rem', top: '0.6rem', background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--destructive))', opacity: 0.5 }}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.25rem 10rem' }}>
        
        {/* HEADER */}
        <header style={{ padding: '1rem 0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid hsl(var(--border) / 0.4)', marginBottom: '2rem' }}>
          <div>
            <button onClick={() => isEditing ? setIsEditing(false) : navigate(-1)} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'hsl(var(--text-light))', fontSize: '0.75rem', fontWeight: 700,
              background: 'none', padding: '0.4rem 0', cursor: 'pointer', border: 'none', transition: 'color 0.2s'
            }} className="hover:text-primary">
              <ChevronLeft size={14} /> VOLTAR
            </button>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'hsl(var(--text))', letterSpacing: '-0.04em', lineHeight: 1.1, marginTop: '0.2rem' }}>
              {isEditing ? (currentPlan?.id ? 'Editar Plano' : 'Novo Plano Mensal') : 'Meus Planos de Aula'}
            </h1>
          </div>
          
          {!isEditing && (
            <button onClick={handleCreateNew} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', minHeight: 'auto' }}>
              <Plus size={20} /> CRIAR NOVO PLANO
            </button>
          )}
        </header>

        {isEditing && currentPlan ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* 1. IDENTIFICAÇÃO (Linha única elegante) */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'hsl(var(--primary) / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={18} color="hsl(var(--primary))" />
                </div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'hsl(var(--text))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Identificação do Plano</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }} className="grid-mobile-1">
                <CustomSelect label="Disciplina" value={currentPlan.subject} options={subjects.map(s => ({ value: s, label: s }))} isOpen={openSubject} setIsOpen={setOpenSubject} onChange={(v: string) => setCurrentPlan({ ...currentPlan, subject: v })} />
                <CustomSelect label="Bimestre" value={String(currentPlan.bimester)} options={bimesterOptions} isOpen={openBimester} setIsOpen={setOpenBimester} onChange={(v: string) => setCurrentPlan({ ...currentPlan, bimester: v })} />
                <CustomSelect label="Mês de Referência" value={currentPlan.month} options={monthOptions} isOpen={openMonth} setIsOpen={setOpenMonth} onChange={(v: string) => setCurrentPlan({ ...currentPlan, month: v })} />
              </div>
            </section>

            {/* 2. BASE PEDAGÓGICA (BNCC Desktop) */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'hsl(var(--primary) / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Target size={18} color="hsl(var(--primary))" />
                </div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'hsl(var(--text))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Base Pedagógica (BNCC)</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="grid-mobile-1">
                {/* Coluna 1: Gerais */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {renderMultiselect(
                    "Competências Gerais", "Pesquise ou selecione da lista...",
                    genCompSearch, setGenCompSearch, genCompResults, searchingGen, selectedGenObjects,
                    (it) => { if(!selectedGenIds.includes(it.id)) { setSelectedGenIds([...selectedGenIds, it.id]); setSelectedGenObjects([...selectedGenObjects, it]); setGenCompSearch(''); } },
                    (id) => { setSelectedGenIds(selectedGenIds.filter(i => i !== id)); setSelectedGenObjects(selectedGenObjects.filter(o => o.id !== id)) }
                  )}
                  <FormGroup label="Complemento (Competências Gerais)" placeholder="Observações customizadas..." value={currentPlan.custom_general_comp} onChange={(v: string) => setCurrentPlan({ ...currentPlan, custom_general_comp: v })} height="80px" />
                </div>

                {/* Coluna 2: Específicas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {renderMultiselect(
                    "Competências Específicas", "Busque por tema ou área...",
                    specCompSearch, setSpecCompSearch, specCompResults, searchingSpec, selectedSpecObjects,
                    (it) => { if(!selectedSpecIds.includes(it.id)) { setSelectedSpecIds([...selectedSpecIds, it.id]); setSelectedSpecObjects([...selectedSpecObjects, it]); setSpecCompSearch(''); } },
                    (id) => { setSelectedSpecIds(selectedSpecIds.filter(i => i !== id)); setSelectedSpecObjects(selectedSpecObjects.filter(o => o.id !== id)) }
                  )}
                  <FormGroup label="Complemento (Específicas)" placeholder="Observações específicas..." value={currentPlan.custom_specific_comp} onChange={(v: string) => setCurrentPlan({ ...currentPlan, custom_specific_comp: v })} height="80px" />
                </div>
              </div>
            </section>

            {/* 3. DESENVOLVIMENTO MENSAL */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'hsl(var(--primary) / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LayoutList size={18} color="hsl(var(--primary))" />
                </div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'hsl(var(--text))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Desenvolvimento Mensal</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="grid-mobile-1">
                {/* Coluna 1: O Que Ensinar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <FormGroup label="Objeto(s) de Conhecimento" placeholder="Conteúdos do bimestre..." value={currentPlan.knowledge_objects} onChange={(v: string) => setCurrentPlan({ ...currentPlan, knowledge_objects: v })} height="120px" />
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {renderMultiselect(
                      "Habilidades (BNCC)", "Pesquise por código ou descrição...",
                      bnccSearch, setBnccSearch, bnccResults, searchingBNCC, selectedBnccObjects,
                      (it) => { if(!selectedBnccIds.includes(it.id)) { setSelectedBnccIds([...selectedBnccIds, it.id]); setSelectedBnccObjects([...selectedBnccObjects, it]); setBnccSearch(''); } },
                      (id) => { setSelectedBnccIds(selectedBnccIds.filter(i => i !== id)); setSelectedBnccObjects(selectedBnccObjects.filter(o => o.id !== id)) }
                    )}
                    <FormGroup label="Outras Habilidades (Customizadas)" placeholder="Habilidades específicas..." value={currentPlan.skills} onChange={(v: string) => setCurrentPlan({ ...currentPlan, skills: v })} height="80px" />
                  </div>
                </div>

                {/* Coluna 2: Como e Quando Ensinar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <FormGroup label="Cronograma (Conteúdos por Semana)" placeholder="Semana 1: ... | Semana 2: ..." value={currentPlan.programmatic_content} onChange={(v: string) => setCurrentPlan({ ...currentPlan, programmatic_content: v })} height="180px" />
                  <FormGroup label="Metodologia (Procedimentos)" placeholder="Aulas expositivas, trabalhos..." value={currentPlan.methodology} onChange={(v: string) => setCurrentPlan({ ...currentPlan, methodology: v })} height="180px" />
                </div>
              </div>
            </section>

             {/* 4. AVALIAÇÃO E RECURSOS */}
            <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="grid-mobile-1">
              <FormGroup label="Procedimentos Avaliativos" placeholder="Como o desempenho será avaliado..." 
                value={currentPlan.evaluation} onChange={(v: string) => setCurrentPlan({ ...currentPlan, evaluation: v })} height="120px" />
              <FormGroup label="Recursos e Referências" placeholder="Livros, quadro, internet, projetor..." 
                value={currentPlan.resources} onChange={(v: string) => setCurrentPlan({ ...currentPlan, resources: v })} height="120px" />
            </section>

            {/* BOTÕES DE AÇÃO (Rodapé Limpo) */}
            <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid hsl(var(--border) / 0.4)' }}>
              <button 
                onClick={() => setIsEditing(false)} 
                disabled={saving}
                className="btn btn-secondary"
                style={{ padding: '0.8rem 2.5rem', fontWeight: 700 }}
              >
                CANCELAR
              </button>
              <button 
                onClick={handleSave} 
                disabled={saving} 
                className="btn btn-primary"
                style={{
                  padding: '0.8rem 3rem', fontSize: '1rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? <Loader2 className="animate-spin" size={24} /> : <><CheckCircle2 size={22} /> SALVAR PLANEJAMENTO</>}
              </button>
            </footer>

          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {plans.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '6rem 2rem', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: 'hsl(var(--primary) / 0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <FileText size={40} color="hsl(var(--primary))" opacity={0.3} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'hsl(var(--text))' }}>Nenhum plano encontrado</h2>
                <p style={{ color: 'hsl(var(--text-light))', maxWidth: '300px', margin: '0.5rem auto 1.5rem' }}>Comece a planejar suas aulas seguindo o novo modelo mensal.</p>
                <button onClick={handleCreateNew} style={{ 
                  backgroundColor: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', 
                  padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer'
                }}>
                  Criar Primeiro Plano
                </button>
              </div>
            ) : (
              plans.map(plan => (
                <div key={plan.id} className="card" style={{ 
                  borderRadius: '12px', padding: '1.25rem', border: '1px solid hsl(var(--border) / 0.4)',
                  display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'all 0.2s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ backgroundColor: 'hsl(var(--primary) / 0.05)', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--primary))' }}>
                      {plan.month}
                    </div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--text-light) / 0.6)' }}>
                       {new Date(plan.date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'hsl(var(--text))', lineHeight: 1.2 }}>{plan.subject}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-light))', fontWeight: 500 }}>{plan.bimester}º Bimestre • {plan.type}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button onClick={() => handleEdit(plan)} style={{
                      flex: 1, padding: '0.6rem', backgroundColor: 'hsl(var(--primary) / 0.06)', 
                      color: 'hsl(var(--primary))', borderRadius: '8px', border: 'none', 
                      fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                    }}>
                      <Edit3 size={16} /> EDITAR
                    </button>
                    <button style={{
                      padding: '0.6rem', backgroundColor: 'hsl(var(--error) / 0.06)', 
                      color: 'hsl(var(--error))', borderRadius: '8px', border: 'none', 
                      cursor: 'pointer'
                    }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  )
}

/* =================== SUB-COMPONENTS =================== */

const CustomSelect = ({ label, icon, value, options, isOpen, setIsOpen, onChange }: any) => {
  const selectedLabel = options.find((o: any) => o.value === value)?.label || 'Selecione...'
  
  return (
    <div 
      className={`input ${isOpen ? 'active' : ''}`} 
      style={{ 
        padding: '0.6rem 1rem', display: 'flex', flexDirection: 'column', 
        borderRadius: '10px', position: 'relative', cursor: 'pointer', height: '100%', 
        width: '100%', justifyContent: 'center', minHeight: '60px',
        borderColor: isOpen ? 'hsl(var(--primary))' : undefined,
        boxShadow: isOpen ? '0 0 0 4px hsl(var(--primary) / 0.12)' : undefined,
        backgroundColor: isOpen ? '#fff' : 'hsl(var(--background))'
      }} 
      onClick={() => setIsOpen(!isOpen)}
    >
      <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'hsl(var(--text-light))', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.1rem' }}>
        {icon || <Calendar size={11} />} {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'hsl(var(--text))' }}>{selectedLabel}</span>
        <ChevronDown size={16} color="hsl(var(--text-light))" style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </div>

      {isOpen && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} />
          <div className="grades-select-popover" style={{
            position: 'absolute', top: '110%', left: 0, right: 0, backgroundColor: 'white',
            borderRadius: '12px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
            border: '1px solid hsl(var(--border) / 0.4)', zIndex: 100, overflow: 'hidden', padding: '0.4rem'
          }}>
            {options.map((opt: any) => (
              <div key={opt.value} 
                className="grades-select-option"
                style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', fontWeight: 600, borderRadius: '8px', cursor: 'pointer' }}
                onClick={(e) => { e.stopPropagation(); onChange(opt.value); setIsOpen(false); }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const FormGroup = ({ label, value, onChange, placeholder, height = "100px" }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--text-light))', textTransform: 'uppercase', marginLeft: '0.2rem' }}>{label}</label>
    <textarea 
      className="input" 
      placeholder={placeholder}
      style={{ minHeight: height, width: '100%', padding: '1rem' }}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
)
