import React, { useState, useRef, useEffect } from "react";

console.log("App carregado");

function App() {
  const [nomesData, setNomesData] = useState({});
  const [gender, setGender] = useState("");
  const [selectedNames, setSelectedNames] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState("");
  const wheelRef = useRef();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterInitial, setFilterInitial] = useState("");
  const [filterNat, setFilterNat] = useState("");
  const [weights, setWeights] = useState({}); 

  useEffect(() => {
    fetch(".data/nomes.json")
      .then(res => res.json())
      .then(data => {
        setNomesData(data);
        const inicial = {};
        data.nomes.masculinos.concat(data.nomes.femininos)
          .forEach(item => { inicial[item.nome] = 1; });
        setWeights(inicial);
      })
      .catch(err => console.error("Erro ao carregar nomes:", err));
  }, []);

  const handleSelectName = (name) => {
    if (selectedNames.includes(name)) {
      setSelectedNames(selectedNames.filter(n => n !== name));
    } else {
      if (selectedNames.length < 10) {
        setSelectedNames([...selectedNames, name]);
      } else {
        alert("Você pode selecionar no máximo 10 nomes.");
      }
    }
  };

  const handleSpin = () => {
    if (selectedNames.length === 0) {
      alert("Por favor, selecione pelo menos um nome.");
      return;
    }
    setSpinning(true);
    setWinner("");

    // sorteio ponderado
    const pool = [];
    selectedNames.forEach(name => {
      const w = weights[name] || 1;
      for (let i = 0; i < w; i++) pool.push(name);
    });
    const randomName = pool[Math.floor(Math.random() * pool.length)];
    const totalWeight = selectedNames.reduce((sum, n) => sum + (weights[n] || 1), 0);
    let cumulative = 0;
    let targetIdx = -1;
    for (let i = 0; i < selectedNames.length; i++) {
      const w = weights[selectedNames[i]] || 1;
      cumulative += w;
      if (randomName === selectedNames[i]) {
        targetIdx = i;
        break;
      }
    }
    const sliceAngle = 360 / totalWeight;
    const centerAngle = (cumulative - ((weights[randomName]||1)/2)) * sliceAngle;
    const spins = 5;
    const targetRotation = 360 * spins + (270 - centerAngle);

    setRotation(prev => prev + targetRotation);

    setTimeout(() => {
      setWinner(randomName);
      setSpinning(false);
    }, 5000);
  };

  const handleReset = () => {
    setSelectedNames([]);
    setWinner("");
    setRotation(0);
  };

  // filtros + ordenação
  const availableNames =
    nomesData.nomes?.[gender === "menino" ? "masculinos" : "femininos"]
      ?.filter(({ nome, nacionalidade }) => {
        if (searchTerm && !nome.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (filterInitial && nome[0].toUpperCase() !== filterInitial) return false;
        if (filterNat && nacionalidade !== filterNat) return false;
        return true;
      })
      .sort((a, b) => a.nome.localeCompare(b.nome)) || [];

  return (
    <div className="App">
      <h1 style={{ color: "#FF69B4" }}>👶 Roleta Baby</h1>
      <p style={{ color: "#6495ED" }}>Escolha um nome para seu bebê!</p>

      {!gender && (
        <div style={{ margin: "20px" }}>
          <button onClick={() => setGender("menino")} className="btn">Menino</button>
          <button onClick={() => setGender("menina")} className="btn">Menina</button>
        </div>
      )}

      {gender && (
        <div style={{ marginTop: "30px" }}>
          <h3 style={{ color: "#FF69B4" }}>Nomes para {gender}</h3>

          {/* filtros */}
          <div className="controls">
            <input type="text" placeholder="Buscar nome..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ padding: "6px 8px", borderRadius: "4px", border: "1px solid #ccc" }} />
            <select value={filterInitial} onChange={e => setFilterInitial(e.target.value)}
              style={{ padding: "6px 8px", borderRadius: "4px", border: "1px solid #ccc" }}>
              <option value="">Todas as iniciais</option>
              {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(L =>
                <option key={L} value={L}>{L}</option>
              )}
            </select>
            <select value={filterNat} onChange={e => setFilterNat(e.target.value)}
              style={{ padding: "6px 8px", borderRadius: "4px", border: "1px solid #ccc" }}>
              <option value="">Todas nacionalidades</option>
              {[...new Set((nomesData.nomes?.[gender==="menino"?"masculinos":"femininos"]||[])
                .map(n=>n.nacionalidade))].sort().map(nat=>
                <option key={nat} value={nat}>{nat}</option>
              )}
            </select>
            <button onClick={()=>{setSearchTerm("");setFilterInitial("");setFilterNat("");}}
              style={{ padding:"6px 12px",borderRadius:"4px",backgroundColor:"#eee",cursor:"pointer" }}>
              Limpar filtros
            </button>
          </div>

          {/* QUADRO COM SCROLL PARA LISTA DE NOMES */}
<div className="name-list-box">
  {availableNames.length > 0 ? (
    availableNames.map((item, idx) => (
      <label key={idx} className="name-item">
        <input
          type="checkbox"
          checked={selectedNames.includes(item.nome)}
          onChange={() => handleSelectName(item.nome)}
        />
        <span title={`${item.significado} (${item.nacionalidade})`}>
          {item.nome}
        </span>
        <button
          onClick={() =>
            setWeights(ws => ({
              ...ws,
              [item.nome]: ws[item.nome] === 1 ? 2 : 1
            }))
          }
          className="weight-btn"
        >
          {weights[item.nome] === 2 ? "×2" : "×1"}
        </button>
      </label>
    ))
  ) : (
    <p className="empty">Nenhum nome encontrado.</p>
  )}
</div>

          {/* lista com peso */}
          <div className="name-list-container">
            {availableNames.map((item,idx)=>(
              <label key={idx} className="name-item"
                     style={{ display:"flex",alignItems:"center",margin:"4px 0",textAlign:"left" }}>
                <input type="checkbox"
                  checked={selectedNames.includes(item.nome)}
                  onChange={()=>handleSelectName(item.nome)} />
                <span title={`${item.significado} (${item.nacionalidade})`}
                      style={{ margin:"0 8px",flex:"1" }}>
                  {item.nome}
                </span>
                <button onClick={()=>
                    setWeights(ws=>({
                      ...ws,
                      [item.nome]: ws[item.nome]===1?2:1
                    }))
                  }
                  style={{
                    padding:"2px 6px",fontSize:"12px",
                    background: weights[item.nome]===2?"#FF69B4":"#eee",
                    color: weights[item.nome]===2?"#fff":"#000",
                    border:"none",borderRadius:"4px",cursor:"pointer"
                  }}>
                  {weights[item.nome]===2?"×2":"×1"}
                </button>
              </label>
            ))}
            {availableNames.length===0 && <p>Nenhum nome encontrado.</p>}
          </div>

          {/* botão roleta */}
          <div style={{ margin:"20px" }}>
            <button onClick={handleSpin} className="btn" disabled={spinning}>🎡 Rodar Roleta</button>
          </div>

          {/* roleta SVG proporcional */}
          {selectedNames.length>0 && (
            <div className="wheel-container">
              <svg viewBox="0 0 200 200" className="wheel" ref={wheelRef}
                   style={{
                     transform:`rotate(${rotation}deg)`,
                     transition: spinning?"transform 5s ease-out":"none"
                   }}>
                {(() => {
                  const totalWeight = selectedNames.reduce((s,n)=>s+(weights[n]||1),0);
                  let cum = 0;
                  return selectedNames.map((name,i)=>{
                    const w = weights[name]||1;
                    const sliceAngle = (w/totalWeight)*360;
                    const start = cum;
                    const end = cum+sliceAngle;
                    cum += sliceAngle;
                    const largeArc = sliceAngle>180?1:0;
                    const x1=100+100*Math.cos(Math.PI*start/180);
                    const y1=100+100*Math.sin(Math.PI*start/180);
                    const x2=100+100*Math.cos(Math.PI*end/180);
                    const y2=100+100*Math.sin(Math.PI*end/180);
                    const fill = gender==="menino"?"#6495ED":"#FF69B4";
                    return (
                      <g key={i}>
                        <path d={`M100,100 L${x1},${y1} A100,100 0 ${largeArc},1 ${x2},${y2} Z`}
                          fill={fill} stroke="#fff" />
                        <text
                          x={100+65*Math.cos(Math.PI*(start+sliceAngle/2)/180)}
                          y={100+65*Math.sin(Math.PI*(start+sliceAngle/2)/180)}
                          textAnchor="middle" alignmentBaseline="middle"
                          transform={`rotate(${start+sliceAngle/2},${100+65*Math.cos(Math.PI*(start+sliceAngle/2)/180)},${100+65*Math.sin(Math.PI*(start+sliceAngle/2)/180)})`}
                          fill="#fff" fontSize="10" fontWeight="bold">
                          {name}
                        </text>
                      </g>
                    );
                  });
                })()}
              </svg>
              <div className="marker">▼</div>
            </div>
          )}

          {/* vencedor */}
          {winner && !spinning && (
            <div className="winner">
              🎉 Nome escolhido: <strong>{winner}</strong> 🎉
              <button onClick={handleReset} className="btn"
                      style={{ marginLeft:"20px" }}>🔁 Resetar</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
