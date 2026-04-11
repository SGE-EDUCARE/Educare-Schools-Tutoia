import React, { useState, useEffect, useCallback, useRef } from 'react'
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

  // Controle explícito de qual dropdown BNCC está aberto
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

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

  // Refs para controle de versão de requisição (evita race conditions)
  const bnccRequestId = useRef(0)
  const genRequestId = useRef(0)
  const specRequestId = useRef(0)

  // Busca assíncrona da BNCC: Habilidades
  useEffect(() => {
    const isActive = activeDropdown === 'habilidades'
    const queryTerm = bnccSearch.trim()
    
    // Se não estiver ativo ou termo curto demais (e não for busca vazia ao abrir), limpa e sai
    if (!isActive && queryTerm.length < 2) {
      setBnccResults([])
      return
    }

    const requestId = ++bnccRequestId.current
    
    const timer = setTimeout(async () => {
      setSearchingBNCC(true)
      try {
        const queryParams = new URLSearchParams({ q: queryTerm })
        if (currentPlan?.subject) queryParams.append('subject', currentPlan.subject)
        
        const results = await api(`/teacher/bncc/search?${queryParams.toString()}`)
        
        if (requestId === bnccRequestId.current) {
          setBnccResults(results)
        }
      } catch (e) {
        if (requestId === bnccRequestId.current) console.error(e)
      } finally {
        if (requestId === bnccRequestId.current) setSearchingBNCC(false)
      }
    }, isActive && queryTerm === '' ? 0 : 400)

    return () => clearTimeout(timer)
  }, [bnccSearch, currentPlan?.subject, activeDropdown])


  // Busca assíncrona da BNCC: Gerais
  useEffect(() => {
    const isActive = activeDropdown === 'gerais'
    const queryTerm = genCompSearch.trim()

    if (!isActive && queryTerm.length < 2) {
      setGenCompResults([])
      return
    }

    const requestId = ++genRequestId.current

    const timer = setTimeout(async () => {
      setSearchingGen(true)
      try {
        const queryParams = new URLSearchParams({ q: queryTerm })
        const results = await api(`/teacher/bncc/general-search?${queryParams.toString()}`)
        
        if (requestId === genRequestId.current) {
          setGenCompResults(results)
        }
      } catch (e) {
        if (requestId === genRequestId.current) console.error(e)
      } finally {
        if (requestId === genRequestId.current) setSearchingGen(false)
      }
    }, isActive && queryTerm === '' ? 0 : 400)

    return () => clearTimeout(timer)
  }, [genCompSearch, activeDropdown])

  // Busca assíncrona da BNCC: Específicas
  useEffect(() => {
    const isActive = activeDropdown === 'especificas'
    const queryTerm = specCompSearch.trim()

    if (!isActive && queryTerm.length < 2) {
      setSpecCompResults([])
      return
    }

    const requestId = ++specRequestId.current

    const timer = setTimeout(async () => {
      setSearchingSpec(true)
      try {
        const queryParams = new URLSearchParams({ q: queryTerm })
        const results = await api(`/teacher/bncc/specific-search?${queryParams.toString()}`)
        
        if (requestId === specRequestId.current) {
          setSpecCompResults(results)
        }
      } catch (e) {
        if (requestId === specRequestId.current) console.error(e)
      } finally {
        if (requestId === specRequestId.current) setSearchingSpec(false)
      }
    }, isActive && queryTerm === '' ? 0 : 400)

    return () => clearTimeout(timer)
  }, [specCompSearch, activeDropdown])

  // (Removido o truque do espaço em branco que causava glitch no texto)

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

  // Auxiliar para buscadores BNCC
  const renderMultiselect = (
    dropdownKey: string,
    label: string, 
    placeholder: string, 
    search: string, 
    setSearch: (v: string) => void,
    results: any[],
    searching: boolean,
    selected: any[],
    onAdd: (item: any) => void,
    onRemove: (id: string) => void,
    variantColor: string = 'hsl(var(--primary))'
  ) => {
    const isOpen = activeDropdown === dropdownKey
    const showResults = isOpen && results.length > 0

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{
          fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--text))',
          textTransform: 'uppercase', letterSpacing: '0.05em', marginLeft: '0.2rem',
          opacity: 0.8
        }}>{label}</label>

        <div style={{ position: 'relative' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type="text" 
              className="input" 
              placeholder={placeholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setActiveDropdown(dropdownKey)}
              onClick={() => setActiveDropdown(dropdownKey)}
              onBlur={() => {
                setTimeout(() => {
                  setActiveDropdown(current => current === dropdownKey ? null : current)
                }, 300)
              }}
              style={{ 
                width: '100%', 
                backgroundColor: 'white',
                paddingRight: '3rem',
                boxShadow: isOpen ? '0 0 0 4px ' + variantColor + '22' : 'none',
                borderColor: isOpen ? variantColor : undefined
              }}
            />
            <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '0.5rem' }}>
              {searching ? (
                <Loader2 size={16} className="animate-spin" color={variantColor} />
              ) : (
                <Target size={16} color="hsl(var(--text-light) / 0.4)" />
              )}
            </div>
          </div>
          
          {showResults && (
            <div 
              onMouseDown={(e) => e.preventDefault()}
              className="glass"
              style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                borderRadius: '16px',
                boxShadow: '0 12px 40px -8px rgba(0,0,0,0.15)',
                zIndex: 500, border: '1px solid hsl(var(--border) / 0.5)',
                overflowY: 'auto', maxHeight: '280px'
              }}
            >
              {results.map(res => (
                <div
                  key={res.id}
                  onClick={() => { onAdd(res); setSearch(''); setActiveDropdown(null) }}
                  className="dropdown-item"
                  style={{ 
                    padding: '1rem 1.25rem', cursor: 'pointer',
                    borderBottom: '1px solid hsl(var(--border) / 0.2)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'hsl(var(--primary) / 0.03)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ 
                      backgroundColor: variantColor, color: 'white', 
                      padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 900 
                    }}>
                      {res.code || res.number || 'BNCC'}
                    </span>
                    <div style={{ fontWeight: 800, color: 'hsl(var(--text))', fontSize: '0.85rem' }}>
                      {res.title || ''}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.78rem', fontWeight: 500, color: 'hsl(var(--text-light))',
                    lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, 
                    WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>{res.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selected.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            {selected.map(item => (
              <div key={item.id} className="animate-scale-in" style={{ 
                backgroundColor: 'white', color: 'hsl(var(--text))', 
                padding: '1rem 1.25rem', borderRadius: '16px', 
                display: 'flex', gap: '1rem', alignItems: 'flex-start',
                border: '1px solid hsl(var(--border) / 0.6)',
                boxShadow: '0 4px 12px -4px rgba(0,0,0,0.05)',
                position: 'relative'
              }}>
                <div style={{ 
                  width: '4px', alignSelf: 'stretch', borderRadius: '4px',
                  backgroundColor: variantColor, flexShrink: 0
                }} />
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span style={{ 
                      fontSize: '0.7rem', fontWeight: 900, color: variantColor,
                      textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                      {item.code || item.number || 'Referência'}
                    </span>
                    {item.title && <span style={{ width: '3px', height: '3px', backgroundColor: 'hsl(var(--text-light) / 0.3)', borderRadius: '50%' }} />}
                    <span style={{ fontWeight: 800, fontSize: '0.8rem', color: 'hsl(var(--text))' }}>{item.title}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 500, lineHeight: 1.5, color: 'hsl(var(--text))' }}>
                    {item.description}
                  </div>
                </div>

                <button 
                  onClick={() => onRemove(item.id)} 
                  className="btn-ghost"
                  style={{
                    alignSelf: 'flex-start', color: 'hsl(var(--error))',
                    opacity: 0.6, padding: '8px', minWidth: '32px', minHeight: '32px',
                    borderRadius: '10px'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 10rem' }}>

        {/* ══════════ HEADER ══════════ */}
        <header style={{
          padding: '2rem 0', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <button
              onClick={() => isEditing ? setIsEditing(false) : navigate(-1)}
              className="card-interactive"
              style={{
                width: '52px', height: '52px', borderRadius: '16px',
                border: '1px solid hsl(var(--border) / 0.6)',
                background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <ChevronLeft size={26} color="hsl(var(--text))" />
            </button>
            <div>
              <h1 style={{
                fontSize: '2.1rem', fontWeight: 950, color: 'hsl(var(--text))',
                letterSpacing: '-0.04em', lineHeight: 1.1
              }}>
                {isEditing ? (currentPlan?.id ? 'Editar Planejamento' : 'Novo Plano Mensal') : 'Planos de Aula'}
              </h1>
              {isEditing && (
                <p style={{ fontSize: '1rem', color: 'hsl(var(--text-light))', fontWeight: 500, marginTop: '0.35rem' }}>
                  Organize sua prática pedagógica seguindo as diretrizes da BNCC
                </p>
              )}
            </div>
          </div>

          {!isEditing && (
            <button onClick={handleCreateNew} className="btn btn-primary" style={{ padding: '0.9rem 2rem', borderRadius: '16px', fontSize: '1.05rem' }}>
              <Plus size={24} /> <span className="desktop-only" style={{ marginLeft: '0.3rem' }}>Novo Plano</span>
            </button>
          )}
        </header>

        {/* ══════════ FORMULÁRIO DE EDIÇÃO ══════════ */}
        {isEditing && currentPlan ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }} className="animate-slide-up">

            {/* ─── 1. IDENTIFICAÇÃO ─── */}
            <SectionCard 
              icon={<Calendar size={20} color="hsl(var(--primary))" />} 
              title="Informações do Período"
              accent="linear-gradient(135deg, hsl(250 100% 98%) 0%, hsl(250 100% 95%) 100%)"
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }} className="grid-mobile-1">
                <CustomSelect label="Disciplina" icon={<FileText size={16}/>} value={currentPlan.subject} options={subjects.map(s => ({ value: s, label: s }))} isOpen={openSubject} setIsOpen={setOpenSubject} onChange={(v: string) => setCurrentPlan({ ...currentPlan, subject: v })} />
                <CustomSelect label="Bimestre" value={String(currentPlan.bimester)} options={bimesterOptions} isOpen={openBimester} setIsOpen={setOpenBimester} onChange={(v: string) => setCurrentPlan({ ...currentPlan, bimester: v })} />
                <CustomSelect label="Mês de Referência" value={currentPlan.month} options={monthOptions} isOpen={openMonth} setIsOpen={setOpenMonth} onChange={(v: string) => setCurrentPlan({ ...currentPlan, month: v })} />
              </div>
            </SectionCard>

            {/* ─── 2. BASE PEDAGÓGICA (BNCC) ─── */}
            <SectionCard 
              icon={<Target size={20} color="hsl(260 90% 60%)" />} 
              title="Competências BNCC"
              accent="linear-gradient(135deg, hsl(260 100% 98%) 0%, hsl(260 100% 95%) 100%)"
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="grid-mobile-1">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {renderMultiselect(
                    "gerais", "Competências Gerais", "Pesquise por tema...",
                    genCompSearch, setGenCompSearch, genCompResults, searchingGen, selectedGenObjects,
                    (it) => { if(!selectedGenIds.includes(it.id)) { setSelectedGenIds([...selectedGenIds, it.id]); setSelectedGenObjects([...selectedGenObjects, it]); setGenCompSearch(''); } },
                    (id) => { setSelectedGenIds(selectedGenIds.filter(i => i !== id)); setSelectedGenObjects(selectedGenObjects.filter(o => o.id !== id)) },
                    'hsl(260 85% 60%)'
                  )}
                  <FormGroup label="Anotações de Competências Gerais" placeholder="Complemente as competências..." value={currentPlan.custom_general_comp} onChange={(v: string) => setCurrentPlan({ ...currentPlan, custom_general_comp: v })} height="80px" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {renderMultiselect(
                    "especificas", "Competências Específicas", "Busque por área...",
                    specCompSearch, setSpecCompSearch, specCompResults, searchingSpec, selectedSpecObjects,
                    (it) => { if(!selectedSpecIds.includes(it.id)) { setSelectedSpecIds([...selectedSpecIds, it.id]); setSelectedSpecObjects([...selectedSpecObjects, it]); setSpecCompSearch(''); } },
                    (id) => { setSelectedSpecIds(selectedSpecIds.filter(i => i !== id)); setSelectedSpecObjects(selectedSpecObjects.filter(o => o.id !== id)) },
                    'hsl(230 85% 60%)'
                  )}
                  <FormGroup label="Anotações de Competências Específicas" placeholder="Observações específicas..." value={currentPlan.custom_specific_comp} onChange={(v: string) => setCurrentPlan({ ...currentPlan, custom_specific_comp: v })} height="80px" />
                </div>
              </div>
            </SectionCard>

            {/* ─── 3. DESENVOLVIMENTO MENSAL ─── */}
            <SectionCard 
              icon={<LayoutList size={20} color="hsl(210 90% 55%)" />} 
              title="Planejamento e Desenvolvimento"
              accent="linear-gradient(135deg, hsl(210 100% 98%) 0%, hsl(210 100% 96%) 100%)"
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr', gap: '2rem' }} className="grid-mobile-1">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <FormGroup label="Objeto(s) de Conhecimento" placeholder="O que será ensinado?" value={currentPlan.knowledge_objects} onChange={(v: string) => setCurrentPlan({ ...currentPlan, knowledge_objects: v })} height="120px" />
                  {renderMultiselect(
                    "habilidades", "Habilidades (BNCC)", "Código ou descrição...",
                    bnccSearch, setBnccSearch, bnccResults, searchingBNCC, selectedBnccObjects,
                    (it) => { if(!selectedBnccIds.includes(it.id)) { setSelectedBnccIds([...selectedBnccIds, it.id]); setSelectedBnccObjects([...selectedBnccObjects, it]); setBnccSearch(''); } },
                    (id) => { setSelectedBnccIds(selectedBnccIds.filter(i => i !== id)); setSelectedBnccObjects(selectedBnccObjects.filter(o => o.id !== id)) },
                    'hsl(210 85% 55%)'
                  )}
                  <FormGroup label="Habilidades Próprias" placeholder="Habilidades não previstas na BNCC..." value={currentPlan.skills} onChange={(v: string) => setCurrentPlan({ ...currentPlan, skills: v })} height="80px" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <FormGroup label="Cronograma Detalhado" placeholder="Distribuição do conteúdo pelas semanas..." value={currentPlan.programmatic_content} onChange={(v: string) => setCurrentPlan({ ...currentPlan, programmatic_content: v })} height="180px" />
                  <FormGroup label="Metodologias e Estratégias" placeholder="Como o conteúdo será trabalhado?" value={currentPlan.methodology} onChange={(v: string) => setCurrentPlan({ ...currentPlan, methodology: v })} height="180px" />
                </div>
              </div>
            </SectionCard>

            {/* ─── 4. AVALIAÇÃO E RECURSOS ─── */}
            <SectionCard 
              icon={<CheckCircle2 size={20} color="hsl(160 80% 45%)" />} 
              title="Recursos e Avaliação"
              accent="linear-gradient(135deg, hsl(160 100% 98%) 0%, hsl(160 100% 96%) 100%)"
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="grid-mobile-1">
                <FormGroup label="Critérios de Avaliação" placeholder="Como o aprendizado será verificado?"
                  value={currentPlan.evaluation} onChange={(v: string) => setCurrentPlan({ ...currentPlan, evaluation: v })} height="120px" />
                <FormGroup label="Ferramentas e Referências" placeholder="Recursos utilizados no bimestre..."
                  value={currentPlan.resources} onChange={(v: string) => setCurrentPlan({ ...currentPlan, resources: v })} height="120px" />
              </div>
            </SectionCard>

            {/* ─── AÇÕES ─── */}
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: '1rem',
              paddingTop: '1.5rem', borderTop: '1px solid hsl(var(--border) / 0.4)'
            }}>
              <button
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="btn btn-secondary"
                style={{ padding: '0.75rem 2rem', fontWeight: 700, borderRadius: '14px' }}
              >
                Descartar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary"
                style={{
                  padding: '0.75rem 3rem', borderRadius: '14px', fontWeight: 800,
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> Salvar Plano</>}
              </button>
            </div>
          </div>

        ) : (
          /* ══════════ LISTA DE PLANOS ══════════ */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }} className="animate-fade-in">
            {plans.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '6rem 2rem', textAlign: 'center' }} className="card">
                <div style={{
                  width: '88px', height: '88px', borderRadius: '28px',
                  background: 'hsl(var(--primary) / 0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.5rem', transform: 'rotate(-5deg)'
                }}>
                  <FileText size={40} color="hsl(var(--primary))" style={{ opacity: 0.4 }} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'hsl(var(--text))' }}>Nenhum plano ativo</h2>
                <p style={{ color: 'hsl(var(--text-light))', maxWidth: '300px', margin: '0.5rem auto 1.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Seus planos mensais aparecerão aqui. Comece um novo agora!
                </p>
                <button onClick={handleCreateNew} className="btn btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: '14px' }}>
                  <Plus size={20} /> Iniciar Planejamento
                </button>
              </div>
            ) : (
              plans.map(plan => (
                <div key={plan.id} className="card card-interactive" style={{
                  borderRadius: '20px', padding: '1.5rem',
                  border: '1px solid hsl(var(--border) / 0.3)',
                  display: 'flex', flexDirection: 'column', gap: '1.25rem',
                  position: 'relative', overflow: 'hidden'
                }}
                onClick={() => handleEdit(plan)}
                >
                  <div style={{
                    position: 'absolute', top: 0, right: 0, width: '4px', height: '100%',
                    backgroundColor: 'hsl(var(--primary))'
                  }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span style={{
                        background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))',
                        padding: '0.35rem 0.75rem', borderRadius: '8px',
                        fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em'
                      }}>{plan.month}</span>
                      <span style={{
                        background: 'hsl(var(--success) / 0.1)', color: 'hsl(var(--success))',
                        padding: '0.35rem 0.75rem', borderRadius: '8px',
                        fontSize: '0.7rem', fontWeight: 900
                      }}>{plan.bimester}º Bim</span>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'hsl(var(--text))', lineHeight: 1.25, letterSpacing: '-0.02em' }}>{plan.subject}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-light))', fontWeight: 600, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={14} /> Atualizado em {new Date(plan.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEdit(plan) }} 
                      className="btn"
                      style={{
                        flex: 1, background: 'hsl(var(--primary) / 0.05)',
                        color: 'hsl(var(--primary))', borderRadius: '12px',
                        fontWeight: 800, fontSize: '0.8rem', minHeight: '44px'
                      }}
                    >
                      <Edit3 size={16} /> Abrir
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); if(confirm('Excluir este plano?')) api(`/teacher/lesson-plans/${plan.id}`, { method: 'DELETE' }).then(() => fetchPlans()) }} 
                      className="btn"
                      style={{
                        padding: '0 0.85rem', background: 'hsl(var(--error) / 0.05)',
                        color: 'hsl(var(--error))', borderRadius: '12px', minHeight: '44px'
                      }}
                    >
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

/* ══════════════════════════════════════
   SUB-COMPONENTS (DEFINIDOS FORA PARA EVITAR REMOUNTS)
   ══════════════════════════════════════ */

const SectionCard = ({ icon, title, accent, children }: { icon: React.ReactNode; title: string; accent?: string; children: React.ReactNode }) => (
  <section className="card" style={{
    padding: 0, borderRadius: '28px',
    border: '1px solid hsl(var(--border) / 0.5)',
    boxShadow: 'var(--shadow-md)',
    overflow: 'visible',
    backgroundColor: 'white'
  }}>
    <div style={{
      padding: '1.5rem 2rem',
      background: accent || 'white',
      borderBottom: '1px solid hsl(var(--border) / 0.3)',
      display: 'flex', alignItems: 'center', gap: '1.25rem',
      borderRadius: '28px 28px 0 0'
    }}>
      <div style={{
        width: '50px', height: '50px', borderRadius: '16px',
        background: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        flexShrink: 0, boxShadow: 'var(--shadow-sm)', border: '1px solid hsl(var(--border) / 0.4)'
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'hsl(var(--text))', letterSpacing: '0.02em' }}>{title}</h3>
    </div>
    <div style={{ padding: '2rem' }}>
      {children}
    </div>
  </section>
)

const CustomSelect = ({ label, icon, value, options, isOpen, setIsOpen, onChange }: any) => {
  const selectedLabel = options.find((o: any) => o.value === value)?.label || 'Selecione...'

  return (
    <div
      className={`input ${isOpen ? 'active' : ''}`}
      style={{
        padding: '0.8rem 1.5rem', display: 'flex', flexDirection: 'column',
        borderRadius: '20px', position: 'relative', cursor: 'pointer',
        width: '100%', justifyContent: 'center', minHeight: '74px',
        borderColor: isOpen ? 'hsl(var(--primary))' : undefined,
        boxShadow: isOpen ? '0 0 0 5px hsl(var(--primary) / 0.1)' : undefined,
        backgroundColor: isOpen ? '#fff' : 'hsl(var(--background))'
      }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div style={{
        fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-light))',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem'
      }}>
        {icon || <Calendar size={14} />} {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'hsl(var(--text))' }}>{selectedLabel}</span>
        <ChevronDown size={22} color="hsl(var(--text-light))" style={{ transition: 'transform 0.3s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </div>

      {isOpen && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} />
          <div className="glass animate-scale-in" style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
            backgroundColor: 'white', borderRadius: '18px',
            boxShadow: '0 12px 40px -8px rgba(0,0,0,0.2)',
            border: '1px solid hsl(var(--border) / 0.5)',
            zIndex: 100, overflow: 'hidden', padding: '0.5rem',
            maxHeight: '260px', overflowY: 'auto'
          }}>
            {options.map((opt: any) => (
              <div key={opt.value}
                style={{
                  padding: '0.85rem 1rem', fontSize: '0.9rem', fontWeight: 700,
                  borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                  backgroundColor: opt.value === value ? 'hsl(var(--primary) / 0.08)' : 'transparent',
                  color: opt.value === value ? 'hsl(var(--primary))' : 'hsl(var(--text))',
                  marginBottom: '2px'
                }}
                onClick={(e) => { e.stopPropagation(); onChange(opt.value); setIsOpen(false); }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'hsl(var(--primary) / 0.04)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = opt.value === value ? 'hsl(var(--primary) / 0.08)' : 'transparent')}
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

const FormGroup = ({ label, value, onChange, placeholder, height = '120px' }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
    <label style={{
      fontSize: '0.9rem', fontWeight: 850, color: 'hsl(var(--text))',
      textTransform: 'uppercase', letterSpacing: '0.05em', marginLeft: '0.3rem',
      opacity: 0.8
    }}>{label}</label>
    <textarea
      className="input"
      placeholder={placeholder}
      style={{
        minHeight: height, width: '100%', padding: '1.25rem 1.5rem',
        resize: 'vertical', lineHeight: 1.6, backgroundColor: 'white',
        fontSize: '1.1rem', borderRadius: '20px'
      }}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
)
