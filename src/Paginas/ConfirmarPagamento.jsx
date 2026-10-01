import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { db } from '../firebase'
import { ref, push, set, serverTimestamp, get } from 'firebase/database'

export default function ConfirmarPagamento() {
  const navegar = useNavigate()
  const localizacao = useLocation()
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'))
  const { cuidadorId, cuidadorNome, valor } = localizacao.state || {}

  useEffect(() => {
    if (!cuidadorId || !usuarioLogado) {
      navegar('/')
      return
    }

    efetuarPagamento()
  }, [])

  async function efetuarPagamento() {
    try {
      // 1. Busca saldo retido do cuidador
      const saldoRef = ref(db, `saldos/${cuidadorId}`)
      const snapshot = await get(saldoRef)
      const saldoRetido = snapshot.exists() ? snapshot.val().retido || 0 : 0

      // 2. Regra: 30% retido + desconta do saldo bloqueado se houver
      const taxaRetencao = valor * 0.30
      const valorLiberado = valor * 0.70
      const descontoDoRetido = saldoRetido > 0 ? Math.min(saldoRetido, taxaRetencao) : 0
      const novoRetencao = taxaRetencao + descontoDoRetido

      // 3. Cria a chamada
      const chamadasRef = ref(db, 'chamadas')
      const novaChamada = push(chamadasRef)
      await set(novaChamada, {
        id: novaChamada.key,
        cuidadorId,
        donoId: usuarioLogado.id,
        donoNome: usuarioLogado.nome,
        valor,
        formaPagamento: 'cartao',
        valorLiberado,
        retencao: novoRetencao,
        status: 'pendente',
        criadoEm: serverTimestamp()
      })

      // 4. Atualiza saldo do cuidador
      await set(saldoRef, {
        disponivel: valorLiberado,
        retido: saldoRetido - descontoDoRetido + taxaRetencao,
        ultimaAtualizacao: serverTimestamp()
      }, { merge: true })

      alert(`✅ Pagamento com cartão confirmado!\n\n💵 Valor liberado: R$ ${valorLiberado.toFixed(2)}\n🔒 Retido: R$ ${novoRetencao.toFixed(2)}`)
      navegar('/pedidos')
    } catch (erro) {
      console.error(erro)
      alert('❌ Erro ao confirmar pagamento')
      navegar('/')
    }
  }

  return (
    <div style={estilos.pagina}>
      <div style={estilos.container}>
        <div style={estilos.icone}>💳</div>
        <h2 style={estilos.titulo}>Processando pagamento...</h2>
        <p style={estilos.texto}>Aguarde um momento</p>
      </div>
    </div>
  )
}

const estilos = {
  pagina: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f8fafc'
  },
  container: {
    textAlign: 'center',
    padding: '40px'
  },
  icone: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  titulo: {
    fontSize: '20px',
    color: '#1e293b',
    marginBottom: '8px'
  },
  texto: {
    color: '#64748b'
  }
}