import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database'

export default function HistoricoSaques() {
  const [usuario, setUsuario] = useState(null)
  const [saques, setSaques] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('usuarioLogado')
    if (!dadosSalvos) {
      setCarregando(false)
      return
    }

    const usuarioLogado = JSON.parse(dadosSalvos)
    setUsuario(usuarioLogado)

    // ✅ Busca SAQUES DESTE CUIDADOR em TEMPO REAL
    const saquesRef = ref(db, 'saques')
    const busca = query(saquesRef, orderByChild('idCuidador'), equalTo(usuarioLogado.id))
    
    const pararEscuta = onValue(busca, (snapshot) => {
      if (snapshot.exists()) {
        const lista = []
        snapshot.forEach((item) => {
          lista.unshift({ id: item.key, ...item.val() }) // Mais recente primeiro
        })
        setSaques(lista)
      } else {
        setSaques([])
      }
      setCarregando(false)
    })

    return () => pararEscuta()
  }, [])

  if (carregando) {
    return (
      <div style={{padding: '30px', textAlign: 'center'}}>
        <h3>🔄 Carregando histórico...</h3>
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
    <div style={{padding: '20px', maxWidth: '420px', margin: '0 auto', paddingBottom: '90px'}}>
      <h2 style={{textAlign: 'center', color: '#1f2937', marginBottom: '25px'}}>💰 Histórico de Saques</h2>

      {saques.length === 0 ? (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          color: '#6b7280'
        }}>
          <p style={{fontSize: '40px', margin: '0 0 10px 0'}}>📭</p>
          <p style={{fontSize: '15px'}}>Nenhum saque solicitado ainda.</p>
          <p style={{fontSize: '13px'}}>Quando você sacar, aparecerá aqui!</p>
        </div>
      ) : (
        <>
          <p style={{textAlign: 'right', fontSize: '13px', color: '#6b7280', margin: '0 0 15px 0'}}>
            Total: {saques.length} saque(s)
          </p>

          {saques.map((saque) => (
            <div key={saque.id} style={{
              padding: '15px',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              marginBottom: '10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                <span style={{fontSize: '18px', fontWeight: 'bold', color: '#f97316'}}>
                  R$ {saque.valor.toFixed(2).replace('.', ',')}
                </span>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: saque.status === 'aprovado' ? '#dcfce7' : '#fef3c7',
                  color: saque.status === 'aprovado' ? '#166534' : '#92400e'
                }}>
                  {saque.status === 'aprovado' ? '✅ Pago' : '⏳ Pendente'}
                </span>
              </div>
              <p style={{fontSize: '13px', color: '#6b7280', margin: 0}}>
                📅 {saque.data}
              </p>
            </div>
          ))}
        </>
      )}
    </div>
  )
}