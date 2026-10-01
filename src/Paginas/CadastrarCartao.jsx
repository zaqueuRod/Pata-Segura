import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStripe, CardElement, useElements } from '@stripe/react-stripe-js'
import { db } from '../firebase'
import { ref, push, set, serverTimestamp, get } from 'firebase/database'

export default function PagamentoStripe() {
  const stripe = useStripe()
  const elements = useElements()
  const navegar = useNavigate()
  const localizacao = useLocation()
  const { cuidadorId, cuidadorNome, valor } = localizacao.state || {}
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'))

  const [processando, setProcessando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  async function confirmarPagamento(e) {
    e.preventDefault()

    if (!stripe || !elements) return

    setProcessando(true)
    setErro('')

    try {
      // ✅ 1. O Stripe valida o cartão — VOCÊ NÃO VÊ NENHUM DADO!
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          name: usuarioLogado.nome
        }
      })

      if (error) {
        throw new Error(error.message || 'Dados do cartão inválidos')
      }

      // ✅ 2. Pegamos APENAS o ID do pagamento e últimos 4 dígitos
      const ultimosQuatro = paymentMethod.card.last4

      // ✅ 3. Registramos a chamada no Firebase
      const saldoRef = ref(db, `saldos/${cuidadorId}`)
      const snapshot = await get(saldoRef)
      const saldoRetido = snapshot.exists() ? snapshot.val().retido || 0 : 0

      const taxaRetencao = valor * 0.30
      const valorLiberado = valor * 0.70
      const descontoDoRetido = saldoRetido > 0 ? Math.min(saldoRetido, taxaRetencao) : 0
      const novoRetido = taxaRetencao + descontoDoRetido

      const chamadasRef = ref(db, 'chamadas')
      const novaChamada = push(chamadasRef)
      await set(novaChamada, {
        id: novaChamada.key,
        cuidadorId,
        cuidadorNome,
        donoId: usuarioLogado.id,
        donoNome: usuarioLogado.nome,
        valor,
        formaPagamento: 'cartao_stripe',
        pagamentoId: paymentMethod.id, // ✅ Referência do Stripe
        cartaoUltimosQuatro: ultimosQuatro, // ✅ Só os últimos 4 dígitos
        valorLiberado,
        retencao: novoRetido,
        status: 'confirmado',
        criadoEm: serverTimestamp()
      })

      // ✅ 4. Atualiza saldo do cuidador
      await set(saldoRef, {
        disponivel: valorLiberado,
        retido: saldoRetido - descontoDoRetido + taxaRetencao,
        ultimaAtualizacao: serverTimestamp()
      }, { merge: true })

      setSucesso(true)

      alert(`✅ Pagamento aprovado!
💳 Cartão final: **** ${ultimosQuatro}
💵 Valor liberado: R$ ${valorLiberado.toFixed(2)}
🔒 Retido: R$ ${novoRetido.toFixed(2)}`)

      setTimeout(() => navegar('/pedidos'), 1500)

    } catch (err) {
      console.error(err)
      setErro(`❌ ${err.message}`)
    } finally {
      setProcessando(false)
    }
  }

  if (sucesso) {
    return (
      <div style={estilos.pagina}>
        <div style={estilos.container}>
          <div style={estilos.iconeSucesso}>✅</div>
          <h2 style={estilos.titulo}>Pagamento Concluído!</h2>
          <p style={estilos.texto}>Redirecionando...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={estilos.pagina}>
      <div style={estilos.container}>
        <div style={estilos.iconeSeguranca}>🔒</div>
        <h2 style={estilos.titulo}>Pagamento Seguro</h2>
        <p style={estilos.subtitulo}>
          Processado por <strong>Stripe</strong> — seus dados nunca são armazenados
        </p>

        <div style={estilos.resumo}>
          <p style={estilos.textoResumo}>
            Cuidador: <strong>{cuidadorNome}</strong>
          </p>
          <p style={estilos.valor}>
            Valor: <strong>R$ {valor?.toFixed(2) || '0,00'}</strong>
          </p>
        </div>

        {erro && <div style={estilos.erro}>{erro}</div>}

        <form onSubmit={confirmarPagamento} style={estilos.formulario}>
          <div style={estilos.campoCartao}>
            <label style={estilos.label}>Dados do Cartão</label>
            
            {/* ✅ COMPONENTE DO STRIPE — DADOS NÃO PASSAM POR VOCÊ! */}
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#1e293b',
                    '::placeholder': { color: '#9ca3af' }
                  }
                }
              }}
            />
          </div>

          <div style={estilos.avisoSeguranca}>
            🔒 Dados processados diretamente pelo Stripe.<br />
            <strong>Nenhum dado do cartão é enviado para nossos servidores.</strong>
          </div>

          <button
            type="submit"
            disabled={!stripe || processando}
            style={{
              ...estilos.botao,
              ...(!stripe || processando ? estilos.desativado : {})
            }}
          >
            {processando ? 'Processando...' : `💳 Pagar R$ ${valor?.toFixed(2) || '0,00'}`}
          </button>

          <button
            type="button"
            onClick={() => navegar(-1)}
            style={estilos.botaoVoltar}
          >
            ← Voltar
          </button>
        </form>
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
    maxWidth: '440px',
    background: '#fff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  iconeSeguranca: { fontSize: '40px', marginBottom: '8px' },
  iconeSucesso: { fontSize: '48px', marginBottom: '16px' },
  titulo: { fontSize: '24px', margin: '0 0 8px', color: '#1e293b' },
  subtitulo: { fontSize: '14px', color: '#64748b', margin: '0 0 24px' },
  resumo: {
    background: '#f8fafc',
    padding: '16px',
    borderRadius: '10px',
    marginBottom: '20px'
  },
  textoResumo: { margin: '0 0 8px', fontSize: '14px', color: '#475569' },
  valor: { margin: 0, fontSize: '22px', color: '#166534', fontWeight: 'bold' },
  erro: {
    background: '#fef2f2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  formulario: { display: 'flex', flexDirection: 'column', gap: '16px' },
  campoCartao: {
    padding: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    textAlign: 'left'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '8px'
  },
  avisoSeguranca: {
    fontSize: '12px',
    color: '#166534',
    background: '#f0fdf4',
    padding: '12px',
    borderRadius: '8px',
    lineHeight: '1.5'
  },
  botao: {
    marginTop: '8px',
    padding: '16px',
    background: 'linear-gradient(135deg, #635bff, #5046e5)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  desativado: { opacity: 0.6, cursor: 'not-allowed' },
  botaoVoltar: {
    marginTop: '8px',
    padding: '12px',
    background: 'transparent',
    border: 'none',
    color: '#6b7280',
    fontSize: '14px',
    cursor: 'pointer'
  }
}