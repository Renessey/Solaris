import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { quadras, getLotes } from '../lotes'
import { FiX } from 'react-icons/fi'

export default function Registros({ quadraSelecionada, setQuadraSelecionada, lotesDisponiveis, setLotesDisponiveis }) {
  const [registros, setRegistros] = useState([])
  const [busca, setBusca] = useState('')
  const [loteSelecionado, setLoteSelecionado] = useState('')

  const hoje = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  const handleQuadraChange = (e) => {
    const valor = e.target.value
    setQuadraSelecionada(valor)
    setLotesDisponiveis(getLotes(valor))
    setLoteSelecionado('')
  }

  const buscarRegistros = async () => {
    let query = supabase
      .from('cadastros')
      .select('*')
      .eq('data_registro', hoje) // só mostra registros do dia
      .is('hora_saida', null) // ainda não deram baixa

    if (busca) query = query.ilike('nome', `%${busca}%`)
    if (quadraSelecionada) query = query.eq('quadra', quadraSelecionada)
    if (loteSelecionado) query = query.eq('lote', loteSelecionado)

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) console.log('Erro ao buscar registros:', error)
    else setRegistros(data)
  }

  useEffect(() => {
    buscarRegistros()
  }, [])

  const limparBusca = () => {
    setBusca('')
    buscarRegistros()
  }

  // ✅ Corrigido — grava saída com horário de Brasília (UTC-3)
  // Atualiza a saída
const darBaixa = async (id) => {
  const horaSaida = new Date().toISOString() // salva UTC

  const { error } = await supabase
    .from('cadastros')
    .update({ hora_saida: horaSaida })
    .eq('id', id)

  if (error) console.log('Erro ao dar baixa:', error)
  else buscarRegistros()
}

// Formata qualquer horário corretamente pra Brasília
const formatarHoraBrasilia = (dataISO) => {
  if (!dataISO) return '—'
  const data = new Date(dataISO)
  return data.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour12: false,
  })
}



  return (
    <>
      {/* Barra de pesquisa */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
          <input
            type="text"
            placeholder="Nome, CPF ou Identidade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 2.5rem 0.5rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '1rem',
            }}
            
          />
          {busca && (
            <button
              onClick={limparBusca}
              style={{
                position: 'absolute',
                right: '0.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <FiX size={20} color="#555" style={{marginLeft: '90%', marginBottom: '-1%'}} />
            </button>
          )}
        </div>
        <button
          onClick={buscarRegistros}
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#2F80ED',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Pesquisar
        </button>
      </div>

      {/* Quadra e Lote lado a lado */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="quadra">Quadra:</label>
          <select
            id="quadra"
            value={quadraSelecionada}
            onChange={handleQuadraChange}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
          >
            <option value="">Selecione</option>
            {Object.keys(quadras).map((q) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label htmlFor="lote">Lote:</label>
          <select
            id="lote"
            value={loteSelecionado}
            onChange={(e) => setLoteSelecionado(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
          >
            <option value="">Selecione o lote</option>
            {lotesDisponiveis.map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Registros Cadastrados */}
      <div className="container-logs">
        <h2>Cadastros de Hoje</h2>

        {registros.length === 0 ? (
          <p>Nenhum registro encontrado.</p>
        ) : (
          <div className="cards-container">
            {registros.map((r) => (
              <div key={r.id} className="registro-card" style={{
                border: '1px solid #ddd',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1rem',
                background: '#fff',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  <span>{r.nome || '—'}</span>
                  <span>{r.cpf || '—'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                  <div>
                    <div><strong>Quadra:</strong> {r.quadra || '—'}</div>
                    <div><strong>Lote:</strong> {r.lote || '—'}</div>
                  </div>
                  <div>
                    <div><strong>Prisma:</strong> {r.prisma || '—'}</div>
                    <div><strong>Tipo:</strong> {r.tipo || '—'}</div>
                  </div>
                </div>

                <div style={{ marginTop: '0.5rem', color: '#333' }}>
                  <strong>Entrada:</strong>{' '}
                  {formatarHoraBrasilia(r.hora_entrada || r.created_at)}
                </div>

                {r.observacoes && (
                  <div style={{ marginTop: '0.5rem', color: '#555' }}>
                    <strong>Observações:</strong> {r.observacoes}
                  </div>
                )}

                {/* Botão de baixa */}
                <button
                  onClick={() => darBaixa(r.id)}
                  style={{
                    marginTop: '1rem',
                    width: '100%',
                    background: '#EB5757',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Dar Baixa
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
