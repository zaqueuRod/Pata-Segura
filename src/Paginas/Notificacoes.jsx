import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { ref, onValue, update } from 'firebase/database'

export default function Notificacoes() {
  const [chamadas, setChamadas] = useState([])
  const [dadosCuidador, setDadosCuidador] = useState(null)

  // ✅ Carrega dados do Cuidador logado
  useEffect(() => {
    const salvo = localStorage.getItem('usuarioLogado')
    if (salvo) {
      setDadosCuidador(JSON.parse(salvo))
    }
  }, [])

  // ✅ FICA ESPERANDO CHAMADAS EM TEMPO REAL ⚡
  useEffect(() => {
    const chamadasRef = ref(db, 'chamadas')

    // ✅ SEMPRE que uma chamada for criada → APARECE NA HORA!
    const pararEscutar = onValue(chamadasRef, (snapshot) => {
      if (snapshot.exists()) {
        const lista = []
        snapshot.forEach((filho) => {
          const chamada = { id: filho.key, ...filho.val() }
          // ✅ Mostra SOMENTE chamadas ABERTAS (esperando cuidador)
          if (chamada.status === 'aberto') {
            lista.push(chamada)
          }
        })
        // ✅ Mostra as mais recentes primeiro
        setChamadas(lista.reverse())
      } else {
        setChamadas([])
      }
    })

    // ✅ Para de escutar quando sair da página
    return () => pararEscutar()
  }, [])

  // ✅ Cuidador ACEITA a chamada
  async function aceitarChamada(chamada) {
    if (!dadosCuidador) {
      alert('⚠️ Faça login como Cuidador!')
      return
    }

    try {
      const chamadaRef = ref(db, `chamadas/${chamada.id}`)
      await update(chamadaRef, {
        status: 'aceito',
        cuidadorAceitou: dadosCuidador.nome,
        emailCuidador: dadosCuidador.email
      })

      alert(`✅ Você ACEITOU a chamada de ${chamada.nomeDono}!\n\nO dono já foi avisado! 🎉`)
    } catch (erro) {
      console.error(erro)
      alert('❌ Erro ao aceitar: ' + erro.message)
    }
  }

  // ✅ Formata a hora
  function formatarHora(timestamp) {
    if (!timestamp) return 'Agora'
    const data = new Date(timestamp)
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{padding: '20px', maxWidth: '450px', margin: '0 auto'}}>
      <h2 style={{textAlign: 'center', color: '#1f2937', marginBottom: '25px'}}>🔔 Chamadas Abertas</h2>

      {chamadas.length === 0 ? (
        <div style={{textAlign: 'center', padding: '40px', color: '#6b7280'}}>
          <p style={{fontSize: '40px'}}>🐾</p>
          <p style={{fontSize: '16px', marginTop: '10px'}}>Nenhuma chamada no momento...</p>
          <p style={{fontSize: '14px'}}>Aguarde um Dono fazer uma busca!</p>
        </div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
          {chamadas.map((chamada) => (
            <div key={chamada.id} style={{
              padding: '18px',
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '2px solid #fbbf24',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{margin: '0 0 8px 0', color: '#92400e'}}>👤 {chamada.nomeDono}</h3>
              <p style={{margin: '4px 0', fontSize: '14px', color: '#4b5563'}}>
                🕐 {formatarHora(chamada.hora)}
              </p>
              <p style={{margin: '4px 0', fontSize: '13px', color: '#6b7280'}}>
                📍 Localização enviada
              </p>

              <button
                onClick={() => aceitarChamada(chamada)}
                style={{
                  marginTop: '12px',
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                ✅ ACEITAR Chamada
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}