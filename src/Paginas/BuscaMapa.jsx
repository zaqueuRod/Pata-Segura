import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { ref, push, set, serverTimestamp, onValue } from 'firebase/database'

export default function BuscaMapa() {
  const [dadosUsuario, setDadosUsuario] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [chamadaEnviada, setChamadaEnviada] = useState(false)
  const [cuidadores, setCuidadores] = useState([])
  const [minhaLocalizacao, setMinhaLocalizacao] = useState({ lat: -26.9134, lng: -48.6631 })

  // ✅ Carrega dados do Dono logado
  useEffect(() => {
    const salvo = localStorage.getItem('usuarioLogado')
    if (salvo) setDadosUsuario(JSON.parse(salvo))
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
    return onValue(usuariosRef, (snapshot) => {
      if (snapshot.exists()) {
        const lista = []
        snapshot.forEach((filho) => {
          const usuario = { id: filho.key, ...filho.val() }
          if (usuario.tipo === 'cuidador' && usuario.lat && usuario.lng) {
            lista.push(usuario)
          }
        })
        setCuidadores(lista)
      } else {
        setCuidadores([])
      }
    })
  }, [])

  // ✅ Dono envia chamada
  async function fazerBusca() {
    if (!dadosUsuario) { alert('⚠️ Faça login primeiro!'); return }
    setBuscando(true)
    try {
      navigator.geolocation.getCurrentPosition(async (posicao) => {
        const lat = posicao.coords.latitude
        const lng = posicao.coords.longitude
        const chamadasRef = ref(db, 'chamadas')
        const novaChamada = push(chamadasRef)
        await set(novaChamada, {
          idChamada: novaChamada.key,
          nomeDono: dadosUsuario.nome,
          emailDono: dadosUsuario.email,
          lat, lng,
          status: 'aberto',
          cuidadorAceitou: null,
          hora: serverTimestamp()
        })
        alert('✅ Chamada enviada!\n\n🔔 Cuidadores foram notificados!')
        setChamadaEnviada(true)
        setBuscando(false)
        setTimeout(() => setChamadaEnviada(false), 300000)
      })
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

  return (
    <div style={{height: '100vh', display: 'flex', flexDirection: 'column', margin: 0, padding: 0, overflow: 'hidden'}}>
      
      {/* ✅ MAPA — SEMPRE VISÍVEL, SEM BLOQUEIO! 🗺️ */}
      <div style={{flex: 1, position: 'relative'}}>
        <iframe
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${minhaLocalizacao.lng - 0.035}%2C${minhaLocalizacao.lat - 0.025}%2C${minhaLocalizacao.lng + 0.035}%2C${minhaLocalizacao.lat + 0.025}&layer=mapnik`}
          width="100%"
          height="100%"
          style={{border: 'none'}}
          title="Mapa"
          loading="lazy"
        ></iframe>

        {/* ✅ CAIXA FLUTUANTE COM OS CUIDADORES EM CIMA DO MAPA 📍 */}
        {cuidadores.length > 0 ? (
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            right: '15px',
            backgroundColor: 'rgba(255,255,255,0.96)',
            padding: '14px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            <h4 style={{margin: '0 0 10px 0', color: '#166534', fontSize: '14px'}}>🐾 Cuidadores Próximos</h4>
            {cuidadores.map((c, i) => (
              <div key={c.id} style={{
                padding: '8px 10px',
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
                marginBottom: '6px'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px'}}>
                  <strong>{i+1}. {c.nome}</strong>
                  <span style={{color: '#2563eb', fontWeight: 'bold'}}>📍 {calcularDistancia(minhaLocalizacao.lat, minhaLocalizacao.lng, c.lat, c.lng)}</span>
                </div>
                <div style={{fontSize: '12px', color: '#15803d', marginTop: '3px'}}>
                  💰 R$ {c.valorHora?.toFixed(2).replace('.', ',') || '0,00'}/hora
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(255,255,255,0.96)',
            padding: '12px 20px',
            borderRadius: '10px',
            fontSize: '14px',
            color: '#6b7280',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}>
            📍 Nenhum cuidador disponível no momento
          </div>
        )}

        {/* ✅ BOTÃO DE NOTIFICAR EMBAIXO */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px'
        }}>
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
                boxShadow: '0 4px 16px rgba(34,197,94,0.4)'
              }}
            >
              {buscando ? '🔄 Enviando...' : '🔔 NOTIFICAR CUIDADORES PRÓXIMOS'}
            </button>
          ) : (
            <div style={{padding: '16px', backgroundColor: 'rgba(219,234,254,0.95)', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
              <h3 style={{color: '#1d4ed8', margin: '0 0 6px 0', fontSize: '15px'}}>✅ Chamada Enviada!</h3>
              <p style={{color: '#1e40af', fontSize: '13px', margin: '0 0 10px 0'}}>Aguarde algum cuidador aceitar...</p>
              <button
                onClick={() => setChamadaEnviada(false)}
                style={{padding: '8px 18px', backgroundColor: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold'}}
              >
                🔄 Nova Chamada
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}