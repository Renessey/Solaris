import { useState, useEffect } from 'react'
import { quadras, getLotes } from '../lotes'
import { supabase } from '../services/supabase'
import '../components/Cadastrar.css'

export default function Cadastrar({
  quadraSelecionada,
  setQuadraSelecionada,
  lotesDisponiveis,
  setLotesDisponiveis,
  voltarParaRegistros
}) {
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [prisma, setPrisma] = useState('')
  const [placa, setPlaca] = useState('')
  const [tipo, setTipo] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [loteSelecionado, setLoteSelecionado] = useState('')

  const [buscando, setBuscando] = useState(false)
  const [busca, setBusca] = useState('')
  const [sugestoes, setSugestoes] = useState([])

  const handleFocus = (e) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 300)
  }

  const handleQuadraChange = (e) => {
    const valor = e.target.value
    setQuadraSelecionada(valor)
    setLotesDisponiveis(getLotes(valor))
  }

  // ✅ BUSCA AUTOMÁTICA COM SUGESTÕES (autocomplete)
  useEffect(() => {
  const buscar = async () => {
    if (!busca || busca.length < 2) {
      setSugestoes([])
      return
    }

    setBuscando(true)

    const { data, error } = await supabase
      .from('cadastros')
      .select('id, nome, cpf')
      .or(`cpf.ilike.%${busca}%,nome.ilike.%${busca}%`)
      .limit(5)

    if (!error) {
      setSugestoes(data)
    }

    setBuscando(false)
  }

  const delay = setTimeout(buscar, 400)
  return () => clearTimeout(delay)
}, [busca])


  // ✅ Preencher os campos ao clicar em uma sugestão
  const selecionarSugestao = async (id) => {
    const { data } = await supabase
      .from('cadastros')
      .select('*')
      .eq('id', id)
      .single()

    if (data) {
      setNome(data.nome || '')
      setCpf(data.cpf || '')
      setPrisma(data.prisma || '')
      setPlaca(data.placa || '')
      setTipo(data.tipo || '')
      setObservacoes(data.observacoes || '')
      setQuadraSelecionada(data.quadra || '')
      setLoteSelecionado(data.lote || '')
      setLotesDisponiveis(getLotes(data.quadra))

      setBusca('')
      setSugestoes([])
    }
  }

  // ✅ MÁSCARA DE CPF / RG
  const maskCpfRg = (value) => {
    value = value.replace(/\D/g, '')

    if (value.length <= 11) {
      return value
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }

    return value
  }

  const handleCadastrar = async () => {
    if (!nome || !cpf) {
      alert('Preencha pelo menos o Nome e o CPF!')
      return
    }

    const horaEntrada = new Date().toISOString()

    const { error } = await supabase.from('cadastros').insert([
      {
        quadra: quadraSelecionada || null,
        lote: loteSelecionado || null,
        nome,
        cpf,
        prisma: prisma || null,
        placa: placa || null,
        tipo: tipo || null,
        observacoes: observacoes || null,
        hora_entrada: horaEntrada,
      }
    ])

    if (error) {
      alert('Erro ao cadastrar: ' + error.message)
    } else {
      alert('Registro cadastrado com sucesso!')
      setNome('')
      setCpf('')
      setPrisma('')
      setPlaca('')
      setTipo('')
      setObservacoes('')
      setQuadraSelecionada('')
      setLoteSelecionado('')
      setLotesDisponiveis([])
      voltarParaRegistros()
    }
  }

  return (
    <div className="tela-conteudo">
      <h2>Cadastro de usuário</h2>

      {/* ✅ CAMPO DE BUSCA SEPARADO */}
      <div className="form-group">
        <label>Buscar cadastro (CPF, RG ou Nome):</label>
        <input
          type="text"
          className="input-cadastro"
          placeholder="Buscar..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onFocus={handleFocus}
        />

        {buscando && <p style={{ fontSize: '0.9rem', color: '#888' }}>Buscando...</p>}

        {/* ✅ SUGESTÕES APARECENDO */}
        {sugestoes.length > 0 && (
          <div className="autocomplete-list">
            {sugestoes.map((item) => (
              <div
                key={item.id}
                className="autocomplete-item"
                onClick={() => selecionarSugestao(item.id)}
              >
                {item.nome} — {item.cpf || item.rg}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nome */}
      <div className="form-group">
        <label>Nome completo:</label>
        <input
          type="text"
          className="input-cadastro"
          placeholder="Digite o nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onFocus={handleFocus}
        />
      </div>

      {/* ✅ CPF/RG SEPARADO */}
      <div className="form-group">
        <label>CPF ou RG:</label>
        <input
          type="text"
          className="input-cadastro"
          placeholder="Digite CPF ou RG"
          value={cpf}
          maxLength="14"
          onChange={(e) => setCpf(maskCpfRg(e.target.value))}
          onFocus={handleFocus}
        />
      </div>

      {/* Quadra */}
      <div className="select-container">
        <select
          id="quadra"
          className="input-quadra"
          value={quadraSelecionada}
          onChange={handleQuadraChange}
          onFocus={handleFocus}
        >
          <option value="">Quadra</option>
          {Object.keys(quadras).map((q) => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>

        {/* Lote */}
        <select
          id="lote"
          className="input-lote"
          value={loteSelecionado}
          onChange={(e) => setLoteSelecionado(e.target.value)}
          onFocus={handleFocus}
        >
          <option value="">Lote</option>
          {lotesDisponiveis.map((num) => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>


      <div className="Prisma-tipo-container">
          {/* Prisma */}
      <div className="form-group">
        <select
          className="input-cadastro"
          value={prisma}
          onChange={(e) => setPrisma(e.target.value)}
          onFocus={handleFocus}
        >
          <option value="">Prisma</option>
          {[...Array(100)].map((_, i) => {
            const numero = i + 1
            const cores = ['Verde', 'Amarelo', 'Marrom', 'Azul']
            return cores.map((cor) => (
              <option key={`${cor}-${numero}`} value={`${cor}-${numero}`}>
                {`Prisma ${numero} - ${cor}`}
              </option>
            ))
          })}
        </select>
      </div>

        {/* Tipo */}
        <div className="form-group">
          <select
            className="input-cadastro"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            onFocus={handleFocus}
          >
            <option value="">Tipo</option>
            <option value="visitante">Visitante</option>
            <option value="prestador">Prestador de serviço</option>
            <option value="entregador">Entregador</option>
          </select>
        </div>
      </div>

      

      {/* Placa */}
      <div className="form-group">
        <label>Placa do carro:</label>
        <input
          type="text"
          className="input-cadastro"
          placeholder="ABC-1234"
          maxLength="8"
          value={placa}
          onChange={(e) => {
            let val = e.target.value.toUpperCase()
              .replace(/[^A-Z0-9]/g, '')
              .replace(/([A-Z]{3})(\d)/, '$1-$2')
              .slice(0, 8)
            setPlaca(val)
          }}
          onFocus={handleFocus}
        />
      </div>

      {/* Observações */}
      <div className="form-group">
        <label>Observações:</label>
        <textarea
          rows="3"
          className="input-cadastro"
          placeholder="Digite observações..."
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          onFocus={handleFocus}
        />
      </div>

      <div className="form-group" style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button className="btn-pesquisar" onClick={handleCadastrar}>
          Cadastrar
        </button>
      </div>
    </div>
  )
}
