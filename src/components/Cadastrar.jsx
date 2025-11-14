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

  // POPUP
  const [popupVisible, setPopupVisible] = useState(false)
  const [popupMensagem, setPopupMensagem] = useState('')

  const abrirPopup = (msg) => {
    setPopupMensagem(msg)
    setPopupVisible(true)
  }

  const fecharPopup = () => {
    setPopupVisible(false)
    voltarParaRegistros()
  }

  // Scroll ao focar
  const handleFocus = (e) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 300)
  }

  // Mudar quadra → atualizar lotes
  const handleQuadraChange = (e) => {
    const valor = e.target.value
    setQuadraSelecionada(valor)
    setLotesDisponiveis(getLotes(valor))
    setLoteSelecionado('')
  }

  // MÁSCARA CPF BUSCA
  const maskCpfBusca = (value) => {
    value = value.replace(/\D/g, '')
    if (value.length <= 11) {
      return value
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    return value
  }

  // AUTOCOMPLETE
  useEffect(() => {
    const buscar = async () => {
      if (!busca || busca.length < 2) {
        setSugestoes([])
        return
      }

      setBuscando(true)

      const { data } = await supabase
        .from('cadastros')
        .select('id, nome, cpf')
        .or(`cpf.ilike.%${busca}%,nome.ilike.%${busca}%`)
        .limit(5)

      setSugestoes(data || [])
      setBuscando(false)
    }

    const delay = setTimeout(buscar, 300)
    return () => clearTimeout(delay)
  }, [busca])

  // Selecionar sugestão
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

  // Máscara CPF normal
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

  // Hora Brasília
  const gerarHoraBrasilia = () => {
    const agora = new Date()
    const utc = agora.getTime() + agora.getTimezoneOffset() * 60000
    const brasilia = new Date(utc - 3 * 3600000)

    const ano = brasilia.getFullYear()
    const mes = String(brasilia.getMonth() + 1).padStart(2, '0')
    const dia = String(brasilia.getDate()).padStart(2, '0')
    const hora = String(brasilia.getHours()).padStart(2, '0')
    const minuto = String(brasilia.getMinutes()).padStart(2, '0')
    const segundo = String(brasilia.getSeconds()).padStart(2, '0')

    return `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundo}`
  }

  // CADASTRAR / ATUALIZAR SEM DUPLICAR
  const handleCadastrar = async () => {
    if (!nome || !cpf) {
      abrirPopup('Preencha pelo menos o Nome e o CPF!')
      return
    }

    const horaEntrada = gerarHoraBrasilia()

    const { data: registrosCPF } = await supabase
      .from('cadastros')
      .select('*')
      .eq('cpf', cpf)

    let registroExistente = null

    if (registrosCPF && registrosCPF.length > 0) {
      registroExistente = registrosCPF.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )[0]
    }

    // Atualizar se existe
    if (registroExistente) {
      const { error: erroUpdate } = await supabase
        .from('cadastros')
        .update({
          quadra: quadraSelecionada || null,
          lote: loteSelecionado || null,
          nome,
          prisma: prisma || null,
          placa: placa || null,
          tipo: tipo || null,
          observacoes: observacoes || null,
          hora_saida: null,
          hora_entrada: horaEntrada,
          created_at: horaEntrada
        })
        .eq('id', registroExistente.id)

      if (!erroUpdate) abrirPopup('Cadastro atualizado com sucesso! ✅')
      else abrirPopup('Erro ao atualizar!')

      return
    }

    // Criar novo
    const { error } = await supabase.from('cadastros').insert([
      {
        quadra: quadraSelecionada || null,
        lote: loteSelecionado || null,
        nome,
        cpf,
        prisma: prisma || null,
        placa: placa || null,
        tipo,
        observacoes,
        hora_entrada: horaEntrada,
        hora_saida: null,
        created_at: horaEntrada
      }
    ])

    if (!error) abrirPopup('Registro cadastrado com sucesso! ✅')
    else abrirPopup('Erro ao cadastrar!')
  }

  return (
    <div className="tela-conteudo">

      {/* POPUP */}
      {popupVisible && (
        <div className="popup-fundo">
          <div className="popup-box">
            <p>{popupMensagem}</p>
            <button className="popup-btn" onClick={fecharPopup}>OK</button>
          </div>
        </div>
      )}

      <h2>Cadastro de usuário</h2>

      {/* AUTOCOMPLETE */}
      <div className="form-group">
        <label>Buscar cadastro (CPF ou Nome):</label>

        <input
          type="text"
          className="input-cadastro"
          placeholder="Buscar..."
          value={busca}
          onChange={(e) => {
            const val = e.target.value
            const numeros = val.replace(/\D/g, '')

            if (/^\d{0,11}$/.test(numeros)) {
              setBusca(maskCpfBusca(val))
            } else {
              setBusca(val)
            }
          }}
          onFocus={handleFocus}
        />

        {buscando && <p style={{ fontSize: '0.9rem', color: '#888' }}>Buscando...</p>}

        {sugestoes.length > 0 && (
          <div className="autocomplete-list">
            {sugestoes.map((item) => (
              <div
                key={item.id}
                className="autocomplete-item"
                onClick={() => selecionarSugestao(item.id)}
              >
                {item.nome} — {item.cpf}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginBottom: '1rem', width: '80%' }}>
        <button className="btn-pesquisar" onClick={handleCadastrar}>
          Cadastrar
        </button>
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

      {/* CPF */}
      <div className="form-group">
        <label>CPF ou RG:</label>
        <input
          type="text"
          className="input-cadastro"
          placeholder="Digite CPF"
          value={cpf}
          maxLength={14}
          onChange={(e) => setCpf(maskCpfRg(e.target.value))}
          onFocus={handleFocus}
        />
      </div>

      {/* Quadra e Lote */}
      <div className="select-container">
        <select
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

        <select
          className="input-lote"
          value={loteSelecionado}
          onChange={(e) => setLoteSelecionado(e.target.value)}
          onFocus={handleFocus}
        >
          <option value="">Lote</option>
          {lotesDisponiveis.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      {/* Prisma / Tipo */}
      <div className="Prisma-tipo-container">
        <div className="form-group">
          <select
            className="input-cadastro"
            value={prisma}
            onChange={(e) => setPrisma(e.target.value)}
            onFocus={handleFocus}
          >
            <option value="">Prisma</option>
            {[...Array(100)].map((_, i) => {
              const num = i + 1
              const cores = ['Verde', 'Amarelo', 'Marrom', 'Azul']
              return cores.map((cor) => (
                <option key={`${cor}-${num}`} value={`${cor}-${num}`}>
                  Prisma {num} — {cor}
                </option>
              ))
            })}
          </select>
        </div>

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
          maxLength={8}
          value={placa}
          onChange={(e) => {
            let val = e.target.value
              .toUpperCase()
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
    </div>
  )
}
