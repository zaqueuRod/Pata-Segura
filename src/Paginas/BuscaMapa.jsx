import { useState, useEffect } from 'react'

export default function BuscaMapa() {
  const [buscando, setBuscando] = useState(false)
  const [solicitacoesPendentes, setSolicitacoesPendentes] = useState([])
  const [cuidadoresAceitos, setCuidadoresAceitos] = useState([])
  const [minhaPosicao, setMinhaPosicao] = useState({ lat: -26.916, lng: -48.645 }) // Padrão: Itajaí

  // 📍 Cuidadores próximos
  const dadosCuidadores = [
    { id: 1, nome: 'Mariana Silva', dLat: 0.002, dLng: -0.003, distancia: '500m', nota: '4,9 ⭐', preco: 'R$ 25,00' },
    { id: 2, nome: 'João Santos', dLat: -0.003, dLng: +0.004, distancia: '800m', nota: '4,7 ⭐', preco: 'R$ 30,00' },
    { id: 3, nome: 'Ana Carolina', dLat: +0.004, dLng: +0.002, distancia: '1,2km', nota: '5,0 ⭐', preco: 'R$ 28,00' },
    { id: 4, nome: 'Pedro Oliveira', dLat: -0.004, dLng: -0.005, distancia: '1,5km', nota: '4,8 ⭐', preco: 'R$ 35,00' },
  ]

  // ✅ Busca localização REAL do dono
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (posicao) => {
          setMinhaPosicao({
            lat: posicao.coords.latitude,
            lng: posicao.coords.longitude
          })
        },
        (erro) => {
          console.log('⚠️ Usando Itajaí como padrão')
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      )
    }
  }, [])

  // ✅ Dono inicia a BUSCA → notifica cuidadores em tempo real
  function procurar() {
    setSolicitacoesPendentes([])
    setCuidadoresAceitos([])
    setBuscando(true)

    let indice = 0
    const timer = setInterval(() => {
      if (indice >= dadosCuidadores.length) {
        clearInterval(timer)
        setBuscando(false)
        return
      }

      const cuidador = dadosCuidadores[indice]
      const posicaoReal = {
        ...cuidador,
        lat: minhaPosicao.lat + cuidador.dLat,
        lng: minhaPosicao.lng + cuidador.dLng,
        status: 'pendente' // ⏳ Aguardando aceite
      }

      // 📤 ENVIA NOTIFICAÇÃO PARA O CUIDADOR
      setSolicitacoesPendentes(anterior => [...anterior, posicaoReal])
      console.log(`🔔 ${cuidador.nome} recebeu um NOVO PEDIDO! Aguardando aceite...`)

      // ⏱️ SIMULA o cuidador ACEITANDO em 3 a 6 segundos
      setTimeout(() => {
        aceitarChamado(cuidador.id)
      }, 3000 + Math.random() * 3000)

      indice = indice + 1
    }, 1500)
  }

  // ✅ CUIDADOR ACEITA → só AÍ os dados aparecem para o DONO
  function aceitarChamado(idCuidador) {
    const cuidador = solicitacoesPendentes.find(c => c.id === idCuidador) 
                   || dadosCuidadores.find(c => c.id === idCuidador)
    
    if (!cuidador) return

    const cuidadorCompleto = {
      ...cuidador,
      lat: minhaPosicao.lat + cuidador.dLat,
      lng: minhaPosicao.lng + cuidador.dLng,
      status: 'aceito'
    }

    // ✅ Move de "Pendente" → "Aceito" (aparece para o dono)
    setCuidadoresAceitos(anterior => [...anterior, cuidadorCompleto])
    setSolicitacoesPendentes(anterior => anterior.filter(c => c.id !== idCuidador))

    console.log(`✅ ${cuidador.nome} ACEITOU o pedido! Agora aparece para o Dono.`)
  }

  // 📏 500 metros de cada lado → Área TOTAL = 1km × 1km
  const METROS_500 = 0.5 / 111

  // Limites do mapa = 500m em todas as direções
  const lngOeste = minhaPosicao.lng - METROS_500
  const lngLeste = minhaPosicao.lng + METROS_500
  const latNorte = minhaPosicao.lat + METROS_500
  const latSul = minhaPosicao.lat - METROS_500

  // Converte coordenada para porcentagem dentro do mapa
  function coordParaPorcentagem(lat, lng) {
    const x = ((lng - lngOeste) / (lngLeste - lngOeste)) * 100
    const y = ((latNorte - lat) / (latNorte - latSul)) * 100
    return {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y))
    }
  }

  return (
    <div style={{backgroundColor: '#f0f4f8', minHeight: '100vh', margin: 0, padding: 0}}>
      
      {/* 🗺️ MAPA — só MOSTRA quem ACEITOU */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '380px',
        borderBottom: '4px solid #ccc',
        overflow: 'hidden',
        touchAction: 'none'
      }}>
        <iframe
          title="Mapa"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${lngOeste}%2C${latSul}%2C${lngLeste}%2C${latNorte}&layer=mapnik&marker=${minhaPosicao.lat}%2C${minhaPosicao.lng}`}
          style={{
            display: 'block',
            pointerEvents: 'none' // TRAVADO — não arrasta
          }}
        ></iframe>

        {/* 🟢 SÓ APARECEM QUEM ACEITOU! */}
        {cuidadoresAceitos.map((item) => {
          const pos = coordParaPorcentagem(item.lat, item.lng)
          return (
            <div key={item.id} style={{
              position: 'absolute',
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#fff',
              border: '4px solid #22c55e',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 3px 10px rgba(34,197,94,0.35)',
              zIndex: 5,
              pointerEvents: 'none'
            }} title={item.nome}>🐾</div>
          )
        })}

        {/* 🔍 Aviso de busca */}
        {buscando && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#2563eb',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '13px',
            zIndex: 20,
            pointerEvents: 'none'
          }}>🔍 Procurando... Aguardando aceite...</div>
        )}

        {/* ⏳ Contador de pendentes */}
        {solicitacoesPendentes.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '50px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#f59e0b',
            color: '#fff',
            padding: '6px 14px',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '12px',
            zIndex: 20,
            pointerEvents: 'none'
          }}>⏳ {solicitacoesPendentes.length} cuidador(es) recebendo chamada...</div>
        )}
      </div>

      {/* 🔘 Botão */}
      <div style={{padding: '20px', textAlign: 'center'}}>
        <button onClick={procurar} disabled={buscando} style={{
          backgroundColor: buscando ? '#94a3b8' : '#2563eb',
          color: '#fff',
          border: 'none',
          padding: '15px 35px',
          borderRadius: '30px',
          fontSize: '17px',
          fontWeight: 'bold',
          cursor: buscando ? 'not-allowed' : 'pointer',
          boxShadow: buscando ? 'none' : '0 4px 12px rgba(37,99,235,0.3)'
        }}>{buscando ? '🔍 Procurando...' : '🔍 Procurar Cuidadores'}</button>
      </div>

      {/* 📋 Lista — SÓ MOSTRA QUEM ACEITOU! */}
      <div style={{padding: '0 15px 30px 15px'}}>
        {cuidadoresAceitos.length > 0 && (
          <h3 style={{fontSize: '16px', color: '#16a34a', marginBottom: '15px'}}>
            ✅ {cuidadoresAceitos.length} cuidador(es) ACEITOU o pedido!
          </h3>
        )}

        {cuidadoresAceitos.map(item => (
          <div key={item.id} style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#fff',
            padding: '14px',
            borderRadius: '12px',
            marginBottom: '10px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
          }}>
            <span style={{fontSize: '30px'}}>🐾</span>
            <div style={{flex: 1, marginLeft: '12px'}}>
              <p style={{fontWeight: 'bold', margin: 0, fontSize: '15px'}}>{item.nome}</p>
              <p style={{margin: '4px 0', fontSize: '13px', color: '#6b7280'}}>📍 {item.distancia} • {item.nota}</p>
              <p style={{margin: 0, color: '#16a34a', fontWeight: 'bold', fontSize: '14px'}}>{item.preco} / passeio</p>
            </div>
            <button style={{
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '13px'
            }}>Contratar ✅</button>
          </div>
        ))}

        {/* ⏳ Ainda não aceitos */}
        {solicitacoesPendentes.length > 0 && (
          <div style={{marginTop: '20px'}}>
            <h4 style={{fontSize: '14px', color: '#f59e0b', marginBottom: '10px'}}>
              ⏳ Aguardando aceite: {solicitacoesPendentes.length} cuidador(es)...
            </h4>
            {solicitacoesPendentes.map(item => (
              <div key={item.id} style={{
                backgroundColor: '#fffbeb',
                padding: '10px 14px',
                borderRadius: '10px',
                marginBottom: '8px',
                fontSize: '14px',
                color: '#92400e'
              }}>⏳ {item.nome} — Aguardando resposta...</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}