import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { ref, push, set, serverTimestamp, onValue } from 'firebase/database'

export default function BuscaMapa() {
  const [dadosUsuario, setDadosUsuario] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [chamadaEnviada, setChamadaEnviada] = useState(false)
  const [cuidadores, setCuidadores] = useState([])

  // ✅ Carrega dados do Dono logado
  useEffect(() => {
    const salvo = localStorage.getItem('usuarioLogado')
    if (salvo) {
      setDadosUsuario(JSON.parse(salvo))
    }
  }, [])

  // ✅ Carrega TODOS os CUIDADORES cadastrados em TEMPO REAL ⚡
  useEffect(() => {
    const usuariosRef = ref(db, 'usuarios')
    const pararEscutar = onValue(usuariosRef, (snapshot) => {
      if (snapshot.exists()) {
        const lista = []
        snapshot.forEach((filho) => {
          const usuario = { id: filho.key, ...filho.val() }
          // ✅ Pega SOMENTE os CUIDADORES
          if (usuario.tipo === 'cuidador') {
            lista.push(usuario)
          }
        })
        setCuidadores(lista)
      }
    })
    return () => pararEscutar()
  }, [])

  // ✅ Dono faz a BUSCA = envia chamada
  async function fazerBusca() {
    if (!dadosUsuario) {
      alert('⚠️ Faça login primeiro!')
      return
    }

    setBuscando(true)

    try {
      navigator.geolocation.getCurrentPosition(
        async (posicao) => {
          const lat = posicao.coords.latitude
          const lng = posicao.coords.longitude

          // ✅ Salva chamada no Firebase
          const chamadasRef = ref(db, 'chamadas')
          const novaChamada = push(chamadasRef)
          await set(novaChamada, {
            idChamada: novaChamada.key,
            nomeDono: dadosUsuario.nome,
            emailDono: dadosUsuario.email,
            lat: lat,
            lng: lng,
            status: 'aberto',
            cuidadorAceitou: null,
            hora: serverTimestamp()
          })

          alert('✅ Busca enviada!\n\n🔔 Os cuidadores foram notificados!')
          setChamadaEnviada(true)
          setBuscando(false)

          setTimeout(() => setChamadaEnviada(false), 300000)
        },
        (erro) => {
          alert('⚠️ Não consegui acessar sua localização!\nAtive a localização do navegador.')
          setBuscando(false)
        }
      )
    } catch (erro) {
      console.error(erro)
      alert('❌ Erro: ' + erro.message)
      setBuscando(false)
    }
  }

  // ✅ Formata os serviços oferecidos
  function listarServicos(cuidador) {
    const servicos = []
    if (cuidador.servicos?.passear) servicos.push('🚶 Passeio')
    if (cuidador.servicos?.cuidarEmCasa) servicos.push('🏠 Em Casa')
    if (cuidador.servicos?.medicacaoTratamento) servicos.push('💊 Tratamento')
    return servicos.join('  •  ')
  }

  return (
    <div style={{padding: '20px', maxWidth: '460px', margin: '0 auto'}}>
      <h2 style={{textAlign: 'center', color: '#1f2937', marginBottom: '25px'}}>🔍 Buscar Cuidador</h2>

      {/* ✅ LISTA DE CUIDADORES DISPONÍVEIS */}
      {cuidadores.length > 0 && (
        <div style={{marginBottom: '30px'}}>
          <h3 style={{fontSize: '16px', color: '#374151', marginBottom: '12px'}}>🐾 Cuidadores Disponíveis</h3>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {cuidadores.map((cuidador) => (
              <div key={cuidador.id} style={{
                padding: '15px',
                backgroundColor: '#f0fdf4',
                borderRadius: '12px',
                border: '1px solid #bbf7d0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
              }}>
                <h4 style={{margin: '0 0 8px 0', color: '#166534', fontSize: '16px'}}>
                  🐾 {cuidador.nome}
                </h4>

                <p style={{margin: '4px 0', fontSize: '15px', fontWeight: 'bold', color: '#15803d'}}>
                  💰 R$ {cuidador.valorHora?.toFixed(2).replace('.', ',') || '0,00'} / hora
                </p>

                <p style={{margin: '8px 0', fontSize: '13px', color: '#4b5563'}}>
                  {listarServicos(cuidador) || 'Nenhum serviço informado'}
                </p>

                {cuidador.observacoes && (
                  <p style={{margin: '6px 0 0 0', fontSize: '12px', color: '#6b7280', fontStyle: 'italic'}}>
                    📝 {cuidador.observacoes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {cuidadores.length === 0 && (
        <p style={{textAlign: 'center', color: '#9ca3af', marginBottom: '25px'}}>
          Nenhum cuidador cadastrado ainda...
        </p>
      )}

      {/* ✅ BOTÃO DE BUSCA */}
      {!chamadaEnviada ? (
        <button
          onClick={fazerBusca}
          disabled={buscando}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: buscando ? '#9ca3af' : '#22c55e',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '17px',
            fontWeight: 'bold',
            cursor: buscando ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(34,197,94,0.3)'
          }}
        >
          {buscando ? '🔄 Enviando busca...' : '🐾 BUSCAR E NOTIFICAR CUIDADORES'}
        </button>
      ) : (
        <div style={{padding: '25px', backgroundColor: '#dbeafe', borderRadius: '12px', textAlign: 'center'}}>
          <h3 style={{color: '#1d4ed8', margin: '0'}}>✅ Busca Enviada!</h3>
          <p style={{color: '#1e40af', marginTop: '8px'}}>
            🔔 Cuidadores foram notificados! Aguarde alguém aceitar...
          </p>
          <button
            onClick={() => setChamadaEnviada(false)}
            style={{marginTop: '15px', padding: '10px 20px', backgroundColor: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'}}
          >
            🔄 Nova Busca
          </button>
        </div>
      )}
    </div>
  )
}