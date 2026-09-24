import { useState } from 'react';
import { Layers3, Minus, Plus, RotateCcw, Sprout } from 'lucide-react';
import PlantIllustration from './PlantIllustration';

const specimens = [
  { name: 'Tomate cherry', species: 'Solanum lycopersicum', type: 'tomate' },
  { name: 'Girasol', species: 'Helianthus annuus', type: 'girasol' },
  { name: 'Albahaca', species: 'Ocimum basilicum', type: 'albahaca' },
];

export default function PixelArtVivero({ soilState = 'media', weatherState = 'soleado', growth = 80, watering = false, compact = false }) {
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [labels, setLabels] = useState(true);
  return <div className={`greenhouse-scene ${compact ? 'scene-compact' : ''} weather-${weatherState} soil-${soilState} ${watering ? 'is-watering' : ''}`}>
    <div className="scene-grid"/>
    <div className="scene-topline"><span><span className="status-dot"/> INVERNADERO VIRTUAL</span><span>VISTA ILUSTRADA</span></div>
    <div className="greenhouse-stage" style={{ '--scene-zoom': zoom }}>
      <div className="greenhouse-frame"><div className="roof-beam"/><div className="frame-line line-one"/><div className="frame-line line-two"/><div className="frame-line line-three"/></div>
      <div className="greenhouse-floor"/>
      <div className="plant-beds">
        {specimens.map((plant, i) => <button type="button" key={plant.name} className={`plant-bed bed-${i} ${selected === i ? 'is-selected' : ''}`} onClick={() => setSelected(i)} aria-label={`Examinar ${plant.name}`} aria-pressed={selected === i}>
          <div className="bed-soil"/>
          <div className="bed-plants"><PlantIllustration type={plant.type} growth={growth}/><PlantIllustration type={plant.type} growth={Math.max(0, growth-12)}/></div>
          {labels && <span className="bed-label"><span className="status-dot"/>{plant.name}<span>0{i+1}</span></span>}
        </button>)}
      </div>
      {watering && <div className="watering-drops" aria-hidden="true">{Array.from({length:24}, (_,i) => <i key={i} style={{left:`${12+i*3.2}%`,animationDelay:`${(i%7)*.13}s`}}/>)}</div>}
    </div>
    {!compact && <><div className="scene-inspector"><Sprout size={17}/><div><strong>{specimens[selected].name}</strong><span>{specimens[selected].species} · Ilustración</span></div></div><div className="scene-tools"><button onClick={() => setLabels(!labels)} aria-label="Mostrar etiquetas" aria-pressed={labels}><Layers3 size={17}/></button><button onClick={() => setZoom(Math.max(.8, zoom-.1))} disabled={zoom<=.8} aria-label="Alejar"><Minus size={17}/></button><button onClick={() => setZoom(Math.min(1.3, zoom+.1))} disabled={zoom>=1.3} aria-label="Acercar"><Plus size={17}/></button><button onClick={() => setZoom(1)} aria-label="Restablecer vista"><RotateCcw size={16}/></button></div></>}
    <div className="scene-caption">{watering ? 'Riego en curso' : weatherState === 'soleado' ? 'Luz de día' : weatherState === 'nublado' ? 'Cielo nublado' : 'Clima sin registrar'}<span>Escena conceptual · 3 especies</span></div>
  </div>;
}
