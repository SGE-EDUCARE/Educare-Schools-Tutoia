import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, User, Heart, Shield } from 'lucide-react'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'

export const StudentCreate: React.FC = () => {
  const navigate = useNavigate()
  
  const [submitLoading, setSubmitLoading] = useState(false)
  
  // Dados Dinâmicos do Banco
  const [academicLevels, setAcademicLevels] = useState<any[]>([])
  const [academicGrades, setAcademicGrades] = useState<any[]>([])
  const [academicClasses, setAcademicClasses] = useState<any[]>([])
  
  // Naturalidade (IBGE)
  const [ufs, setUfs] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [loadingCities, setLoadingCities] = useState(false)
  const [selectedUf, setSelectedUf] = useState('')
  const [selectedCity, setSelectedCity] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    registration_id: '', // Será preenchido automaticamente
    education_level_id: '',
    grade_id: '',
    class_id: '',
    address: '',
    phone: '',
    document: '',
    birth_date: '',
    cpf: '',
    nis: '',
    father_name: '',
    mother_name: '',
    scholarship: false,
    photo_url: ''
  })

  useEffect(() => {
    fetchInitialData()
    fetchUfs()
  }, [])

  const fetchInitialData = async () => {
    try {
      const [raData, levelsData] = await Promise.all([
        api('/admin/next-ra'),
        api('/admin/academic/levels')
      ])
      
      setFormData(prev => ({ ...prev, registration_id: raData.nextRa }))
      setAcademicLevels(levelsData)
    } catch (e) {
      console.error("Erro ao carregar dados iniciais")
    }
  }

  const fetchUfs = async () => {
    try {
      const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      if (!response.ok) throw new Error('Falha ao buscar UFs')
      const data = await response.json()
      setUfs(data)
    } catch (e) {
      console.error("Erro IBGE UFs:", e)
    }
  }

  const handleUfChange = async (ufSigla: string) => {
    setSelectedUf(ufSigla)
    setSelectedCity('')
    setCities([])
    if (!ufSigla) return

    setLoadingCities(true)
    try {
      // Usando HTTPS e garantindo que o parâmetro está correto
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufSigla}/municipios?orderBy=nome`)
      if (!response.ok) throw new Error('Falha ao buscar cidades')
      const data = await response.json()
      setCities(data)
    } catch (e) {
      console.error("Erro IBGE Cidades:", e)
      alert("Não foi possível carregar as cidades deste estado.")
    } finally {
      setLoadingCities(false)
    }
  }

  // Busca Séries vinculadas ao Nível
  const handleLevelChange = async (levelId: string) => {
    setFormData({ ...formData, education_level_id: levelId, grade_id: '', class_id: '' })
    setAcademicGrades([])
    setAcademicClasses([])
    if (!levelId) return

    try {
      const allGrades = await api('/admin/academic/grades')
      const filtered = allGrades.filter((g: any) => g.level_id === levelId)
      setAcademicGrades(filtered)
    } catch (e) {
      console.error("Erro ao buscar séries")
    }
  }

  // Busca Turmas vinculadas à Série
  const handleGradeChange = async (gradeId: string) => {
    setFormData({ ...formData, grade_id: gradeId, class_id: '' })
    setAcademicClasses([])
    if (!gradeId) return

    try {
      const allClasses = await api('/admin/academic/classes')
      const filtered = allClasses.filter((c: any) => c.grade_id === gradeId)
      setAcademicClasses(filtered)
    } catch (e) {
      console.error("Erro ao buscar turmas")
    }
  }

  const validateCPF = (cpf: string) => {
    const cleanCpf = cpf.replace(/\D/g, '')
    if (cleanCpf.length !== 11) return false
    if (/^(\d)\1{10}$/.test(cleanCpf)) return false
    
    let sum = 0
    for (let i = 1; i <= 9; i++) sum = sum + parseInt(cleanCpf.substring(i - 1, i)) * (11 - i)
    let rest = (sum * 10) % 11
    if ((rest === 10) || (rest === 11)) rest = 0
    if (rest !== parseInt(cleanCpf.substring(9, 10))) return false
    
    sum = 0
    for (let i = 1; i <= 10; i++) sum = sum + parseInt(cleanCpf.substring(i - 1, i)) * (12 - i)
    rest = (sum * 10) % 11
    if ((rest === 10) || (rest === 11)) rest = 0
    if (rest !== parseInt(cleanCpf.substring(10, 11))) return false
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.cpf && !validateCPF(formData.cpf)) {
      toast.error('CPF inválido. Por favor, verifique os números.')
      return
    }

    setSubmitLoading(true)
    const loadId = toast.loading('Salvando matrícula...')
    try {
      const naturalness = selectedCity ? `${selectedCity} - ${selectedUf}` : ''
      
      const selectedLevel = academicLevels.find(l => l.id === formData.education_level_id)?.name
      const selectedGrade = academicGrades.find(g => g.id === formData.grade_id)?.name

      await api('/admin/students', {
        method: 'POST',
        body: JSON.stringify({ 
          ...formData, 
          naturalness,
          education_level: selectedLevel,
          grade_name: selectedGrade
        })
      })
      toast.success('Matrícula realizada com sucesso!', { id: loadId })
      navigate('/admin/students')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao realizar matrícula', { id: loadId })
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header className="flex items-center justify-between">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button 
            onClick={() => navigate('/admin/students')}
            className="btn btn-secondary" 
            style={{ padding: '0.75rem', borderRadius: '50%' }}
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'hsl(var(--text))' }}>Ficha de Matrícula</h1>
            <p style={{ color: 'hsl(var(--text-light))', fontSize: '1.1rem', fontWeight: 500 }}>Preencha os dados obrigatórios (*) e complementares.</p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* SEÇÃO 0: FOTO DO ALUNO */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', padding: '2rem' }}>
          <div style={{ position: 'relative' }}>
            <div className="icon-box" style={{ 
              width: '140px', 
              height: '140px', 
              backgroundColor: 'hsl(var(--background))', 
              border: '2px dashed hsl(var(--border))',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              cursor: 'pointer'
            }} onClick={() => document.getElementById('photo-upload')?.click()}>
              {formData.photo_url ? (
                <img src={formData.photo_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <User size={48} opacity={0.2} />
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, marginTop: '0.5rem', color: 'hsl(var(--text-light))' }}>CLIQUE PARA <br/>ANEXAR FOTO</p>
                </div>
              )}
            </div>
            <input 
              id="photo-upload" 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onloadend = () => setFormData({ ...formData, photo_url: reader.result as string })
                  reader.readAsDataURL(file)
                }
              }} 
            />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Foto do Estudante</h3>
            <p style={{ color: 'hsl(var(--text-light))', fontSize: '0.9rem' }}>
              Anexe uma foto nítida do aluno para identificação no sistema e documentos escolares. 
              Arquivos suportados: JPG, PNG. Máx 2MB.
            </p>
            {formData.photo_url && (
              <button 
                type="button" 
                onClick={() => setFormData({ ...formData, photo_url: '' })}
                style={{ marginTop: '1rem', fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--error))' }}
              >
                Remover Foto
              </button>
            )}
          </div>
        </div>
        {/* SEÇÃO 1: DADOS PESSOAIS */}
        <div className="card" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="flex items-center gap-3">
             <div className="icon-box" style={{ width: '40px', height: '40px', backgroundColor: 'hsl(var(--primary-light))', color: 'hsl(var(--primary))' }}>
                <User size={20} />
             </div>
             <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>1. Informações do Estudante</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Nome Completo *</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input" placeholder="Ex: Ana Maria Silva" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>RA / Matrícula (Auto) *</label>
              <input 
                required 
                readOnly 
                value={formData.registration_id} 
                className="input" 
                style={{ backgroundColor: 'hsl(var(--background))', cursor: 'not-allowed', fontWeight: 800, color: 'hsl(var(--primary))' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Data de Nascimento *</label>
              <input required type="date" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} className="input" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>CPF</label>
              <input value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value.replace(/\D/g, '')})} className="input" placeholder="000.000.000-00" maxLength={11} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>RG ou Certidão</label>
              <input value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} className="input" placeholder="Registro Geral" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>NIS</label>
              <input value={formData.nis} onChange={e => setFormData({...formData, nis: e.target.value})} className="input" placeholder="Número NIS" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Naturalidade (UF)</label>
              <select value={selectedUf} onChange={e => handleUfChange(e.target.value)} className="input">
                <option value="">Selecione UF...</option>
                {ufs.map(uf => <option key={uf.id} value={uf.sigla}>{uf.nome}</option>)}
              </select>
            </div>
            
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Cidade de Nascimento</label>
              <select 
                disabled={!selectedUf || loadingCities} 
                value={selectedCity} 
                onChange={e => setSelectedCity(e.target.value)} 
                className="input"
              >
                <option value="">{loadingCities ? 'Carregando cidades...' : 'Selecione Cidade...'}</option>
                {cities.map(city => <option key={city.id} value={city.nome}>{city.nome}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: FILIAÇÃO E CONTATO */}
        <div className="card" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="flex items-center gap-3">
             <div className="icon-box" style={{ width: '40px', height: '40px', backgroundColor: 'hsl(var(--success) / 0.1)', color: 'hsl(var(--success))' }}>
                <Heart size={20} />
             </div>
             <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>2. Filiação e Contato</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Nome da Mãe</label>
              <input value={formData.mother_name} onChange={e => setFormData({...formData, mother_name: e.target.value})} className="input" placeholder="Nome completo da progenitora" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Nome do Pai</label>
              <input value={formData.father_name} onChange={e => setFormData({...formData, father_name: e.target.value})} className="input" placeholder="Nome completo do genitor" />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Telefone de Contato</label>
              <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input" placeholder="(00) 00000-0000" />
            </div>
            
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Endereço Completo</label>
              <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="input" placeholder="Rua, Número, Bairro, Cidade - UF" />
            </div>
          </div>
        </div>

        {/* SEÇÃO 3: ACADÊMICO */}
        <div className="card" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="flex items-center gap-3">
             <div className="icon-box" style={{ width: '40px', height: '40px', backgroundColor: 'hsl(var(--warning) / 0.1)', color: 'hsl(var(--warning))' }}>
                <Shield size={20} />
             </div>
             <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>3. Alocação Acadêmica</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Nível de Ensino *</label>
              <select 
                required 
                value={formData.education_level_id} 
                onChange={e => handleLevelChange(e.target.value)} 
                className="input"
              >
                <option value="">Selecione...</option>
                {academicLevels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Série / Ano *</label>
              <select 
                required 
                disabled={!formData.education_level_id} 
                value={formData.grade_id} 
                onChange={e => handleGradeChange(e.target.value)} 
                className="input"
              >
                <option value="">Selecione...</option>
                {academicGrades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Turma Destino</label>
              <select 
                value={formData.class_id} 
                onChange={e => setFormData({...formData, class_id: e.target.value})} 
                className="input"
                disabled={!formData.grade_id}
              >
                <option value="">A definir...</option>
                {academicClasses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.turn?.name})</option>)}
              </select>
            </div>
            
            <div style={{ gridColumn: 'span 3', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', backgroundColor: 'hsl(var(--background))', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border) / 0.5)' }}>
               <input 
                 type="checkbox" 
                 id="scholarship" 
                 checked={formData.scholarship} 
                 onChange={e => setFormData({...formData, scholarship: e.target.checked})} 
                 style={{ width: '24px', height: '24px', cursor: 'pointer' }}
               />
               <label htmlFor="scholarship" style={{ fontSize: '1rem', fontWeight: 700, color: 'hsl(var(--text))', cursor: 'pointer' }}>
                 Este aluno é beneficiário de bolsa de estudos (Bolsista)
               </label>
            </div>
          </div>
        </div>

        {/* AÇÕES */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1.5rem', marginBottom: '4rem' }}>
          <button type="button" onClick={() => navigate('/admin/students')} className="btn btn-secondary">Cancelar</button>
          <button type="submit" disabled={submitLoading} className="btn btn-primary" style={{ padding: '1rem 3rem' }}>
             {submitLoading ? 'Processando...' : <><Check size={24} /> Finalizar e Registrar</>}
          </button>
        </div>

      </form>
    </div>
  )
}
