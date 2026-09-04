import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { ref, push, set, serverTimestamp, onValue } from 'firebase/database'

export default function BuscaMapa() {
  const [dadosUsuario, setDadosUsuario] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [chamadaEnviada, setChamadaEnviada] = useState(false)
  const [cuidadores, setCuidadores] = useState([])
  const [minhaLocalizacao, setMinhaLocalizacao] = useState({ lat: -26.9, lng: -48.67 }) // Itajaí-SC padrão

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

  // ✅ Carrega CUIDADORES com localização em TEMPO REAL ⚡
  useEffect(() => {
    const usuariosRef = ref(db, 'usuarios')
    const pararEscutar = onValue(usuariosRef, (snapshot) => {
      if (snapshot.exists()) {
        const lista = []
        snapshot.forEach((filho) => {
          const usuario = { id: filho.key, ...filho.val() }
          // ✅ Só mostra Cuidadores que TEM localização salva! 📍
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

  // ✅ Monta URL do Google Maps com marcadores dos Cuidadores 📍
  function montarUrlMapa() {
    let base = `https://www.google.com/maps/embed/v1/view?key=AIzaSyB5rPnQZ8G9lKqVWB9L0Y0KxY5dXz-7Xz0&center=${minhaLocalizacao.lat},${minhaLocalizacao.lng}&zoom=13&language=pt-BR`
    
    // ✅ Adiciona marcador do DONO
    base += `&markers=color:blue|label:Você|${minhaLocalizacao.lat},${minhaLocalizacao.lng}`
    
    // ✅ Adiciona marcadores dos CUIDADORES 📍
    cuidadores.forEach((c, i) => {
      base += `&markers=color:red|label:${i + 1}|${c.lat},${c.lng}`
    })

    return base
  }

  // ✅ Lista serviços
  function listarServicos(c) {
    const s = []
    if (c.servicos?.passear) s.push('🚶 Passeio')
    if (c.servicos?.cuidarEmCasa) s.push('🏠 Casa')
    if (c.servicos?.medicacaoTratamento) s.push('💊 Tratamento')
    return s.join(' • ')
  }

  return (
    <div style={{padding: '15px', maxWidth: '480px', margin: '0 auto'}}>
      <h2 style={{textAlign: 'center', color: '#1f2937', marginBottom: '15px'}}>🗺️ Cuidadores Próximos</h2>

      {/* ✅ MAPA com os CUIDADORES 📍 */}
      <div style={{borderRadius: '12px', overflow: 'hidden', border: '2px solid #e5e7eb', marginBottom: '20px'}}>
        <iframe
          title="Mapa de Cuidadores"
          src={montarUrlMapa()}
          width="100%"
          height="280"
          style={{border: 0}}
          allowFullScreen
          loading="lazy"
        ></iframe>
      </div>

      {/* ✅ LEGENDA DO MAPA */}
      <div style={{display: 'flex', gap: '15px', marginBottom: '15px', fontSize: '13px'}}>
        <span>🔵 Você</span>
        <span>🔴 Cuidador disponível</span>
      </div>

      {/* ✅ LISTA DETALHADA dos Cuidadores */}
      {cuidadores.length > 0 ? (
        <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px'}}>
          <h3 style={{fontSize: '15px', color: '#374151', margin: '0 0 8px 0'}}>🐾 Cuidadores Disponíveis</h3>
          {cuidadores.map((c, i) => (
            <div key={c.id} style={{
              padding: '12px',
              backgroundColor: '#fef3c7',
              borderRadius: '10px',
              border: '1px solid #fcd34d'
            }}>
              <strong style={{color: '#92400e'}}>{i + 1}. {c.nome}</strong>
              <p style={{margin: '4px 0', fontSize: '14px', color: '#15803d'}}>💰 R$ {c.valorHora?.toFixed(2).replace('.', ',') || '0,00'}/hora</p>
              <p style={{margin: '4px 0', fontSize: '13px', color: '#4b5563'}}>{listarServicos(c)}</p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{textAlign: 'center', color: '#9ca3af', padding: '15px'}}>
          📍 Nenhum cuidador disponível no momento...<br/>
          Peça para algum cuidador fazer login!
        </p>
      )}

      {/* ✅ BOTÃO DE BUSCA */}
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
            cursor: buscando ? 'not-allowed' : 'pointer'
          }}
        >
          {buscando ? '🔄 Enviando...' : '🐾 NOTIFICAR CUIDADORES'}
        </button>
      ) : (
        <div style={{padding: '20px', backgroundColor: '#dbeafe', borderRadius: '12px', textAlign: 'center'}}>
          <h3 style={{color: '#1d4ed8', margin: '0'}}>✅ Notificação Enviada!</h3>
          <p style={{color: '#1e40af', marginTop: '8px'}}>🔔 Cuidadores próximos foram avisados!</p>
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