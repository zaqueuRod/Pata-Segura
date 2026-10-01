import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { db } from '../firebase'
import { ref, push, set, serverTimestamp, get } from 'firebase/database'

export default function EscolherPagamento() {
  const navegar = useNavigate()
  const [parametros] = useSearchParams()

  const idCuidador = parametros.get('cuidadorId')
  const nomeCuidador = parametros.get('cuidadorNome')
  const valorServico = parseFloat(parametros.get('valor') || '25')
  const [formaEscolhida, setFormaEscolhida] = useState('')
  const [processando, setProcessando] = useState(false)

  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'))

  async function confirmarPagamento() {
    if (!formaEscolhida) return
    setProcessando(true)

    try {
      if (formaEscolhida === 'cartao') {
        navegar('/pagamento-stripe', {
          state: {
            cuidadorId: idCuidador,
            cuidadorNome: nomeCuidador,
            valor: valorServico
          }
        })
        return
      }

      if (formaEscolhida === 'pix') {
        navegar('/pagamento-pix', {
          state: {
            cuidadorId: idCuidador,
            cuidadorNome: nomeCuidador,
            valor: valorServico
          }
        })
        return
      }

      if (formaEscolhida === 'dinheiro') {
        // ✅ Verifica se tem usuário logado
        if (!usuarioLogado || !usuarioLogado.id) {
          throw new Error('Usuário não identificado. Faça login novamente.')
        }
        if (!idCuidador) {
          throw new Error('Cuidador não identificado.')
        }

        // ✅ Busca saldo atual do cuidador
        const saldoRef = ref(db, `saldos/${idCuidador}`)
        const snapshot = await get(saldoRef)
        
        // ✅ Valor já existente ou 0
        const saldoRetidoAtual = snapshot.exists() 
          ? (snapshot.val().retido || 0) 
          : 0

        // ✅ Dinheiro = 100% retido
        const valorRetirido = valorServico
        const novoSaldoRetido = saldoRetidoAtual + valorRetirido
        const disponivelAtual = snapshot.exists() 
          ? (snapshot.val().disponivel || 0) 
          : 0

        // ✅ Cria a chamada
        const chamadasRef = ref(db, 'chamadas')
        const novaChamada = push(chamadasRef)
        await set(novaChamada, {
          id: novaChamada.key,
          cuidadorId: idCuidador,
          donoId: usuarioLogado.id,
          donoNome: usuarioLogado.nome,
          valor: valorServico,
          formaPagamento: 'dinheiro',
          status: 'pendente',
          criadoEm: serverTimestamp()
        })

        // ✅ Atualiza saldo retido do cuidador
        await set(saldoRef, {
          retido: novoSaldoRetido,
          disponivel: disponivelAtual,
          ultimaAtualizacao: serverTimestamp()
        })

        alert(`✅ Chamada enviada!\n💵 Valor total retido: R$ ${valorServico.toFixed(2)}`)
        navegar('/pedidos')
      }
    } catch (erro) {
      console.error('ERRO:', erro)
      alert(`❌ ${erro.message || 'Erro ao processar pagamento. Tente novamente.'}`)
    } finally {
      setProcessando(false)
    }
  }

  return (
    <div style={estilos.pagina}>
      <div style={estilos.container}>
        <h2 style={estilos.titulo}>💳 Escolher Pagamento</h2>
        <p style={estilos.dadosCuidador}>
          Cuidador: <strong>{nomeCuidador || 'Carregando...'}</strong>
        </p>
        <p style={estilos.valor}>
          Valor do serviço: <strong>R$ {valorServico.toFixed(2)}</strong>
        </p>

        <div style={estilos.opcoes}>
          <button
            onClick={() => setFormaEscolhida('dinheiro')}
            style={{
              ...estilos.botaoOpcao,
              ...(formaEscolhida === 'dinheiro' ? estilos.selecionado : {})
            }}
          >
            💵 Dinheiro
            <span style={estilos.detalheOpcao}>100% retido → liberado depois</span>
          </button>

          <button
            onClick={() => setFormaEscolhida('pix')}
            style={{
              ...estilos.botaoOpcao,
              ...(formaEscolhida === 'pix' ? estilos.selecionado : {})
            }}
          >
            📱 PIX
            <span style={estilos.detalheOpcao}>70% liberado + 30% retido</span>
          </button>

          <button
            onClick={() => setFormaEscolhida('cartao')}
            style={{
              ...estilos.botaoOpcao,
              ...(formaEscolhida === 'cartao' ? estilos.selecionado : {})
            }}
          >
            💳 Cartão
            <span style={estilos.detalheOpcao}>Cadastre e pague com cartão</span>
          </button>
        </div>

        <button
          onClick={confirmarPagamento}
          disabled={processando || !formaEscolhida}
          style={{
            ...estilos.botaoConfirmar,
            ...(formaEscolhida ? estilos.botaoAtivo : {})
          }}
        >
          {processando ? 'Processando...' : '✅ Confirmar e Contratar'}
        </button>

        <button
          onClick={() => navegar(-1)}
          style={estilos.botaoVoltar}
        >
          ← Voltar
        </button>
      </div>
    </div>
  )
}

const estilos = {
  pagina: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
    padding: '40px 16px',
    display: 'flex',
    justifyContent: 'center'
  },
  container: {
    width: '100%',
    maxWidth: '420px',
    background: '#fff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  titulo: {
    fontSize: '24px',
    margin: '0 0 8px',
    color: '#1e293b'
  },
  dadosCuidador: {
    fontSize: '15px',
    color: '#475569',
    margin: '0 0 8px'
  },
  valor: {
    fontSize: '20px',
    color: '#166534',
    margin: '0 0 24px',
    fontWeight: 'bold'
  },
  opcoes: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px'
  },
  botaoOpcao: {
    padding: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    background: '#fff',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s'
  },
  selecionado: {
    borderColor: '#166534',
    background: '#f0fdf4'
  },
  detalheOpcao: {
    display: 'block',
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px'
  },
  botaoConfirmar: {
    width: '100%',
    padding: '16px',
    border: 'none',
    borderRadius: '12px',
    background: '#d1d5db',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'not-allowed',
    transition: 'all 0.2s'
  },
  botaoAtivo: {
    background: 'linear-gradient(135deg, #166534, #15803d)',
    cursor: 'pointer'
  },
  botaoVoltar: {
    marginTop: '12px',
    padding: '10px',
    background: 'transparent',
    border: 'none',
    color: '#6b7280',
    fontSize: '14px',
    cursor: 'pointer'
  }
}