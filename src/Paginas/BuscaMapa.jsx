import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { ref, push, set, serverTimestamp, onValue } from 'firebase/database'

export default function BuscaMapa() {
  const [dadosUsuario, setDadosUsuario] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [chamadaEnviada, setChamadaEnviada] = useState(false)
  const [cuidadores, setCuidadores] = useState([])
  const [minhaLocalizacao, setMinhaLocalizacao] = useState({ lat: -26.9134, lng: -48.6631 }) // Itajaí-SC padrão

  // ✅ Carrega dados do Dono logado
  useEffect(() => {
    const salvo = localStorage.getItem('usuarioLogado')
    if (salvo) {
      setDadosUsuario(JSON.parse(salvo))
    }
  }, [])

  // ✅ Pega localização do Dono
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setMinhaLocalizacao({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => console.log('Usando localização padrão de Itajaí-SC')
    )
  }, [])

  // ✅ Carrega CUIDADORES com localização em TEMPO REAL ⚡
  useEffect(() => {
    const usuariosRef = ref(db, 'usuarios')
    const pararEscutar = onValue(usuariosRef, (snapshot) => {
      if (snapshot.exists()) {
        const lista = []
        snapshot.forEach((filho) => {
          const usuario = { id: filho.key, ...filho.val() }
          if (usuario.tipo === 'cuidador' && usuario.lat && usuario.lng) {
            lista.push(usuario)
          }
        })
        setCuidadores(lista)
      }
    })
    return () => pararEscutar()
  }, [])

  // ✅ Dono faz a BUSCA
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
          alert('✅ Busca enviada!\n\n🔔 Os cuidadores próximos foram notificados!')
          setChamadaEnviada(true)
          setBuscando(false)
          setTimeout(() => setChamadaEnviada(false), 300000)
        },
        () => {
          alert('⚠️ Ative a localização do navegador!')
          setBuscando(false)
        }
      )
    } catch (erro) {
      alert('❌ Erro: ' + erro.message)
      setBuscando(false)
    }
  }

  // ✅ Monta link do mapa com marcadores (versão que FUNCIONA!) 📍
  function montarLinkMapa() {
    let centro = `${minhaLocalizacao.lat},${minhaLocalizacao.lng}`
    let marcadores = `${centro}` // Sua posição no centro

    cuidadores.forEach((c) => {
      marcadores += `|${c.lat},${c.lng}`
    })

    // ✅ Usa o Google Maps direto (sem API key!)
    return `https://www.google.com/maps/dir/?api=1&origin=${centro}&destination=${centro}&waypoints=${encodeURIComponent(marcadores)}&travelmode=driving`
  }

  // ✅ Abre o mapa em nova aba
  function abrirMapaCompleto() {
    window.open(montarLinkMapa(), '_blank')
  }

  // ✅ Calcula distância aproximada em km
  function calcularDistancia(lat1, lng1, lat2, lng2) {
    if (!lat1 || !lng1 || !lat2 || !lng2) return '? km'
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2)**2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const km = (R * c).toFixed(1)
    return `${km} km`
  }

  // ✅ Lista serviços
  function listarServicos(c) {
    const s = []
    if (c.servicos?.passear) s.push('🚶 Passeio')
    if (c.servicos?.cuidarEmCasa) s.push('🏠 Em Casa')
    if (c.servicos?.medicacaoTratamento) s.push('💊 Tratamento')
    return s.join(' • ')
  }

  return (
    <div style={{padding: '15px', maxWidth: '480px', margin: '0 auto'}}>
      <h2 style={{textAlign: 'center', color: '#1f2937', marginBottom: '15px'}}>🐾 Cuidadores Próximos</h2>

      {/* ✅ BOTÃO PARA ABRIR O MAPA COMPLETO */}
      <button
        onClick={abrirMapaCompleto}
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        🗺️ ABRIR MAPA COM CUIDADORES
      </button>

      <p style={{textAlign: 'center', fontSize: '13px', color: '#6b7280', marginBottom: '15px'}}>
        Clique acima para ver todos no mapa do Google 🔵
      </p>

      {/* ✅ LISTA com distância */}
      {cuidadores.length > 0 ? (
        <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px'}}>
          <h3 style={{fontSize: '15px', color: '#374151', margin: '0 0 10px 0'}}>📍 Cuidadores Disponíveis</h3>
          
          {cuidadores.map((c, i) => (
            <div key={c.id} style={{
              padding: '14px',
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              border: '1px solid #bbf7d0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <strong style={{color: '#166534', fontSize: '16px'}}>🐾 {c.nome}</strong>
                <span style={{fontSize: '13px', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: '12px', color: '#1e40af'}}>
                  📍 {calcularDistancia(minhaLocalizacao.lat, minhaLocalizacao.lng, c.lat, c.lng)}
                </span>
              </div>
              
              <p style={{margin: '6px 0', fontSize: '15px', fontWeight: 'bold', color: '#15803d'}}>
                💰 R$ {c.valorHora?.toFixed(2).replace('.', ',') || '0,00'}/hora
              </p>
              
              <p style={{margin: '4px 0', fontSize: '13px', color: '#4b5563'}}>
                {listarServicos(c) || 'Serviços não informados'}
              </p>
              
              {c.observacoes && (
                <p style={{margin: '6px 0 0 0', fontSize: '12px', color: '#6b7280', fontStyle: 'italic'}}>
                  📝 {c.observacoes}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{textAlign: 'center', padding: '30px 15px', color: '#6b7280'}}>
          <p style={{fontSize: '36px', margin: '0'}}>📍</p>
          <p style={{marginTop: '10px'}}>Nenhum cuidador disponível no momento</p>
          <p style={{fontSize: '13px'}}>Peça para algum cuidador fazer login e ativar a localização!</p>
        </div>
      )}

      {/* ✅ BOTÃO DE BUSCA / NOTIFICAÇÃO */}
      {!chamadaEnviada ? (
        <button
          onClick={fazerBusca}
          disabled={buscando}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: buscando ? '#9ca3af' : '#22c55e',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: buscando ? 'not-allowed' : 'pointer',
            marginTop: '10px'
          }}
        >
          {buscando ? '🔄 Enviando...' : '🔔 NOTIFICAR CUIDADORES'}
        </button>
      ) : (
        <div style={{padding: '20px', backgroundColor: '#dbeafe', borderRadius: '12px', textAlign: 'center', marginTop: '10px'}}>
          <h3 style={{color: '#1d4ed8', margin: '0'}}>✅ Notificação Enviada!</h3>
          <p style={{color: '#1e40af', marginTop: '8px'}}>🔔 Cuidadores foram avisados!</p>
          <button
            onClick={() => setChamadaEnviada(false)}
            style={{marginTop: '12px', padding: '10px 18px', backgroundColor: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer'}}
          >
            🔄 Nova Busca
          </button>
        </div>
      )}
    </div>
  )
}