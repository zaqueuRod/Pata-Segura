import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { ref, get, update, onValue, push, set, serverTimestamp } from 'firebase/database'

export default function PaginaStatus() {
  const [usuario, setUsuario] = useState(null)
  const [saldo, setSaldo] = useState(0)
  const [online, setOnline] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [mensagem, setMensagem] = useState('')

  // ✅ Carrega dados do cuidador logado
  useEffect(() => {
    const dadosSalvos = localStorage.getItem('usuarioLogado')
    if (!dadosSalvos) {
      setCarregando(false)
      return
    }

    const usuarioLogado = JSON.parse(dadosSalvos)
    setUsuario(usuarioLogado)

    // ✅ Escuta ALTERAÇÕES em TEMPO REAL no Firebase
    const refCuidador = ref(db, `usuarios/${usuarioLogado.id}`)
    const pararEscuta = onValue(refCuidador, (snapshot) => {
      if (snapshot.exists()) {
        const dados = snapshot.val()
        setSaldo(dados.saldoSemana || 0)
        setOnline(dados.online || false)
      }
      setCarregando(false)
    })

    return () => pararEscuta()
  }, [])

  // ✅ Alternar Online / Offline
  async function alternarStatus() {
    if (!usuario) return
    const novoStatus = !online
    setOnline(novoStatus) // Atualiza na hora na tela

    try {
      const refCuidador = ref(db, `usuarios/${usuario.id}`)
      await update(refCuidador, {
        online: novoStatus,
        ultimoOnline: new Date().toLocaleString('pt-BR')
      })
    } catch (erro) {
      setMensagem('❌ Erro ao atualizar status!')
      setOnline(!novoStatus) // Volta se der erro
    }
  }

  // ✅ Função de SAQUE
  async function solicitarSaque() {
    if (!usuario) return
    if (saldo <= 0) {
      setMensagem('⚠️ Você não tem saldo para sacar!')
      return
    }

    const valorSaque = saldo
    const confirmar = window.confirm(
      `💰 Confirmar saque de R$ ${valorSaque.toFixed(2).replace('.', ',')}?\n\n` +
      'O saldo será zerado e o pedido registrado.'
    )
    if (!confirmar) return

    try {
      const refCuidador = ref(db, `usuarios/${usuario.id}`)
      const refSaques = ref(db, `saques`)

      // ✅ 1. Registra o saque no histórico
      const novoSaque = push(refSaques)
      await set(novoSaque, {
        idSaque: novoSaque.key,
        idCuidador: usuario.id,
        nomeCuidador: usuario.nome,
        valor: valorSaque,
        data: new Date().toLocaleString('pt-BR'),
        status: 'pendente',
        solicitadoEm: serverTimestamp()
      })

      // ✅ 2. Zera o saldo do cuidador
      await update(refCuidador, {
        saldoSemana: 0
      })

      setSaldo(0)
      setMensagem(`✅ Saque de R$ ${valorSaque.toFixed(2).replace('.', ',')} solicitado!`)
    } catch (erro) {
      console.error(erro)
      setMensagem('❌ Erro ao solicitar saque!')
    }
  }

  if (carregando) {
    return (
      <div style={{padding: '30px', textAlign: 'center'}}>
        <h3>🔄 Carregando...</h3>
      </div>
    )
  }

  if (!usuario || usuario.tipo !== 'cuidador') {
    return (
      <div style={{padding: '30px', textAlign: 'center'}}>
        <h3>⚠️ Área exclusiva para Cuidadores</h3>
        <p>Faça login como cuidador para acessar.</p>
      </div>
    )
  }

  return (
    <div style={{padding: '20px', maxWidth: '420px', margin: '0 auto'}}>
      <h2 style={{textAlign: 'center', color: '#1f2937', marginBottom: '30px'}}>🐾 Meu Status</h2>

      {/* ✅ SALDO */}
      <div style={{
        backgroundColor: '#f0fdf4',
        padding: '25px',
        borderRadius: '16px',
        textAlign: 'center',
        marginBottom: '25px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <p style={{fontSize: '15px', color: '#166534', margin: '0 0 10px 0'}}>💰 Saldo da Semana</p>
        <p style={{fontSize: '32px', fontWeight: 'bold', color: '#15803d', margin: 0}}>
          R$ {saldo.toFixed(2).replace('.', ',')}
        </p>
      </div>

      {/* ✅ BOTÃO ONLINE / OFFLINE */}
      <button
        onClick={alternarStatus}
        style={{
          width: '100%',
          padding: '16px',
          backgroundColor: online ? '#22c55e' : '#6b7280',
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          fontSize: '17px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginBottom: '15px',
          boxShadow: online ? '0 4px 12px rgba(34,197,94,0.3)' : 'none'
        }}
      >
        {online ? '🟢 DISPONÍVEL (Online)' : '⚫ INDISPONÍVEL (Offline)'}
      </button>

      {/* ✅ BOTÃO DE SAQUE */}
      <button
        onClick={solicitarSaque}
        disabled={saldo <= 0}
        style={{
          width: '100%',
          padding: '16px',
          backgroundColor: saldo > 0 ? '#f97316' : '#d1d5db',
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          fontSize: '17px',
          fontWeight: 'bold',
          cursor: saldo > 0 ? 'pointer' : 'not-allowed',
          boxShadow: saldo > 0 ? '0 4px 12px rgba(249,115,22,0.3)' : 'none'
        }}
      >
        💸 SACAR VALOR TOTAL
      </button>

      {/* ✅ MENSAGENS */}
      {mensagem && (
        <p style={{textAlign: 'center', marginTop: '20px', fontSize: '15px', color: mensagem.startsWith('✅') ? '#15803d' : '#dc2626'}}>
          {mensagem}
        </p>
      )}

      {/* ✅ INFORMAÇÕES */}
      <div style={{marginTop: '30px', padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '10px', fontSize: '13px', color: '#4b5563'}}>
        <p><strong>📌 Como funciona:</strong></p>
        <ul style={{margin: '8px 0', paddingLeft: '20px'}}>
          <li>Fique <strong>Disponível</strong> para receber chamadas</li>
          <li>O valor dos serviços é adicionado ao saldo automaticamente</li>
          <li>Ao sacar, o saldo é zerado e o pedido é registrado</li>
        </ul>
      </div>
    </div>
  )
}