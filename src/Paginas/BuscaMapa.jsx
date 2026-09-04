import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { ref, push, set, serverTimestamp } from 'firebase/database'

export default function BuscaMapa() {
  const [dadosUsuario, setDadosUsuario] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [chamadaEnviada, setChamadaEnviada] = useState(false)

  // ✅ Carrega os dados do DONO logado
  useEffect(() => {
    const salvo = localStorage.getItem('usuarioLogado')
    if (salvo) {
      setDadosUsuario(JSON.parse(salvo))
    }
  }, [])

  // ✅ Função: Dono faz a BUSCA = ENVIA CHAMADA para TODOS os Cuidadores
  async function fazerBusca() {
    if (!dadosUsuario) {
      alert('⚠️ Faça login primeiro!')
      return
    }

    setBuscando(true)

    try {
      // ✅ Pega a localização atual do Dono
      navigator.geolocation.getCurrentPosition(
        async (posicao) => {
          const lat = posicao.coords.latitude
          const lng = posicao.coords.longitude

          // ✅ SALVA A CHAMADA NO FIREBASE → Cuidadores recebem NA HORA!
          const chamadasRef = ref(db, 'chamadas')
          const novaChamada = push(chamadasRef)

          await set(novaChamada, {
            idChamada: novaChamada.key,
            nomeDono: dadosUsuario.nome,
            emailDono: dadosUsuario.email,
            lat: lat,
            lng: lng,
            status: 'aberto', // ← 'aberto' = esperando cuidador
            cuidadorAceitou: null,
            hora: serverTimestamp()
          })

          console.log('✅ Chamada enviada!')
          alert('✅ Busca enviada!\n\n🔔 Os cuidadores próximos foram notificados!')
          setChamadaEnviada(true)
          setBuscando(false)

          // ✅ Apaga a chamada depois de 5 minutos se ninguém aceitar
          setTimeout(() => {
            setChamadaEnviada(false)
          }, 300000)
        },
        (erro) => {
          alert('⚠️ Não consegui acessar sua localização!\nAtive a localização do navegador.')
          setBuscando(false)
        }
      )
    } catch (erro) {
      console.error(erro)
      alert('❌ Erro ao buscar: ' + erro.message)
      setBuscando(false)
    }
  }

  return (
    <div style={{padding: '25px', textAlign: 'center'}}>
      <h2 style={{color: '#1f2937', marginBottom: '30px'}}>🔍 Buscar Cuidador</h2>

      {!chamadaEnviada ? (
        <>
          <p style={{fontSize: '16px', color: '#4b5563', marginBottom: '30px'}}>
            Clique abaixo para buscar cuidadores próximos de você!
          </p>

          <button
            onClick={fazerBusca}
            disabled={buscando}
            style={{
              padding: '18px 40px',
              backgroundColor: buscando ? '#9ca3af' : '#22c55e',
              color: '#fff',
              border: 'none',
              borderRadius: '50px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: buscando ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(34,197,94,0.3)'
            }}
          >
            {buscando ? '🔄 Buscando...' : '🐾 BUSCAR CUIDADOR'}
          </button>
        </>
      ) : (
        <div style={{padding: '30px', backgroundColor: '#dbeafe', borderRadius: '12px'}}>
          <h3 style={{color: '#1d4ed8'}}>✅ Busca Enviada!</h3>
          <p style={{color: '#1e40af', marginTop: '10px'}}>
            🔔 Cuidadores próximos estão sendo notificados...<br/>
            Aguarde alguém aceitar! 🐾
          </p>
          <button
            onClick={() => setChamadaEnviada(false)}
            style={{marginTop: '20px', padding: '10px 20px', backgroundColor: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer'}}
          >
            🔄 Fazer Nova Busca
          </button>
        </div>
      )}
    </div>
  )
}