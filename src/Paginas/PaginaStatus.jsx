import { useState, useEffect } from 'react'

export default function PaginaStatus() {
  // Estado de conexão: online ou offline
  const [estaOnline, setEstaOnline] = useState(false)
  // Saldo acumulado da semana (você pode ligar com sua API depois)
  const [saldoSemana, setSaldoSemana] = useState(0)

  // Carregar status e saldo salvos quando abrir a página
  useEffect(() => {
    const statusSalvo = localStorage.getItem('cuidador_online')
    const saldoSalvo = localStorage.getItem('saldo_semana')
    
    if (statusSalvo === 'sim') setEstaOnline(true)
    if (saldoSalvo) setSaldoSemana(parseFloat(saldoSalvo))
  }, [])

  // Salvar status sempre que mudar
  useEffect(() => {
    localStorage.setItem('cuidador_online', estaOnline ? 'sim' : 'nao')
  }, [estaOnline])

  // ✅ Função para buscar o saldo real da semana
  // (Aqui você vai conectar com seus dados/pedidos reais)
  useEffect(() => {
    // EXEMPLO: somar valores dos pedidos da semana
    // Você substituirá isso pela sua lógica de pedidos
    const pedidosFinalizados = [
      { valor: 35 },
      { valor: 45 },
      { valor: 28.50 },
    ]

    const total = pedidosFinalizados.reduce((soma, p) => soma + p.valor, 0)
    setSaldoSemana(total)
    localStorage.setItem('saldo_semana', total.toString())
  }, [])

  // Formatar valor em Real brasileiro
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  return (
    <div style={estilos.pagina}>
      <div style={estilos.cartao}>
        <h2 style={estilos.titulo}>Meu Status</h2>

        {/* Botão Online / Offline */}
        <div style={estilos.areaStatus}>
          <span style={estilos.textoStatus}>
            {estaOnline ? '🟢 Disponível' : '🔴 Indisponível'}
          </span>
          
          <button
            onClick={() => setEstaOnline(!estaOnline)}
            style={{
              ...estilos.botao,
              backgroundColor: estaOnline ? '#22c55e' : '#ef4444'
            }}
          >
            {estaOnline ? 'Ficar Offline' : 'Ficar Online'}
          </button>
        </div>

        <div style={estilos.divisor} />

        {/* Saldo da Semana */}
        <div style={estilos.areaSaldo}>
          <h3 style={estilos.rotuloSaldo}>💰 Saldo da Semana</h3>
          <p style={estilos.valorSaldo}>{formatarMoeda(saldoSemana)}</p>
          <p style={estilos.legenda}>Total dos serviços finalizados</p>
        </div>
      </div>
    </div>
  )
}

// Estilos simples direto no código
const estilos = {
  pagina: {
    minHeight: '100vh',
    backgroundColor: '#f0f4f8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  cartao: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '32px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
  },
  titulo: {
    textAlign: 'center',
    fontSize: '24px',
    marginBottom: '32px',
    color: '#1f2937'
  },
  areaStatus: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  textoStatus: {
    display: 'block',
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '16px'
  },
  botao: {
    padding: '12px 32px',
    fontSize: '17px',
    fontWeight: 'bold',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'opacity 0.2s'
  },
  divisor: {
    height: '1px',
    backgroundColor: '#e5e7eb',
    margin: '28px 0'
  },
  areaSaldo: {
    textAlign: 'center'
  },
  rotuloSaldo: {
    fontSize: '18px',
    color: '#4b5563',
    margin: '0 0 8px 0'
  },
  valorSaldo: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#16a34a',
    margin: '0 0 6px 0'
  },
  legenda: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0
  }
}