import { useState, useEffect, useRef } from 'react'

function Notificacoes() {
  const [pedidos, setPedidos] = useState([])
  const [usuario, setUsuario] = useState(null)
  const [ultimoIdRecebido, setUltimoIdRecebido] = useState(0)
  const audioRef = useRef(null)

  // Som de notificação compacto em base64 (TODA A STRING EM UMA LINHA SÓ)
  const somNotificacao = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhFAACICAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwyETQMDjP+NsxYgA=="

  // Função para tocar o som
  const tocarSom = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(err => console.log("Erro ao tocar som:", err))
    }
  }

  // Simulação de verificação de novos pedidos
  useEffect(() => {
    const verificarNovosPedidos = () => {
      // Aqui você vai buscar os pedidos do seu backend
      const pedidosRecentes = [] // ← substitua pela sua busca real

      if (pedidosRecentes.length > 0) {
        const idMaisRecente = pedidosRecentes[0]?.id
        if (idMaisRecente && idMaisRecente !== ultimoIdRecebido) {
          setUltimoIdRecebido(idMaisRecente)
          setPedidos(pedidosRecentes)
          tocarSom() // 🔔 TOCA O SOM QUANDO CHEGA NOVO PEDIDO
        }
      }
    }

    verificarNovosPedidos() // Verificação inicial
    const intervalo = setInterval(verificarNovosPedidos, 5000) // A cada 5 segundos

    return () => clearInterval(intervalo)
  }, [ultimoIdRecebido])

  return (
    <div style={{ padding: '20px' }}>
      {/* Elemento de áudio invisível */}
      <audio ref={audioRef} src={somNotificacao} preload="auto" />

      
      

      {pedidos.length === 0 ? (
        <p>Nenhum pedido novo no momento.</p>
      ) : (
        <div>
          <h3>Novos Pedidos:</h3>
          {pedidos.map(pedido => (
            <div key={pedido.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
              <p>Pedido #{pedido.id}</p>
              <p>Dono: {pedido.nomeDono}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notificacoes