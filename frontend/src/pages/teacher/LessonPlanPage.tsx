import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { 
  ChevronLeft, 
  Loader2, 
  FileText, 
  Calendar, 
  Plus, 
  Target, 
  LayoutList, 
  CheckCircle2,
  Trash2,
  Book
} from 'lucide-react'

// ══════════ TIPAGENS ══════════
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
  content?: string
  references?: string
  status?: string
  type: string
}

type BnccRef = {
  id: string
  code?: string
  number?: number
  title?: string
  description: string
}

interface ClassMetadata {
  id: string
  name: string
  grade: {
    id: string
    name: string
    level: {
      id: string
      name: string
    }
  }
}

// ══════════ CONSTANTES BNCC INFANTIL ══════════
const INFANTIL_CAMPOS = [
  "O eu, o outro e o nós",
  "Corpo, gestos e movimentos",
  "Traços, sons, cores e formas",
  "Escuta, fala, pensamento e imaginação",
  "Espaços, tempos, quantidades, relações e transformações"
]

const INFANTIL_DIREITOS = [
  "Conviver", "Brincar", "Participar", "Explorar", "Expressar", "Conhecer-se"
]

// ══════════ ELEMENTOS UI AUXILIARES ══════════
const SectionCard = ({ icon, title, accent, children, isMobile }: any) => (
  <section className="card" style={{ padding: 0, borderRadius: isMobile ? '20px' : '28px', border: '1px solid #eee', background: 'white', overflow: 'hidden' }}>
    <div style={{ padding: '1.25rem 2rem', background: accent || '#fff', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>{icon}</div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{title}</h3>
    </div>
    <div style={{ padding: '2rem' }}>{children}</div>
  </section>
)

const CustomSelect = ({ label, value, options, isOpen, setIsOpen, onChange }: any) => (
  <div className="input" style={{ padding: '0.8rem 1.5rem', borderRadius: '18px', position: 'relative', cursor: 'pointer', background: '#fcfcfc' }} onClick={() => setIsOpen(!isOpen)}>
    <label style={{ fontSize: '0.75rem', fontWeight: 900, color: '#999', textTransform: 'uppercase' }}>{label}</label>
    <div style={{ fontWeight: 700, marginTop: '0.2rem' }}>{options.find((o: any) => o.value === value)?.label || 'Selecione...'}</div>
    {isOpen && (
      <div className="glass" style={{ position: 'absolute', top: '105%', left: 0, right: 0, backgroundColor: 'white', zIndex: 100, borderRadius: '15px', padding: '0.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
        {options.map((o: any) => <div key={o.value} style={{ padding: '0.75rem 1rem', borderRadius: '10px', backgroundColor: o.value === value ? '#f0f4ff' : 'transparent' }} onClick={() => onChange(o.value)}>{o.label}</div>)}
      </div>
    )}
  </div>
)

const MultiCheckGroup = ({ label, options, selected, onChange }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
    <label style={{ fontSize: '0.85rem', fontWeight: 900, color: 'hsl(var(--text))', textTransform: 'uppercase', opacity: 0.8 }}>{label}</label>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {options.map((opt: string) => {
        const isSelected = selected.includes(opt)
        return (
          <button
            key={opt}
            onClick={() => isSelected ? onChange(selected.filter((s: string) => s !== opt)) : onChange([...selected, opt])}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              transition: 'all 0.2s',
              border: '1px solid',
              borderColor: isSelected ? 'hsl(var(--primary))' : '#eee',
              backgroundColor: isSelected ? 'hsl(var(--primary))' : 'white',
              color: isSelected ? 'white' : '#666',
              boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
              textAlign: 'left'
            }}
          >
            {opt}
          </button>
        )
      })}
    </div>
  </div>
)

const FormGroup = ({ label, value, onChange, placeholder, onFocus, height, type = 'textarea' }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <label style={{ fontSize: '0.85rem', fontWeight: 850, color: 'hsl(var(--text))', textTransform: 'uppercase', opacity: 0.8 }}>{label}</label>
    {type === 'textarea' ? (
      <textarea 
        className="input" 
        placeholder={placeholder}
        value={value} 
        onChange={e => onChange(e.target.value)} 
        onFocus={onFocus}
        style={{ minHeight: height || '120px', borderRadius: '18px', padding: '1.25rem', backgroundColor: '#fcfcfc', border: '1px solid #eee' }} 
      />
    ) : (
      <input 
        type="text"
        className="input" 
        placeholder={placeholder}
        value={value} 
        onChange={e => onChange(e.target.value)} 
        onFocus={onFocus}
        style={{ height: '56px', borderRadius: '18px', padding: '0 1.5rem', backgroundColor: '#fcfcfc', border: '1px solid #eee' }} 
      />
    )}
  </div>
)

const MultiSelectField = ({ 
  label, placeholder, search, setSearch, results, searching, selected, onAdd, onRemove, 
  variantColor, isOpen, onToggle, onClose 
}: any) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Usamos um pequeno delay para garantir que o clique no input de outro dropdown 
      // feche o atual antes que o novo tente abrir, evitando conflitos de estado.
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <FormGroup 
        label={label.toUpperCase()} 
        placeholder={placeholder} 
        value={search} 
        type="text"
        onChange={(v: string) => { setSearch(v); if(!isOpen) onToggle() }} 
        onFocus={onToggle}
      />
      {isOpen && (
        <div style={{ 
          position: 'absolute', top: '100%', left: 0, right: 0, 
          backgroundColor: 'white', border: '1px solid #eee', borderRadius: '16px', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 500, marginTop: '0.5rem',
          maxHeight: '350px', overflowY: 'auto'
        }}>
          {searching ? (
            <div style={{ padding: '1.5rem', textAlign: 'center' }}><Loader2 className="animate-spin" size={24} color={variantColor} /></div>
          ) : results.length > 0 ? (
            results.map((item: any) => (
              <div 
                key={item.id} 
                className="dropdown-item"
                onClick={() => { onAdd(item); onClose() }}
                style={{ padding: '1rem', borderBottom: '1px solid #f5f5f5', cursor: 'pointer' }}
              >
                <span style={{ fontWeight: 900, color: variantColor, fontSize: '0.7rem' }}>{item.code || item.number}</span>
                <p style={{ fontSize: '0.85rem', color: '#333', marginTop: '0.2rem' }}>{item.description}</p>
              </div>
            ))
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#999' }}>{search.length < 2 ? 'Digite para buscar...' : 'Nenhum resultado'}</div>
          )}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
        {selected.map((item: any) => (
          <div key={item.id} style={{ 
            backgroundColor: 'white', padding: '1rem', borderRadius: '16px', 
            border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 900, color: variantColor, fontSize: '0.7rem' }}>{item.code || item.number}</span>
              <p style={{ fontSize: '0.85rem' }}>{item.description}</p>
            </div>
            <button onClick={() => onRemove(item.id)} style={{ color: '#ff4d4d', padding: '0.5rem' }}><Trash2 size={16} /></button>
          </div>
        ))}
        {selected.length === 0 && <EmptyText />}
      </div>
    </div>
  )
}

const ViewSection = ({ label, icon, children }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'hsl(var(--primary))' }}>
      <div style={{ 
        width: '32px', height: '32px', borderRadius: '8px', 
        background: 'hsl(var(--primary) / 0.1)', display: 'flex', 
        alignItems: 'center', justifyContent: 'center' 
      }}>
        {icon}
      </div>
      <span style={{ fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
    </div>
    <div style={{ 
      fontSize: '1rem', color: '#333', lineHeight: 1.6, 
      wordBreak: 'break-word', overflowWrap: 'anywhere' 
    }}>
      {children}
    </div>
  </div>
)

const BnccTag = ({ code, description }: any) => (
  <div style={{ 
    padding: '1.5rem', backgroundColor: '#fcfcfd', borderRadius: '18px', 
    border: '1px solid #f0eff5', display: 'flex', gap: '1rem', alignItems: 'flex-start',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
  }}>
    <span style={{ 
      backgroundColor: 'hsl(var(--primary))', color: 'white', 
      padding: '0.25rem 0.6rem', borderRadius: '8px', 
      fontSize: '0.7rem', fontWeight: 950, flexShrink: 0,
      letterSpacing: '0.02em'
    }}>{code}</span>
    <span style={{ 
      fontSize: '0.85rem', lineHeight: 1.6, fontWeight: 550, 
      color: '#2d3748', wordBreak: 'break-word' 
    }}>{description}</span>
  </div>
)

const EmptyText = () => <span style={{ color: '#bbb', fontSize: '0.9rem', fontStyle: 'italic' }}>Nenhum item selecionado</span>

// ══════════ SUBCOMPONENTE: VISUALIZADOR ══════════
const LessonPlanVisualizer = ({ plan, onClose, isMobile, isInfantil }: { plan: LessonPlan; onClose: () => void; isMobile: boolean; isInfantil: boolean }) => (
  <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '0' : '2rem' }} onClick={onClose}>
    <div className="glass animate-scale-in" style={{ width: '100%', maxWidth: '900px', maxHeight: '95vh', backgroundColor: 'white', borderRadius: isMobile ? '0' : '30px', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
      <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}>
        <div>
          <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.75rem', fontWeight: 950, color: 'hsl(var(--text))', letterSpacing: '-0.03em' }}>{isInfantil ? 'Plano de Aula Infantil' : 'Plano de Aula Mensal'}</h2>
          <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: 600, marginTop: '0.2rem' }}>{plan.subject} • {plan.month}</div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => window.print()} className="btn btn-secondary" style={{ display: isMobile ? 'none' : 'flex', padding: '0.75rem 1.25rem', borderRadius: '14px' }}>Imprimir</button>
          <button onClick={onClose} className="btn-primary" style={{ width: '44px', height: '44px', borderRadius: '14px' }}>✕</button>
        </div>
      </div>

      <div style={{ padding: isMobile ? '1.5rem' : '4rem', cursor: 'default' }} id="printable-plan" className="print-content">
        <div style={{ textAlign: 'center', borderBottom: '1px solid #eee', paddingBottom: '2.5rem', marginBottom: '3rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'black' }}>Planejamento de Ensino</div>
          <div style={{ color: '#666', marginTop: '0.5rem', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.02em' }}>
            Unidade de Gestão Educacional • Ciclo {plan.bimester}º Bimestre
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {isInfantil ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2rem' }}>
                <ViewSection label="Campos de Experiência" icon={<Target size={18} />}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {plan.custom_specific_comp?.split(';').filter(Boolean).map((c, i) => <div key={i} style={{ padding: '1rem', backgroundColor: '#f0f4ff', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600 }}>{c}</div>)}
                  </div>
                </ViewSection>
                <ViewSection label="Direitos de Aprendizagem" icon={<Book size={18} />}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {plan.custom_general_comp?.split(';').filter(Boolean).map((c, i) => <div key={i} style={{ padding: '1rem', backgroundColor: '#fff8f0', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600 }}>{c}</div>)}
                   </div>
                </ViewSection>
              </div>
              <ViewSection label="Objetivos de Aprendizagem (BNCC)" icon={<FileText size={18} />}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                  {plan.bncc_skills?.map(s => <BnccTag key={s.id} code={s.code} description={s.description} />)}
                </div>
              </ViewSection>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2rem' }}>
                <ViewSection label="Público Alvo / Local" icon={<LayoutList size={18} />}>{plan.knowledge_objects || '---'}</ViewSection>
                <ViewSection label="Conteúdo Programático" icon={<Book size={18} />}>{plan.programmatic_content || '---'}</ViewSection>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2rem' }}>
                <ViewSection label="COMPETÊNCIAS GERAIS" icon={<Target size={18} />}>
                  {plan.bncc_general_comp?.length ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {plan.bncc_general_comp.map(c => <BnccTag key={c.id} code={`CG${c.number}`} description={c.description} />)}
                    </div>
                  ) : <EmptyText />}
                  {plan.custom_general_comp && <blockquote style={{ margin: '1rem 0 0', paddingLeft: '1rem', borderLeft: '3px solid #eee', color: '#555' }}>{plan.custom_general_comp}</blockquote>}
                </ViewSection>
                <ViewSection label="COMPETÊNCIAS ESPECÍFICAS DA ÁREA" icon={<Target size={18} />}>
                  {plan.bncc_specific_comp?.length ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {plan.bncc_specific_comp.map(c => <BnccTag key={c.id} code={c.code} description={c.description} />)}
                    </div>
                  ) : <EmptyText />}
                  {plan.custom_specific_comp && <blockquote style={{ margin: '1rem 0 0', paddingLeft: '1rem', borderLeft: '3px solid #eee', color: '#555' }}>{plan.custom_specific_comp}</blockquote>}
                </ViewSection>
              </div>

              <ViewSection label="HABILIDADE(S) (BNCC)" icon={<FileText size={18} />}>
                {plan.bncc_skills?.length ? (
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                    {plan.bncc_skills.map(s => <BnccTag key={s.id} code={s.code} description={s.description} />)}
                  </div>
                ) : <EmptyText />}
                {plan.skills && <p style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '12px', fontSize: '0.95rem' }}>{plan.skills}</p>}
              </ViewSection>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2rem' }}>
                <ViewSection label="OBJETO(S) DE CONHECIMENTO (CONTEÚDO)" icon={<LayoutList size={18} />}>{plan.knowledge_objects || '---'}</ViewSection>
                <ViewSection label="CONTEÚDOS PROGRAMÁTICOS" icon={<Book size={18} />}>{plan.content || '---'}</ViewSection>
              </div>

              <ViewSection label="CRONOGRAMA DETALHADO (SEMANAS)" icon={<Calendar size={18} />}>{plan.programmatic_content || '---'}</ViewSection>
              <ViewSection label="PROCEDIMENTOS METODOLÓGICOS" icon={<LayoutList size={18} />}>{plan.methodology || '---'}</ViewSection>
            </>
          )}

          {!isInfantil && (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '2rem' }}>
              <ViewSection label="RECURSOS" icon={<LayoutList size={18} />}>{plan.resources || '---'}</ViewSection>
              <ViewSection label="REFERÊNCIAS" icon={<Book size={18} />}>{plan.references || '---'}</ViewSection>
              <ViewSection label="PROCEDIMENTOS AVALIATIVOS" icon={<CheckCircle2 size={18} />}>{plan.evaluation || '---'}</ViewSection>
            </div>
          )}
          
          {isInfantil && (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2rem' }}>
              <ViewSection label="Metodologia / Procedimentos" icon={<LayoutList size={18} />}>{plan.methodology || '---'}</ViewSection>
              <ViewSection label="Avaliação" icon={<CheckCircle2 size={18} />}>{plan.evaluation || '---'}</ViewSection>
              <ViewSection label="Recursos" icon={<LayoutList size={18} />}>{plan.resources || '---'}</ViewSection>
              <ViewSection label="Referências" icon={<Book size={18} />}>{plan.references || '---'}</ViewSection>
            </div>
          )}
        </div>
        <div style={{ padding: '2rem', backgroundColor: '#fcfcfc', borderTop: '1px solid #eee', fontSize: '0.85rem', color: '#999', textAlign: 'center', marginTop: '3rem' }}>
          Documento gerado digitalmente via Sistema de Gestão Educacional • {new Date().toLocaleDateString()}
        </div>
      </div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-plan, #printable-plan * { visibility: visible; }
          #printable-plan { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; margin: 0 !important; }
          .print-content { padding: 0 !important; gap: 2rem !important; }
          .glass { box-shadow: none !important; border: none !important; }
          blockquote { border-left-color: #ddd !important; }
        }
      `}</style>
    </div>
  </div>
)

// ══════════ COMPONENTE PRINCIPAL ══════════
export const LessonPlanPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()
  
  // ══════════ ESTADOS ══════════
  const [plans, setPlans] = useState<LessonPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPlan, setCurrentPlan] = useState<LessonPlan | null>(null)
  const [viewingPlan, setViewingPlan] = useState<LessonPlan | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [subjects, setSubjects] = useState<string[]>([])
  const [activeClass, setActiveClass] = useState<ClassMetadata | null>(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  // Estados de busca BNCC
  const [bnccSearch, setBnccSearch] = useState('')
  const [bnccResults, setBnccResults] = useState<BnccRef[]>([])
  const [searchingBNCC, setSearchingBNCC] = useState(false)
  const [selectedBnccIds, setSelectedBnccIds] = useState<string[]>([])
  const [selectedBnccObjects, setSelectedBnccObjects] = useState<BnccRef[]>([])

  const [genCompSearch, setGenCompSearch] = useState('')
  const [genCompResults, setGenCompResults] = useState<BnccRef[]>([])
  const [searchingGen, setSearchingGen] = useState(false)
  const [selectedGenIds, setSelectedGenIds] = useState<string[]>([])
  const [selectedGenObjects, setSelectedGenObjects] = useState<BnccRef[]>([])

  const [specCompSearch, setSpecCompSearch] = useState('')
  const [specCompResults, setSpecCompResults] = useState<BnccRef[]>([])
  const [searchingSpec, setSearchingSpec] = useState(false)
  const [selectedSpecIds, setSelectedSpecIds] = useState<string[]>([])
  const [selectedSpecObjects, setSelectedSpecObjects] = useState<BnccRef[]>([])

  // Estados dos seletores customizados
  const [openSubject, setOpenSubject] = useState(false)
  const [openBimester, setOpenBimester] = useState(false)
  const [openMonth, setOpenMonth] = useState(false)

  // ══════════ LÓGICA DE NÍVEL (MEMOIZED) ══════════
  const isInfantil = useMemo(() => {
    const levelName = activeClass?.grade?.level?.name || ''
    return levelName.toLowerCase().includes('infantil')
  }, [activeClass])

  const levelDisplayName = useMemo(() => {
    if (!activeClass) return ''
    return `${activeClass.grade.name} • ${activeClass.grade.level.name}`
  }, [activeClass])

  // ══════════ EFEITOS E BUSCAS ══════════
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
      if (data && data.subjects) {
        setSubjects(data.subjects)
        setActiveClass(data.class)
      } else {
        setSubjects(data)
      }
    } catch (e) { console.error(e) }
  }, [classId])

  useEffect(() => {
    if (classId) {
      fetchPlans()
      fetchAllocations()
    }
  }, [classId, fetchPlans, fetchAllocations])

  const bnccRequestId = useRef(0)
  const genRequestId = useRef(0)
  const specRequestId = useRef(0)

  // Efeitos de busca assíncrona
  useEffect(() => {
    const isActive = activeDropdown === 'habilidades'
    const queryTerm = bnccSearch.trim()
    // Só bloqueia se não estiver ativo E termo for curto
    if (!isActive && queryTerm.length < 1) { setBnccResults([]); return }
    const requestId = ++bnccRequestId.current
    const timer = setTimeout(async () => {
      setSearchingBNCC(true)
      try {
        const queryParams = new URLSearchParams({ q: queryTerm })
        if (currentPlan?.subject) queryParams.append('subject', currentPlan.subject)
        
        // Se for Infantil, forçar busca por códigos EI se o termo for curto ou vazio
        if (isInfantil && queryTerm.length < 2) {
          queryParams.set('q', 'EI')
        }

        const results = await api(`/teacher/bncc/search?${queryParams.toString()}`)
        
        // Filtro adicional no client-side para garantir que só venha EI se for infantil
        const filtered = isInfantil 
          ? results.filter((r: any) => r.code?.startsWith('EI'))
          : results;

        if (requestId === bnccRequestId.current) setBnccResults(filtered)
      } catch (e) { if (requestId === bnccRequestId.current) console.error(e) }
      finally { if (requestId === bnccRequestId.current) setSearchingBNCC(false) }
    }, isActive && queryTerm === '' ? 0 : 200)
    return () => clearTimeout(timer)
  }, [bnccSearch, currentPlan?.subject, activeDropdown, isInfantil])

  useEffect(() => {
    const isActive = activeDropdown === 'gerais'
    const queryTerm = genCompSearch.trim()
    if (!isActive && queryTerm.length < 1) { setGenCompResults([]); return }
    const requestId = ++genRequestId.current
    const timer = setTimeout(async () => {
      setSearchingGen(true)
      try {
        const queryParams = new URLSearchParams({ q: queryTerm })
        const results = await api(`/teacher/bncc/general-search?${queryParams.toString()}`)
        if (requestId === genRequestId.current) setGenCompResults(results)
      } catch (e) { if (requestId === genRequestId.current) console.error(e) }
      finally { if (requestId === genRequestId.current) setSearchingGen(false) }
    }, isActive && queryTerm === '' ? 0 : 200)
    return () => clearTimeout(timer)
  }, [genCompSearch, activeDropdown])

  useEffect(() => {
    const isActive = activeDropdown === 'especificas'
    const queryTerm = specCompSearch.trim()
    if (!isActive && queryTerm.length < 1) { setSpecCompResults([]); return }
    const requestId = ++specRequestId.current
    const timer = setTimeout(async () => {
      setSearchingSpec(true)
      try {
        const queryParams = new URLSearchParams({ q: queryTerm })
        const results = await api(`/teacher/bncc/specific-search?${queryParams.toString()}`)
        if (requestId === specRequestId.current) setSpecCompResults(results)
      } catch (e) { if (requestId === specRequestId.current) console.error(e) }
      finally { if (requestId === specRequestId.current) setSearchingSpec(false) }
    }, isActive && queryTerm === '' ? 0 : 200)
    return () => clearTimeout(timer)
  }, [specCompSearch, activeDropdown])

  // ══════════ HANDLERS ══════════
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
    content: '',
    type: 'Mensal',
    status: 'PENDING'
  })

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
      const { bncc_skills, bncc_general_comp, bncc_specific_comp, ...cleanPlan } = currentPlan as any
      await api('/teacher/lesson-plans', {
        method: 'POST',
        body: JSON.stringify({ 
          ...cleanPlan, 
          classId,
          bncc_skills_ids: selectedBnccIds,
          bncc_general_comp_ids: selectedGenIds,
          bncc_specific_comp_ids: selectedSpecIds
        })
      })
      toast.success('Plano de aula salvo!')
      setIsEditing(false); setCurrentPlan(null); fetchPlans()
    } catch (error) { toast.error('Erro ao salvar plano') }
    finally { setSaving(false) }
  }

  // Opções estáticas
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

  // ══════════ AUXILIARES DE RENDER ══════════
  // (Componente MultiSelectField agora é externo para usar refs)

  // ══════════ RENDERIZAÇÃO FINAL ══════════
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '0 1rem 6rem' : '0 2rem 10rem' }}>
        
        <header style={{ padding: '2rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => isEditing ? setIsEditing(false) : navigate(-1)} className="card-interactive" style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'white', border: '1px solid #eee' }}><ChevronLeft size={24} /></button>
            <div>
              <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 950, lineHeight: 1 }}>{isEditing ? 'Planejamento' : 'Meus Planos'}</h1>
              {activeClass && (
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--primary))', marginTop: '0.2rem', textTransform: 'uppercase', opacity: 0.8 }}>
                  {levelDisplayName}
                </p>
              )}
            </div>
          </div>
          {!isEditing && <button onClick={handleCreateNew} className="btn btn-primary"><Plus size={20} /> Novo Plano</button>}
        </header>

        {isEditing && currentPlan ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <SectionCard isMobile={isMobile} icon={<Calendar />} title="Identificação" accent="linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)">
               <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.25rem' }}>
                 <CustomSelect label="Disciplina" value={currentPlan.subject} options={subjects.map(s => ({ value: s, label: s }))} isOpen={openSubject} setIsOpen={setOpenSubject} onChange={(v: string) => setCurrentPlan({ ...currentPlan, subject: v })} />
                 <CustomSelect label="Bimestre" value={currentPlan.bimester} options={bimesterOptions} isOpen={openBimester} setIsOpen={setOpenBimester} onChange={(v: string) => setCurrentPlan({ ...currentPlan, bimester: v })} />
                 <CustomSelect label="Mês de Referência" value={currentPlan.month} options={monthOptions} isOpen={openMonth} setIsOpen={setOpenMonth} onChange={(v: string) => setCurrentPlan({ ...currentPlan, month: v })} />
               </div>
            </SectionCard>

            {isInfantil ? (
              <SectionCard isMobile={isMobile} icon={<Target />} title="Campos e Direitos (Infantil)" accent="linear-gradient(135deg, #fffcf0 0%, #fff9e0 100%)">
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2rem' }}>
                   <MultiCheckGroup 
                     label="Campos de Experiência" 
                     options={INFANTIL_CAMPOS} 
                     selected={currentPlan.custom_specific_comp?.split(';').filter(Boolean) || []}
                     onChange={(vals: string[]) => setCurrentPlan({ ...currentPlan, custom_specific_comp: vals.join(';') })}
                   />
                   <MultiCheckGroup 
                     label="Direitos de Aprendizagem" 
                     options={INFANTIL_DIREITOS} 
                     selected={currentPlan.custom_general_comp?.split(';').filter(Boolean) || []}
                     onChange={(vals: string[]) => setCurrentPlan({ ...currentPlan, custom_general_comp: vals.join(';') })}
                   />
                </div>
              </SectionCard>
            ) : (
              <SectionCard isMobile={isMobile} icon={<Target />} title="Base BNCC" accent="linear-gradient(135deg, #fffcf0 0%, #fff9e0 100%)">
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2rem' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                     <MultiSelectField isOpen={activeDropdown === 'gerais'} onToggle={() => setActiveDropdown('gerais')} onClose={() => setActiveDropdown(null)} label="Competências Gerais" placeholder="Buscar..." search={genCompSearch} setSearch={setGenCompSearch} results={genCompResults} searching={searchingGen} selected={selectedGenObjects} onAdd={(it: any) => { if(!selectedGenIds.includes(it.id)) { setSelectedGenIds([...selectedGenIds, it.id]); setSelectedGenObjects([...selectedGenObjects, it]) } }} onRemove={(id: string) => { setSelectedGenIds(selectedGenIds.filter(i => i !== id)); setSelectedGenObjects(selectedGenObjects.filter(o => o.id !== id)) }} variantColor="orange" isMobile={isMobile} />
                     <FormGroup label="Anotações de Competências Gerais" placeholder="Complemente as competências..." value={currentPlan.custom_general_comp} onChange={(v: string) => setCurrentPlan({ ...currentPlan, custom_general_comp: v })} height="100px" />
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                     <MultiSelectField isOpen={activeDropdown === 'especificas'} onToggle={() => setActiveDropdown('especificas')} onClose={() => setActiveDropdown(null)} label="Competências Específicas" placeholder="Buscar..." search={specCompSearch} setSearch={setSpecCompSearch} results={specCompResults} searching={searchingSpec} selected={selectedSpecObjects} onAdd={(it: any) => { if(!selectedSpecIds.includes(it.id)) { setSelectedSpecIds([...selectedSpecIds, it.id]); setSelectedSpecObjects([...selectedSpecObjects, it]) } }} onRemove={(id: string) => { setSelectedSpecIds(selectedSpecIds.filter(i => i !== id)); setSelectedSpecObjects(selectedSpecObjects.filter(o => o.id !== id)) }} variantColor="blue" isMobile={isMobile} />
                     <FormGroup label="Anotações de Competências Específicas" placeholder="Observações específicas..." value={currentPlan.custom_specific_comp} onChange={(v: string) => setCurrentPlan({ ...currentPlan, custom_specific_comp: v })} height="100px" />
                   </div>
                </div>
              </SectionCard>
            )}

            <SectionCard isMobile={isMobile} icon={<LayoutList />} title="Desenvolvimento">
               <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                 {!isInfantil && (
                   <>
                     <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
                        <FormGroup label="OBJETO(S) DE CONHECIMENTO (CONTEÚDO)" placeholder="O que será ensinado?" value={currentPlan.knowledge_objects} onChange={(v: string) => setCurrentPlan({ ...currentPlan, knowledge_objects: v })} height="120px" />
                        <FormGroup label="CONTEÚDOS PROGRAMÁTICOS" placeholder="Temas, capítulos e unidades..." value={currentPlan.content} onChange={(v: string) => setCurrentPlan({ ...currentPlan, content: v })} height="120px" />
                     </div>
                     <MultiSelectField isOpen={activeDropdown === 'habilidades'} onToggle={() => setActiveDropdown('habilidades')} onClose={() => setActiveDropdown(null)} label="HABILIDADE(S) (BNCC)" placeholder="Código..." search={bnccSearch} setSearch={setBnccSearch} results={bnccResults} searching={searchingBNCC} selected={selectedBnccObjects} onAdd={(it: any) => { if(!selectedBnccIds.includes(it.id)) { setSelectedBnccIds([...selectedBnccIds, it.id]); setSelectedBnccObjects([...selectedBnccObjects, it]) } }} onRemove={(id: string) => { setSelectedBnccIds(selectedBnccIds.filter(i => i !== id)); setSelectedBnccObjects(selectedBnccObjects.filter(o => o.id !== id)) }} variantColor="green" isMobile={isMobile} />
                     <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
                        <FormGroup label="CRONOGRAMA DETALHADO (SEMANAS)" placeholder="Distribuição do conteúdo (Ex: Semana 1, Semana 2...)" value={currentPlan.programmatic_content} onChange={(v: string) => setCurrentPlan({ ...currentPlan, programmatic_content: v })} height="120px" />
                        <FormGroup label="PROCEDIMENTOS METODOLÓGICOS" placeholder="Lúdico, laboratório, pesquisa, socioemocional..." value={currentPlan.methodology} onChange={(v: string) => setCurrentPlan({ ...currentPlan, methodology: v })} height="120px" />
                     </div>
                     <FormGroup label="HABILIDADE(S) PRÓPRIAS" placeholder="Inovação, projetos e específicas..." value={currentPlan.skills} onChange={(v: string) => setCurrentPlan({ ...currentPlan, skills: v })} height="80px" />
                     <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        <FormGroup label="RECURSOS" placeholder="Mapas, vídeos, livros..." value={currentPlan.resources} onChange={(v: string) => setCurrentPlan({ ...currentPlan, resources: v })} height="100px" />
                        <FormGroup label="REFERÊNCIAS" placeholder="Bibliografia utilizada..." value={currentPlan.references} onChange={(v: string) => setCurrentPlan({ ...currentPlan, references: v })} height="100px" />
                        <FormGroup label="PROCEDIMENTOS AVALIATIVOS" placeholder="Processos avaliativos..." value={currentPlan.evaluation} onChange={(v: string) => setCurrentPlan({ ...currentPlan, evaluation: v })} height="100px" />
                     </div>
                   </>
                 )}
                 {isInfantil && (
                   <>
                     <FormGroup label="Público Alvo / Local" value={currentPlan.knowledge_objects} onChange={(v: string) => setCurrentPlan({ ...currentPlan, knowledge_objects: v })} />
                     <FormGroup label="Conteúdo Programático" value={currentPlan.programmatic_content} onChange={(v: string) => setCurrentPlan({ ...currentPlan, programmatic_content: v })} />
                     <MultiSelectField isOpen={activeDropdown === 'habilidades'} onToggle={() => setActiveDropdown('habilidades')} onClose={() => setActiveDropdown(null)} label="Objetivos de Aprendizagem (BNCC)" placeholder="Código..." search={bnccSearch} setSearch={setBnccSearch} results={bnccResults} searching={searchingBNCC} selected={selectedBnccObjects} onAdd={(it: any) => { if(!selectedBnccIds.includes(it.id)) { setSelectedBnccIds([...selectedBnccIds, it.id]); setSelectedBnccObjects([...selectedBnccObjects, it]) } }} onRemove={(id: string) => { setSelectedBnccIds(selectedBnccIds.filter(i => i !== id)); setSelectedBnccObjects(selectedBnccObjects.filter(o => o.id !== id)) }} variantColor="green" isMobile={isMobile} />
                     <FormGroup label="Metodologia / Procedimentos" value={currentPlan.methodology} onChange={(v: string) => setCurrentPlan({ ...currentPlan, methodology: v })} />
                     <FormGroup label="Avaliação" value={currentPlan.evaluation} onChange={(v: string) => setCurrentPlan({ ...currentPlan, evaluation: v })} />
                   </>
                 )}
               </div>
            </SectionCard>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={() => setIsEditing(false)} className="btn btn-secondary">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving ? <Loader2 className="animate-spin" /> : 'Salvar Planejamento'}</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {plans.map(p => (
              <div key={p.id} className="card-interactive-premium" style={{ padding: '2rem', borderRadius: '30px', background: 'white', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <div><span style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem', color: '#999' }}>{p.month} • {p.bimester}º Bimestre</span><h3 style={{ fontSize: '1.3rem', fontWeight: 1000, marginTop: '0.5rem' }}>{p.subject}</h3></div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <button onClick={() => setViewingPlan(p)} className="btn btn-secondary" style={{ flex: 1 }}>Ver</button>
                   <button onClick={() => handleEdit(p)} className="btn btn-primary" style={{ flex: 1.5 }}>Editar</button>
                   <button onClick={() => { if(confirm('Excluir?')) api(`/teacher/lesson-plans/${p.id}`, { method: 'DELETE' }).then(() => fetchPlans()) }} className="btn" style={{ background: '#fff0f0', color: 'red' }}><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewingPlan && (
          <LessonPlanVisualizer plan={viewingPlan} onClose={() => setViewingPlan(null)} isMobile={isMobile} isInfantil={isInfantil} />
        )}
      </div>
    </div>
  )
}
