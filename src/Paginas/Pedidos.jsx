import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { ref, onValue, get } from 'firebase/database'

export default function Pedidos() {
  const [chamadas, setChamadas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'))

  useEffect(() => {
    if (!usuarioLogado || !usuarioLogado.id) {
      setErro('Faça login para ver seus pedidos')
      setCarregando(false)
      return
    }

    const chamadasRef = ref(db, 'chamadas')
    
    const pararEscuta = onValue(chamadasRef, (snapshot) => {
      if (!snapshot.exists()) {
        setChamadas([])
        setCarregando(false)
        return
      }

      const dados = snapshot.val()
      const lista = []

      for (const id in dados) {
        const chamada = { id, ...dados[id] }
        
        // ✅ Mostra pedidos do Dono OU do Cuidador
        if (
          chamada.donoId === usuarioLogado.id ||
          chamada.cuidadorId === usuarioLogado.id
        ) {
          lista.push(chamada)
        }
      }

      // Mais recentes primeiro
      lista.sort((a, b) => (b.criadoEm || 0) - (a.criadoEm || 0))
      
      setChamadas(lista)
      setCarregando(false)
    }, (erro) => {
      console.error('Erro ao carregar pedidos:', erro)
      setErro('Não foi possível carregar os pedidos')
      setCarregando(false)
    })

    return () => pararEscuta()
  }, [])

  if (carregando) {
    return (
      <div style={estilos.pagina}>
        <div style={estilos.centro}>
          <p>⏳ Carregando pedidos...</p>
        </div>
      </div>
    )
  }

  if (erro) {
    return (
      <div style={estilos.pagina}>
        <div style={estilos.centro}>
          <p style={estilos.erro}>{erro}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={estilos.pagina}>
      <h2 style={estilos.titulo}>📋 Meus Pedidos</h2>

      {chamadas.length === 0 ? (
        <div style={estilos.vazio}>
          <p style={estilos.iconeVazio}>📭</p>
          <p>Nenhum pedido ainda.</p>
        </div>
      ) : (
        <div style={estilos.lista}>
          {chamadas.map((chamada) => (
            <div key={chamada.id} style={estilos.cartao}>
              <div style={estilos.cabecalhoCartao}>
                <span style={estilos.valor}>R$ {chamada.valor?.toFixed(2) || '0,00'}</span>
                <span style={{
                  ...estilos.status,
                  ...(chamada.status === 'pendente' ? estilos.pendente : estilos.confirmado)
                }}>
                  {chamada.status === 'pendente' ? '⏳ Pendente' : '✅ Confirmado'}
                </span>
              </div>

              <div style={estilos.detalhes}>
                <p><strong>Cuidador:</strong> {chamada.cuidadorNome || '—'}</p>
                <p><strong>Dono:</strong> {chamada.donoNome || '—'}</p>
                <p><strong>Pagamento:</strong> {
                  chamada.formaPagamento === 'dinheiro' ? '💵 Dinheiro' :
                  chamada.formaPagamento === 'pix' ? '📱 PIX' :
                  chamada.formaPagamento === 'cartao_stripe' ? '💳 Cartão' :
                  chamada.formaPagamento || '—'
                }</p>
                {chamada.cartaoUltimosQuatro && (
                  <p style={estilos.textoPequeno}>
                    Cartão final: **** {chamada.cartaoUltimosQuatro}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const estilos = {
  pagina: {
    minHeight: '100vh',
    padding: '24px 16px 80px',
    background: '#f8fafc'
  },
  titulo: {
    fontSize: '24px',
    margin: '0 0 24px',
    color: '#1e293b',
    textAlign: 'center'
  },
  centro: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#64748b'
  },
  erro: {
    color: '#dc2626',
    background: '#fef2f2',
    padding: '16px',
    borderRadius: '8px'
  },
  vazio: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#64748b'
  },
  iconeVazio: {
    fontSize: '48px',
    marginBottom: '12px'
  },
  lista: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '500px',
    margin: '0 auto'
  },
  cartao: {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  cabecalhoCartao: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #f1f5f9'
  },
  valor: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#166534'
  },
  status: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 600
  },
  pendente: {
    background: '#fef3c7',
    color: '#92400e'
  },
  confirmado: {
    background: '#dcfce7',
    color: '#166534'
  },
  detalhes: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '14px',
    color: '#475569'
  },
  textoPequeno: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '4px'
  }
}