import { useState, useEffect } from 'react'

export default function PaginaPedidos() {
  // Lista de pedidos (aqui você vai ligar com seus dados reais depois)
  const [pedidos, setPedidos] = useState([])

  // Carregar pedidos quando abrir a página
  useEffect(() => {
    // EXEMPLO de pedidos — você pode substituir pelos dados reais depois
    const pedidosExemplo = [
      { id: 1, nome: 'Passeio com Thor', data: '03/09/2026', valor: 45.00, status: 'Pendente' },
      { id: 2, nome: 'Visita à casa da Luna', data: '04/09/2026', valor: 35.50, status: 'Concluído' },
      { id: 3, nome: 'Passeio matinal', data: '05/09/2026', valor: 50.00, status: 'Pendente' },
    ]

    setPedidos(pedidosExemplo)
  }, [])

  return (
    <div style={estilos.pagina}>
      <h2 style={estilos.titulo}>📋 Meus Pedidos</h2>

      {pedidos.length === 0 ? (
        <p style={estilos.vazio}>Nenhum pedido encontrado.</p>
      ) : (
        <div style={estilos.lista}>
          {pedidos.map((pedido) => (
            <div key={pedido.id} style={estilos.cartao}>
              <h3 style={estilos.nome}>{pedido.nome}</h3>
              <p style={estilos.texto}>📅 Data: {pedido.data}</p>
              <p style={estilos.valor}>💰 R$ {pedido.valor.toFixed(2)}</p>
              <span style={{
                ...estilos.status,
                ...(pedido.status === 'Concluído' ? estilos.statusConcluido : estilos.statusPendente)
              }}>
                {pedido.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const estilos = {
  pagina: {
    padding: '20px',
    backgroundColor: '#f0f4f8',
    minHeight: '100vh'
  },
  titulo: {
    textAlign: 'center',
    fontSize: '24px',
    color: '#1f2937',
    marginBottom: '24px'
  },
  vazio: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '16px'
  },
  lista: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  cartao: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  nome: {
    margin: '0 0 10px 0',
    fontSize: '18px',
    color: '#1f2937'
  },
  texto: {
    margin: '4px 0',
    color: '#4b5563',
    fontSize: '15px'
  },
  valor: {
    margin: '8px 0',
    fontSize: '17px',
    fontWeight: 'bold',
    color: '#16a34a'
  },
  status: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 'bold',
    marginTop: '8px'
  },
  statusPendente: {
    backgroundColor: '#fef3c7',
    color: '#d97706'
  },
  statusConcluido: {
    backgroundColor: '#dcfce7',
    color: '#16a34a'
  }
}