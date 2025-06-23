import React, { useState, useRef, useEffect } from "react";
import nomesJson from "./data/nomes.json";
import "./App.css";

function NameItem({ item, selected, onToggle, weight, onWeightToggle }) {
  return (
    <label className="name-item">
      <input type="checkbox" checked={selected} onChange={onToggle} />
      <span title={`${item.significado} (${item.nacionalidade})`}>{item.nome}</span>
      <button onClick={onWeightToggle} className="weight-btn">
        {weight === 2 ? "×2" : "×1"}
      </button>
    </label>
  );
}

function App() {
  const [gender, setGender] = useState("");
  const [selectedNames, setSelectedNames] = useState([]);
  const [weights, setWeights] = useState(() => {
    const inicial = {};
    nomesJson.nomes.masculinos
      .concat(nomesJson.nomes.femininos)
      .forEach((item) => {
        inicial[item.nome] = 1;
      });
    return inicial;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterInitial, setFilterInitial] = useState("");
  const [filterNat, setFilterNat] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [noTransition, setNoTransition] = useState(false);
  const [winner, setWinner] = useState("");
  const [spinSpeed, setSpinSpeed] = useState(1);

  const spinSound1 = useRef(null);
  const spinSound2 = useRef(null);
  const spinSound3 = useRef(null);

  const allItems = nomesJson.nomes.masculinos.concat(nomesJson.nomes.femininos);
  const chosenItem = allItems.find((item) => item.nome === winner);
  const meaning = chosenItem ? chosenItem.significado : "";

  const allNames = gender
    ? nomesJson.nomes[gender === "menino" ? "masculinos" : "femininos"]
    : [];

  const availableNames = Array.from(
    new Map(allNames.map((item) => [item.nome, item])).values()
  )
    .filter(({ nome, nacionalidade }) => {
      if (searchTerm.trim() && !nome.toLowerCase().includes(searchTerm.trim().toLowerCase()))
        return false;
      if (filterInitial && nome[0].toUpperCase() !== filterInitial) return false;
      if (filterNat && nacionalidade !== filterNat) return false;
      return true;
    })
    .sort((a, b) => a.nome.localeCompare(b.nome));

  useEffect(() => {
    try {
      spinSound1.current = new Audio("spinning.mp3");
      spinSound1.current.loop = true;
      spinSound1.current.load();

      spinSound2.current = new Audio("spinning2.mp3");
      spinSound2.current.loop = true;
      spinSound2.current.load();

      spinSound3.current = new Audio("spinning3.mp3");
      spinSound3.current.loop = true;
      spinSound3.current.load();
    } catch (e) {
      console.error("Erro ao carregar sons de roleta:", e);
    }
  }, []);

  const handleSelectName = (name) => {
    setSelectedNames((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : prev.length < 10
        ? [...prev, name]
        : (alert("Você pode selecionar no máximo 10 nomes."), prev)
    );
  };

  const handleWeightToggle = (name) => {
    setWeights((ws) => ({
      ...ws,
      [name]: ws[name] === 1 ? 2 : 1,
    }));
  };

  const handleSpinAgain = () => {
    setWinner("");
    setRotation(0);
    setTimeout(handleSpin, 50);
  };

  const handleClosePopup = () => {
    setWinner("");
    setRotation(0);
    setSelectedNames([]);
  };

  const handleSpin = () => {
    if (selectedNames.length === 0) {
      alert("Por favor, selecione pelo menos um nome.");
      return;
    }

    [spinSound1, spinSound2, spinSound3].forEach((ref) => {
      if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
      }
    });

    const currentSoundRef =
      spinSpeed === 1
        ? spinSound1
        : spinSpeed === 2
        ? spinSound2
        : spinSound3;

    currentSoundRef.current.currentTime = 0;
    currentSoundRef.current.play();

    setSpinning(true);
    setWinner("");

    const pool = [];
    selectedNames.forEach((name) => {
      const w = weights[name] || 1;
      for (let i = 0; i < w; i++) pool.push(name);
    });

    const randomName = pool[Math.floor(Math.random() * pool.length)];
    const totalWeight = selectedNames.reduce((sum, n) => sum + (weights[n] || 1), 0);
    let cum = 0;
    let targetAngle = 0;

    selectedNames.forEach((n) => {
      cum += weights[n] || 1;
      if (n === randomName) {
        const sliceAngle = ((weights[n] || 1) / totalWeight) * 360;
        const centerAngle = (cum / totalWeight) * 360 - sliceAngle / 2;
        const spins = 5;
        targetAngle = 360 * spins + (270 - centerAngle);
      }
    });

    setNoTransition(true);
    setRotation(0);

    setTimeout(() => {
      setNoTransition(false);
      setRotation(targetAngle);
    }, 50);

    const duration = 5000 / spinSpeed;

    setTimeout(() => {
      setWinner(randomName);
      setSpinning(false);
      currentSoundRef.current.pause();
      currentSoundRef.current.currentTime = 0;
    }, duration);
  };

  const switchGender = () => {
    setSelectedNames([]);
    setFilterInitial("");
    setFilterNat("");
    setSearchTerm("");
    setRotation(0);
    setWinner("");
    setGender((prev) => (prev === "menino" ? "menina" : "menino"));
  };

  return (
    <div className={`App container ${gender === "menina" ? "female" : ""}`}>
      <img src="./logo_nomebebe.png" alt="Logo" className="logo" />
      <p className="subtitle">Escolha um nome de forma simples e divertida!</p>

      {!gender ? (
        <div className="gender-buttons">
          <button onClick={() => setGender("menino")} className="btn blue-btn">
            Menino
          </button>
          <button onClick={() => setGender("menina")} className="btn pink-btn">
            Menina
          </button>
        </div>
      ) : (
        <div className="main-content">
          <h3 className="section-title">Nomes para {gender}</h3>
          <p className="label-info">Escolha até 10 nomes e gire a roleta!</p>

<div className="controls">
  <input
    type="text"
    placeholder="Buscar nome..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="input-search"
  />
  <select value={filterInitial} onChange={(e) => setFilterInitial(e.target.value)} className="select-filter">
    <option value="">Todas iniciais</option>
    {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((L) => (
      <option key={L} value={L}>
        {L}
      </option>
    ))}
  </select>
  <select value={filterNat} onChange={(e) => setFilterNat(e.target.value)} className="select-filter">
    <option value="">Todas nacionalidades</option>
    {[...new Set(allNames.map((n) => n.nacionalidade))].sort().map((nat) => (
      <option key={nat} value={nat}>
        {nat}
      </option>
    ))}
  </select>
  <button
    onClick={() => {
      setSearchTerm("");
      setFilterInitial("");
      setFilterNat("");
    }}
    className="btn-clear"
    disabled={!searchTerm && !filterInitial && !filterNat}
  >
    Limpar
  </button>
</div>


          <div className="main-layout">
            <div className="side-panel">
              <div className="name-list-box">
                {availableNames.length > 0 ? (
                  availableNames.map((item) => (
                    <NameItem
                      key={item.nome}
                      item={item}
                      selected={selectedNames.includes(item.nome)}
                      onToggle={() => handleSelectName(item.nome)}
                      weight={weights[item.nome]}
                      onWeightToggle={() => handleWeightToggle(item.nome)}
                    />
                  ))
                ) : (
                  <p className="empty">Nenhum nome encontrado.</p>
                )}
              </div>
              <p className="tooltip-text">Mantenha o dedo ou o mouse em cima do nome para exibir o significado</p>
            
            <div className="switch-gender-container">
  <button
    onClick={switchGender}
    className={`btn ${gender === "menina" ? "blue-btn" : "pink-btn"}`}
  >
    Ir para nomes de {gender === "menina" ? "menino" : "menina"}
  </button>
</div>
</div>

            <div className="wheel-zone">
                <div className="speed-label">
                  <label htmlFor="speed">Velocidade:</label>
                </div>
              <div className="speed-buttons">
                <button
                  className={`btn small ${spinSpeed === 1 ? "active" : ""}`}
                  onClick={() => setSpinSpeed(1)}
                >
                  1×
                </button>
                <button
                  className={`btn small ${spinSpeed === 2 ? "active" : ""}`}
                  onClick={() => setSpinSpeed(2)}
                >
                  2×
                </button>
                <button
                  className={`btn small ${spinSpeed === 3 ? "active" : ""}`}
                  onClick={() => setSpinSpeed(3)}
                >
                  3×
                </button>
              </div>
              <button onClick={handleSpin} className="btn" disabled={spinning}>
                🎡 Rodar Roleta
              </button>

              {selectedNames.length > 1 && (
                <div className="wheel-container fade-in">
                  <svg
                    viewBox="0 0 200 200"
                    className={`wheel ${noTransition ? "no-transition" : ""}`}
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: noTransition
                        ? "none"
                        : `transform ${5000 / spinSpeed}ms cubic-bezier(0.33,1,0.68,1)`,
                    }}
                  >
                    {selectedNames.map((name, i) => {
                      const w = weights[name] || 1;
                      const total = selectedNames.reduce((s, n) => s + (weights[n] || 1), 0);
                      const slice = (w / total) * 360;
                      const start =
                        i === 0
                          ? 0
                          : selectedNames
                              .slice(0, i)
                              .reduce((acc, curr) => acc + (weights[curr] || 1), 0) /
                                total *
                                360;
                      const end = start + slice;
                      const largeArc = slice > 180 ? 1 : 0;
                      const x1 = 100 + 100 * Math.cos((Math.PI * start) / 180);
                      const y1 = 100 + 100 * Math.sin((Math.PI * start) / 180);
                      const x2 = 100 + 100 * Math.cos((Math.PI * end) / 180);
                      const y2 = 100 + 100 * Math.sin((Math.PI * end) / 180);
                      const fill = gender === "menino" ? "#6495ED" : "#FF69B4";
                      const midAngle = start + slice / 2;
                      return (
                        <g key={i}>
                          <path
                            d={`M100,100 L${x1},${y1} A100,100 0 ${largeArc},1 ${x2},${y2} Z`}
                            fill={fill}
                            stroke="#fff"
                            strokeWidth="2"
                          />
                          <text
                            x={100 + 65 * Math.cos((Math.PI * midAngle) / 180)}
                            y={100 + 65 * Math.sin((Math.PI * midAngle) / 180)}
                            transform={`rotate(${midAngle}, ${100 + 65 * Math.cos((Math.PI * midAngle) / 180)}, ${100 + 65 * Math.sin((Math.PI * midAngle) / 180)}) rotate(${-midAngle}, ${100 + 65 * Math.cos((Math.PI * midAngle) / 180)}, ${100 + 65 * Math.sin((Math.PI * midAngle) / 180)})`}
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            fill="#fff"
                            fontSize={name.length > 10 ? "8" : "10"}
                            fontWeight="bold"
                          >
                            {name}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                  <div className="marker">▼</div>
                </div>
              )}

              {spinning && <p className="spinning-msg">🎡 Girando...</p>}

              {winner && (
                <div className="winner-popup">
                  <div className="popup-content">
                    <h2>
                      🎉 O nome sugerido foi: <strong>{winner}</strong>
                    </h2>
                    {meaning && <p className="popup-meaning">Significado: {meaning}</p>}
                    <div className="popup-actions">
                      <button className="btn" onClick={handleSpinAgain}>
                        Rodar novamente
                      </button>
                      <button className="btn small" onClick={handleClosePopup}>
                        Fechar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
