import React from 'react';

export default function PixelArtVivero({ soilState, weatherState }) {
  // Configuración de texturas estilo Terraria (Bloques de tierra con detalles y bordes de pasto)
  const soilStyles = {
    seco: {
      base: 'bg-[#8d6e63]', // Tierra seca/arena
      texture: 'radial-gradient(#795548 15%, transparent 16%), radial-gradient(#795548 15%, transparent 16%)',
      border: 'border-[#5d4037]'
    },
    media: {
      base: 'bg-[#5d4037]', // Tierra normal
      texture: 'radial-gradient(#4e342e 15%, transparent 16%), radial-gradient(#4e342e 15%, transparent 16%)',
      border: 'border-[#3e2723]'
    },
    mojado: {
      base: 'bg-[#3e2723]', // Tierra oscura/barro
      texture: 'radial-gradient(#26140e 15%, transparent 16%), radial-gradient(#26140e 15%, transparent 16%)',
      border: 'border-[#1a0e0a]'
    }
  };

  const currentSoil = soilStyles[soilState] || soilStyles['media'];

  // Mapas de las dos parcelas (0: vacío, 1: Lechuga, 2: Calabaza, 3: Rábano)
  const plot1 = [
    [1, 0, 1, 1, 0],
    [1, 1, 0, 0, 3],
    [0, 3, 3, 0, 3],
    [3, 0, 0, 1, 0],
    [1, 1, 1, 0, 0],
  ];

  const plot2 = [
    [3, 0, 0, 2, 2],
    [0, 1, 0, 2, 2],
    [1, 0, 3, 3, 0],
    [0, 3, 0, 1, 1],
    [0, 0, 1, 0, 3],
  ];

  // Componente interno del cultivo con animaciones CSS (Wind sway)
  const Crop = ({ type, delay }) => {
    if (type === 0) return null;
    
    // Lechuga animada
    if (type === 1) return (
      <div className="relative w-8 h-8 m-auto" style={{ animation: `sway 3s ease-in-out infinite alternate ${delay}s` }}>
        <div className="absolute bottom-0 left-1 right-1 h-5 bg-[#4caf50] rounded-t-lg border-2 border-[#2e7d32] shadow-sm"></div>
        <div className="absolute bottom-1 left-0 right-0 h-4 bg-[#81c784] rounded-t-full opacity-80"></div>
        <div className="absolute top-2 left-2 w-2 h-2 bg-[#a5d6a7] rounded-full"></div>
      </div>
    );
    
    // Calabaza grande animada
    if (type === 2) return (
      <div className="relative w-10 h-10 m-auto -mt-2" style={{ animation: `pulse-breathe 4s ease-in-out infinite alternate ${delay}s` }}>
        <div className="absolute bottom-0 inset-x-0 h-8 bg-[#e65100] rounded-xl border-2 border-[#bf360c] shadow-md flex justify-center">
          <div className="w-2 h-3 bg-[#33691e] -mt-3 border border-[#1b5e20] rounded-t-sm"></div>
        </div>
        <div className="absolute bottom-1 left-2 w-1.5 h-6 bg-[#ff9800] rounded-full opacity-80"></div>
        <div className="absolute bottom-1 right-2 w-1.5 h-6 bg-[#ff9800] rounded-full opacity-80"></div>
        <div className="absolute bottom-1 left-4 w-1.5 h-6 bg-[#ffb74d] rounded-full opacity-50"></div>
      </div>
    );

    // Rábano animado (Bounce)
    if (type === 3) return (
      <div className="relative w-6 h-8 m-auto mt-2" style={{ animation: `bounce-slow 2s ease-in-out infinite alternate ${delay}s` }}>
        <div className="absolute bottom-0 inset-x-0 h-6 bg-[#c62828] rounded-b-full rounded-t-md border-2 border-[#b71c1c] shadow-sm"></div>
        <div className="absolute -top-1 left-1 w-2 h-4 bg-[#2e7d32] transform -rotate-12 rounded-t-full border border-[#1b5e20]"></div>
        <div className="absolute -top-1 right-1 w-2 h-4 bg-[#2e7d32] transform rotate-12 rounded-t-full border border-[#1b5e20]"></div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes sway {
          0% { transform: rotate(-8deg) skewX(2deg); }
          100% { transform: rotate(8deg) skewX(-2deg); }
        }
        @keyframes bounce-slow {
          0% { transform: translateY(0px) scaleY(1); }
          100% { transform: translateY(-3px) scaleY(1.05); }
        }
        @keyframes pulse-breathe {
          0% { transform: scale(1); }
          100% { transform: scale(1.04); }
        }
        @keyframes rain-fall {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(500%); opacity: 0; }
        }
        @keyframes sun-rotate {
          0% { transform: rotate(0deg) scale(1); opacity: 0.3; }
          50% { transform: rotate(180deg) scale(1.2); opacity: 0.5; }
          100% { transform: rotate(360deg) scale(1); opacity: 0.3; }
        }
      `}</style>

      <div className="w-full max-w-3xl mx-auto overflow-hidden rounded-xl border-[12px] border-[#3e2723] bg-[#7bc3a2] relative font-mono select-none shadow-2xl" style={{ imageRendering: 'pixelated' }}>
        
        {/* === SISTEMA DE CLIMA DINÁMICO (Lluvia, Nubes, Sol) === */}
        {weatherState === 'nublado' && (
          <div className="absolute inset-0 z-30 pointer-events-none bg-blue-900/40 mix-blend-multiply transition-colors duration-1000">
            {/* Lluvia animada */}
            {[...Array(20)].map((_, i) => (
              <div key={i} className="absolute top-0 w-[2px] h-8 bg-blue-300/60" 
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  animation: `rain-fall ${0.5 + Math.random()}s linear infinite ${Math.random()}s` 
                }}>
              </div>
            ))}
          </div>
        )}
        
        {weatherState === 'soleado' && (
          <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden transition-colors duration-1000">
             {/* Rayos de sol mágicos */}
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,150,0.4)_30deg,transparent_60deg,rgba(255,255,150,0.4)_90deg,transparent_120deg,rgba(255,255,150,0.4)_150deg,transparent_180deg,rgba(255,255,150,0.4)_210deg,transparent_240deg,rgba(255,255,150,0.4)_270deg,transparent_330deg)]"
              style={{ animation: 'sun-rotate 20s linear infinite' }}>
            </div>
          </div>
        )}

        {/* === GRID DE PISO (Piedra estilo Dungeon/Terraria) === */}
        <div className="p-6 grid grid-cols-12 gap-2 bg-[#607d8b] min-h-[450px]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #546e7a 25%, transparent 25%, transparent 75%, #546e7a 75%, #546e7a), repeating-linear-gradient(45deg, #546e7a 25%, #607d8b 25%, #607d8b 75%, #546e7a 75%, #546e7a)',
            backgroundSize: '32px 32px',
            backgroundPosition: '0 0, 16px 16px'
          }}>
          
          {/* Macetas superiores */}
          <div className="col-span-12 flex gap-6 mb-2 pl-4 z-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-24 h-12 bg-[#8d6e63] border-b-4 border-r-4 border-t-2 border-l-2 border-[#4e342e] flex items-end justify-center shadow-lg relative overflow-visible">
                <div className="absolute -top-4 w-12 h-12">
                   <Crop type={1} delay={i * 0.5} />
                </div>
              </div>
            ))}
          </div>

          {/* PARCELA IZQUIERDA (Bloque de tierra Terraria) */}
          <div className={`col-span-5 relative transition-all duration-1000 shadow-2xl p-3 grid grid-cols-5 gap-0 ${currentSoil.base} ${currentSoil.border} border-[6px] rounded-lg`}
            style={{ backgroundImage: currentSoil.texture, backgroundSize: '16px 16px' }}>
            
            {/* Césped superior del bloque (Terraria style) */}
            <div className="absolute -top-[10px] -left-[6px] -right-[6px] h-4 bg-[#4caf50] border-b-4 border-[#388e3c] rounded-t-sm z-10">
              {/* Dientes de pasto */}
              <div className="absolute bottom-[-4px] left-2 w-2 h-2 bg-[#388e3c]"></div>
              <div className="absolute bottom-[-4px] left-6 w-2 h-3 bg-[#388e3c]"></div>
              <div className="absolute bottom-[-4px] right-4 w-2 h-2 bg-[#388e3c]"></div>
            </div>

            {/* Renderizado de Cultivos con delay aleatorio para que se muevan natural */}
            {plot1.map((row, i) => 
              row.map((cell, j) => (
                <div key={`p1-${i}-${j}`} className="w-12 h-12 flex items-center justify-center relative z-20">
                  {/* Sombra debajo del cultivo */}
                  {cell !== 0 && <div className="absolute bottom-1 w-6 h-2 bg-black/30 rounded-full blur-[1px]"></div>}
                  <Crop type={cell} delay={(i+j) * 0.3} />
                </div>
              ))
            )}
          </div>

          {/* Pasillo central de piedra */}
          <div className="col-span-2"></div>

          {/* PARCELA DERECHA */}
          <div className={`col-span-5 relative transition-all duration-1000 shadow-2xl p-3 grid grid-cols-5 gap-0 ${currentSoil.base} ${currentSoil.border} border-[6px] rounded-lg`}
            style={{ backgroundImage: currentSoil.texture, backgroundSize: '16px 16px' }}>
            
            {/* Césped superior */}
            <div className="absolute -top-[10px] -left-[6px] -right-[6px] h-4 bg-[#4caf50] border-b-4 border-[#388e3c] rounded-t-sm z-10">
              <div className="absolute bottom-[-4px] left-3 w-2 h-3 bg-[#388e3c]"></div>
              <div className="absolute bottom-[-4px] right-2 w-2 h-2 bg-[#388e3c]"></div>
              <div className="absolute bottom-[-4px] right-8 w-2 h-3 bg-[#388e3c]"></div>
            </div>

            {plot2.map((row, i) => 
              row.map((cell, j) => (
                <div key={`p2-${i}-${j}`} className="w-12 h-12 flex items-center justify-center relative z-20">
                  {cell !== 0 && <div className="absolute bottom-1 w-6 h-2 bg-black/30 rounded-full blur-[1px]"></div>}
                  <Crop type={cell} delay={(i+j) * 0.4} />
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </>
  );
}
