import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import '../components/Sistema.css'

export default function Sistema() {
  const [cadastros, setCadastros] = useState([])
  const [busca, setBusca] = useState('')
  const [confirmarExclusao, setConfirmarExclusao] = useState(null)

  // ✅ Buscar todos os cadastros
  const buscarCadastros = async () => {
    const { data, error } = await supabase
      .from('cadastros')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.log('Erro ao buscar cadastros:', error)
    else setCadastros(data)
  }

  // ✅ Buscar ao abrir a tela
  useEffect(() => {
    buscarCadastros()
  }, [])

  // ✅ Formatar datas sem bug de UTC
  const formatarHoraBrasilia = (data) => {
    if (!data) return '—'

    // Supabase pode retornar "2025-11-06 12:40:00"
    // React precisa de "2025-11-06T12:40:00"
    const formatada = data.includes("T") ? data : data.replace(" ", "T")

    const dt = new Date(formatada)

    if (isNaN(dt.getTime())) return "—"

    return dt.toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // ✅ Filtro de busca (nome, cpf, rg, quadra, lote)
  const cadastrosFiltrados = cadastros.filter((r) =>
    [r.nome, r.cpf, r.rg, r.lote, r.quadra]
      .filter(Boolean)
      .some((campo) =>
        campo.toString().toLowerCase().includes(busca.toLowerCase())
      )
  )

  // ✅ Excluir registro
  const excluirCadastro = async (id) => {
    const { error } = await supabase.from('cadastros').delete().eq('id', id)

    if (error) {
      console.log('Erro ao excluir:', error)
      alert('Erro ao excluir registro.')
    } else {
      buscarCadastros()
      setConfirmarExclusao(null)
    }
  }

  return (
    <div className="tela-conteudo">
      <h2>📋 Histórico de Cadastros</h2>

      {/* ✅ Barra de pesquisa */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por nome, CPF, RG, lote ou quadra..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="search-input"
          style={{ marginBottom: '2rem' }}
        />
      </div>

      {cadastrosFiltrados.length === 0 ? (
        <p>Nenhum cadastro encontrado.</p>
      ) : (
        <div className="cards-container">
          {cadastrosFiltrados.map((r) => (
            <div key={r.id} className="registro-card">
              
              {/* ✅ Nome + CPF */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', gap: '0.1rem', fontSize: '0.9rem' }}>
                <span>{r.nome}</span>
                <span style={{color: 'white'}}>{r.cpf}</span>
              </div>

              {/* ✅ Dados */}
              <div style={{ marginTop: '0.5rem' }}>
                <div><strong>Quadra:</strong> {r.quadra}</div>
                <div><strong>Lote:</strong> {r.lote}</div>
                <div><strong>Placa:</strong> {r.placa ? r.placa : "—"}</div>
                <div><strong>Entrada:</strong> {formatarHoraBrasilia(r.hora_entrada)}</div>
                <div>
                  <strong>Saída:</strong>{' '}
                  {r.hora_saida ? formatarHoraBrasilia(r.hora_saida) : 'Ainda no local'}
                </div>
              </div>

              {/* ✅ Botão de exclusão */}
              <button
                className="delete-btn"
                onClick={() => setConfirmarExclusao(r.id)}
                style={{
                  marginTop: '0.5rem',
                  background: '#ff4d4f',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  width: '100%'
                }}
              >
                🗑️ Excluir
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Popup de confirmação */}
      {confirmarExclusao && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Excluir registro?</h3>
            <p>Essa ação não poderá ser desfeita.</p>

            <div className="popup-buttons">
              <button
                onClick={() => setConfirmarExclusao(null)}
                className="popup-cancel"
              >
                Cancelar
              </button>

              <button
                onClick={() => excluirCadastro(confirmarExclusao)}
                className="popup-delete"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
