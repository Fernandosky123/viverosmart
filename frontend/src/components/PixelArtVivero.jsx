import React from 'react';

export default function PixelArtVivero({ soilState, weatherState }) {
  
  // Texturas de Suelo Realistas (Dirt / Mud / Dry)
  const soilStyles = {
    seco: {
      background: 'url("https://www.transparenttextures.com/patterns/cubes.png"), linear-gradient(to bottom, #d7ccc8, #a1887f)',
      boxShadow: 'inset 0 0 50px rgba(93, 64, 55, 0.5)',
      filter: 'brightness(1.1) contrast(0.9)',
      grassColor: '#81c784'
    },
    media: {
      background: 'url("https://www.transparenttextures.com/patterns/dirt.png"), linear-gradient(to bottom, #5d4037, #3e2723)',
      boxShadow: 'inset 0 0 60px rgba(0,0,0,0.6)',
      filter: 'brightness(1) contrast(1)',
      grassColor: '#4caf50'
    },
    mojado: {
      background: 'url("https://www.transparenttextures.com/patterns/dark-dirt.png"), linear-gradient(to bottom, #3e2723, #1a0e0a)',
      boxShadow: 'inset 0 0 80px rgba(0,0,0,0.9)',
      filter: 'brightness(0.8) contrast(1.2)',
      grassColor: '#2e7d32'
    }
  };

  const currentSoil = soilStyles[soilState] || soilStyles['media'];

  // Mapas de parcelas (Reducidos a 3x3 para plantas gigantes)
  const plot1 = [
    [1, 0, 1],
    [0, 1, 0],
    [1, 0, 1],
  ];

  const plot2 = [
    [0, 2, 0],
    [2, 0, 2],
    [0, 2, 0],
  ];

  // Renderizador de plantas ultra-realistas (SVG Complejos)
  const RealisticPlant = ({ type, delay }) => {
    if (type === 0) return null;
    
    // Girasol (Tipo 2)
    if (type === 2) return (
      <div className="relative w-full h-full m-auto drop-shadow-2xl scale-[2.5] sm:scale-[3.0]" style={{ animation: `breeze 4s ease-in-out infinite alternate ${delay}s`, transformOrigin: 'bottom center' }}>
        <svg viewBox="0 0 100 150" className="w-full h-full overflow-visible">
          {/* Sombra */}
          <ellipse cx="50" cy="145" rx="25" ry="8" fill="rgba(0,0,0,0.5)" filter="blur(3px)"/>
          {/* Tallo */}
          <path d="M50 145 Q45 90 50 40" stroke="#4CAF50" strokeWidth="6" fill="none" strokeLinecap="round" />
          {/* Hojas */}
          <path d="M50 110 Q70 100 80 120 Q60 130 50 110" fill="#81C784" />
          <path d="M48 80 Q25 70 20 90 Q40 100 48 80" fill="#81C784" />
          
          {/* Cabeza del Girasol (Vista Top-Down ligeramente inclinada) */}
          <circle cx="50" cy="40" r="28" fill="#FFD54F" />
          {/* Petalos (Girasol) */}
          <path d="M50 0 L56 18 L44 18 Z" fill="#FFC107" />
          <path d="M50 80 L56 62 L44 62 Z" fill="#FFC107" />
          <path d="M10 40 L28 34 L28 46 Z" fill="#FFC107" />
          <path d="M90 40 L72 34 L72 46 Z" fill="#FFC107" />
          <path d="M22 12 L36 24 L28 29 Z" fill="#FFC107" />
          <path d="M78 12 L64 24 L72 29 Z" fill="#FFC107" />
          <path d="M78 68 L64 56 L72 51 Z" fill="#FFC107" />
          <path d="M22 68 L36 56 L28 51 Z" fill="#FFC107" />
          {/* Centro (Semillas) */}
          <circle cx="50" cy="40" r="16" fill="#5D4037" stroke="#3E2723" strokeWidth="2" />
          <circle cx="50" cy="40" r="10" fill="#4E342E" stroke="#3E2723" strokeWidth="1" strokeDasharray="2,2" />
        </svg>
      </div>
    );

    // Tomate (Tipo 1)
    if (type === 1) return (
      <div className="relative w-full h-full m-auto drop-shadow-xl scale-[2.5] sm:scale-[3.0]" style={{ animation: `breeze 3s ease-in-out infinite alternate ${delay}s`, transformOrigin: 'bottom center' }}>
        <svg viewBox="0 0 100 150" className="w-full h-full overflow-visible">
          {/* Sombra */}
          <ellipse cx="50" cy="140" rx="20" ry="5" fill="rgba(0,0,0,0.4)" filter="blur(2px)"/>
          {/* Tallo */}
          <path d="M50 140 Q45 80 50 30" stroke="#388E3C" strokeWidth="4" fill="none" />
          {/* Hojas */}
          <path d="M50 100 Q75 90 85 110 Q65 120 50 100" fill="#4CAF50" />
          <path d="M50 70 Q25 60 15 80 Q35 90 50 70" fill="#4CAF50" />
          {/* Frutos (Tomates) */}
          <circle cx="70" cy="120" r="12" fill="#D32F2F" />
          <circle cx="73" cy="116" r="3" fill="white" opacity="0.4" />
          <path d="M70 108 L72 110 M68 110 L70 108" stroke="#1B5E20" strokeWidth="2" />

          <circle cx="30" cy="90" r="10" fill="#E53935" />
          <circle cx="32" cy="87" r="2.5" fill="white" opacity="0.4" />
          <path d="M30 80 L32 82 M28 82 L30 80" stroke="#1B5E20" strokeWidth="2" />
        </svg>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes breeze {
          0% { transform: rotate(-3deg) skewX(1deg); }
          100% { transform: rotate(3deg) skewX(-1deg); }
        }
        @keyframes breathe {
          0% { transform: scale(1) translateY(0); }
          100% { transform: scale(1.02) translateY(-2px); }
        }
        @keyframes rain-fall-real {
          0% { transform: translateY(-100%) rotate(15deg); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(1000%) rotate(15deg); opacity: 0; }
        }
        @keyframes sun-rays {
          0% { transform: rotate(0deg) scale(1); opacity: 0.2; }
          50% { transform: rotate(180deg) scale(1.5); opacity: 0.4; }
          100% { transform: rotate(360deg) scale(1); opacity: 0.2; }
        }
      `}</style>

      {/* Contenedor Principal Realista (Totalmente Responsive) */}
      <div className="w-full max-w-2xl mx-auto overflow-hidden rounded-3xl border-8 sm:border-12 border-[#2c3e50] bg-[#95a5a6] relative shadow-2xl">
        
        {/* === SISTEMA DE CLIMA DINÁMICO === */}
        {weatherState === 'nublado' && (
          <div className="absolute inset-0 z-50 pointer-events-none bg-[#1a252f]/40 mix-blend-overlay transition-colors duration-1000 backdrop-blur-[1px]">
            {/* Lluvia realista */}
            {[...Array(20)].map((_, i) => (
              <div key={i} className="absolute top-0 w-[1px] h-12 bg-gradient-to-b from-transparent to-blue-300" 
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  animation: `rain-fall-real ${0.4 + Math.random() * 0.3}s linear infinite ${Math.random()}s` 
                }}>
              </div>
            ))}
          </div>
        )}
        
        {weatherState === 'soleado' && (
          <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden transition-colors duration-1000 mix-blend-screen">
            <div className="absolute inset-0 bg-orange-400/10"></div>
          </div>
        )}

        {/* === GRID DE PISO (Baldosas del invernadero) === */}
        <div className="p-4 sm:p-6 grid grid-cols-12 gap-2 sm:gap-4 bg-[#bdc3c7]"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #95a5a6 25%, transparent 25%, transparent 75%, #95a5a6 75%, #95a5a6),
              linear-gradient(45deg, #95a5a6 25%, #bdc3c7 25%, #bdc3c7 75%, #95a5a6 75%, #95a5a6)
            `,
            backgroundSize: '30px 30px',
            backgroundPosition: '0 0, 15px 15px',
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)'
          }}>

          {/* PARCELA IZQUIERDA (Tomates) */}
          <div className="col-span-5 relative transition-all duration-1000 p-2 sm:p-4 grid grid-cols-3 gap-2 sm:gap-4 rounded-lg sm:rounded-xl w-full"
            style={{ 
              background: currentSoil.background, 
              boxShadow: currentSoil.boxShadow + ', 0 10px 20px rgba(0,0,0,0.4)',
              filter: currentSoil.filter,
              border: '6px solid #5D4037',
              borderBottomWidth: '12px',
              borderRightWidth: '8px'
            }}>
            
            {/* Césped realista en los bordes */}
            <div className="absolute -top-2 -left-2 -right-2 h-2 z-10 opacity-90 blur-[1px]" style={{ backgroundColor: currentSoil.grassColor, borderRadius: '2px' }}></div>
            <div className="absolute -bottom-4 -left-2 -right-2 h-3 z-10 opacity-80 blur-[2px]" style={{ backgroundColor: currentSoil.grassColor, borderRadius: '2px' }}></div>

            {plot1.map((row, i) => 
              row.map((cell, j) => (
                <div key={`p1-${i}-${j}`} className="w-full aspect-[2/3] flex items-end justify-center relative z-20">
                  <RealisticPlant type={cell} delay={(i+j) * 0.3} />
                </div>
              ))
            )}
          </div>

          {/* Pasillo central */}
          <div className="col-span-2 flex justify-center py-2">
            {/* Rejilla de desagüe realista */}
            <div className="w-full max-w-[24px] h-full bg-[#34495e] border-x-2 border-[#2c3e50] opacity-50 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 10px, #1a252f 10px, #1a252f 16px)' }}></div>
          </div>

          {/* PARCELA DERECHA (Girasoles) */}
          <div className="col-span-5 relative transition-all duration-1000 p-2 sm:p-4 grid grid-cols-3 gap-2 sm:gap-4 rounded-lg sm:rounded-xl w-full"
            style={{ 
              background: currentSoil.background, 
              boxShadow: currentSoil.boxShadow + ', 0 10px 20px rgba(0,0,0,0.4)',
              filter: currentSoil.filter,
              border: '6px solid #5D4037',
              borderBottomWidth: '12px',
              borderRightWidth: '8px'
            }}>
            
            {/* Césped */}
            <div className="absolute -top-2 -left-2 -right-2 h-2 z-10 opacity-90 blur-[1px]" style={{ backgroundColor: currentSoil.grassColor, borderRadius: '2px' }}></div>
            <div className="absolute -bottom-4 -left-2 -right-2 h-3 z-10 opacity-80 blur-[2px]" style={{ backgroundColor: currentSoil.grassColor, borderRadius: '2px' }}></div>

            {plot2.map((row, i) => 
              row.map((cell, j) => (
                <div key={`p2-${i}-${j}`} className="w-full aspect-[2/3] flex items-end justify-center relative z-20">
                  <RealisticPlant type={cell} delay={(i+j) * 0.4} />
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </>
  );
}
