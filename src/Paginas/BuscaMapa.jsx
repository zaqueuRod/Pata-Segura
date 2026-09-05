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
      () => console.log('Usando localização padrão')
    )
  }, [])

  // ✅ Carrega CUIDADORES em TEMPO REAL ⚡
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

  // ✅ Dono envia chamada
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
          alert('✅ Chamada enviada!\n\n🔔 Cuidadores foram notificados!')
          setChamadaEnviada(true)
          setBuscando(false)
          setTimeout(() => setChamadaEnviada(false), 300000)
        },
        () => {
          alert('⚠️ Ative a localização!')
          setBuscando(false)
        }
      )
    } catch (erro) {
      alert('❌ Erro: ' + erro.message)
      setBuscando(false)
    }
  }

  // ✅ Calcula distância em km
  function calcularDistancia(lat1, lng1, lat2, lng2) {
    if (!lat1 || !lng1 || !lat2 || !lng2) return '? km'
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2)**2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return `${(R * c).toFixed(1)} km`
  }

  // ✅ Lista serviços
  function listarServicos(c) {
    const s = []
    if (c.servicos?.passear) s.push('🚶 Passeio')
    if (c.servicos?.cuidarEmCasa) s.push('🏠 Casa')
    if (c.servicos?.medicacaoTratamento) s.push('💊 Tratamento')
    return s.join(' • ')
  }

  // ✅ Constrói URL do mapa com todos os marcadores
  function montarUrlMapa() {
    const centro = `${minhaLocalizacao.lat},${minhaLocalizacao.lng}`
    let marcadores = `color:blue|label:Você|${centro}`
    
    cuidadores.forEach((c, i) => {
      marcadores += `&markers=color:red|label:${i+1}|${c.lat},${c.lng}`
    })

    return `https://maps.google.com/maps?q=${encodeURIComponent(marcadores)}&z=13&output=embed`
  }

  return (
    <div style={{height: '100vh', display: 'flex', flexDirection: 'column', margin: 0, padding: 0}}>
      
      {/* ✅ MAPA SEMPRE VISÍVEL EM CIMA 🗺️ */}
      <div style={{flex: 1, position: 'relative'}}>
        <iframe
          src={montarUrlMapa()}
          width="100%"
          height="100%"
          style={{border: 0}}
          title="Mapa de Cuidadores"
          loading="lazy"
          allowFullScreen
        ></iframe>

        {/* ✅ LEGENDA FLUTUANDO EM CIMA DO MAPA */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'rgba(255,255,255,0.92)',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '13px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
        }}>
          <div style={{fontWeight: 'bold', marginBottom: '4px'}}>📍 Legenda</div>
          <div>🔵 Você</div>
          <div>🔴 Cuidador Online</div>
        </div>
      </div>

      {/* ✅ ÁREA DE INFORMAÇÕES E BOTÕES EM BAIXO */}
      <div style={{
        padding: '15px',
        backgroundColor: '#fff',
        borderTop: '1px solid #e5e7eb',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.05)'
      }}>
        
        {/* ✅ LISTA DE CUIDADORES */}
        {cuidadores.length > 0 ? (
          <div style={{maxHeight: '160px', overflowY: 'auto', marginBottom: '15px'}}>
            <h4 style={{margin: '0 0 10px 0', color: '#374151', fontSize: '14px'}}>🐾 Cuidadores Próximos</h4>
            {cuidadores.map((c, i) => (
              <div key={c.id} style={{
                padding: '10px',
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                marginBottom: '8px',
                border: '1px solid #fcd34d'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <strong style={{color: '#92400e'}}>{i+1}. {c.nome}</strong>
                  <span style={{fontSize: '12px', backgroundColor: '#fef9c3', padding: '2px 6px', borderRadius: '10px'}}>
                    📍 {calcularDistancia(minhaLocalizacao.lat, minhaLocalizacao.lng, c.lat, c.lng)}
                  </span>
                </div>
                <p style={{margin: '4px 0', fontSize: '13px', color: '#15803d'}}>
                  💰 R$ {c.valorHora?.toFixed(2).replace('.', ',') || '0,00'}/hora
                </p>
                <p style={{margin: '2px 0 0 0', fontSize: '12px', color: '#6b7280'}}>
                  {listarServicos(c)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{textAlign: 'center', padding: '10px', color: '#9ca3af', marginBottom: '15px'}}>
            📍 Nenhum cuidador disponível no momento
          </div>
        )}

        {/* ✅ BOTÃO PRINCIPAL */}
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
            {buscando ? '🔄 Enviando...' : '🔔 NOTIFICAR CUIDADORES PRÓXIMOS'}
          </button>
        ) : (
          <div style={{padding: '15px', backgroundColor: '#dbeafe', borderRadius: '12px', textAlign: 'center'}}>
            <h3 style={{color: '#1d4ed8', margin: '0 0 5px 0', fontSize: '15px'}}>✅ Chamada Enviada!</h3>
            <p style={{color: '#1e40af', fontSize: '13px', margin: '0 0 10px 0'}}>Aguarde algum cuidador aceitar...</p>
            <button
              onClick={() => setChamadaEnviada(false)}
              style={{padding: '8px 16px', backgroundColor: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'}}
            >
              🔄 Nova Chamada
            </button>
          </div>
        )}
      </div>
    </div>
  )
}