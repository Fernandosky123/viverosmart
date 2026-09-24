import { useId } from 'react';

export default function PlantIllustration({ type = '', growth = 100, className = '' }) {
  const id = useId().replace(/:/g, '');
  const sunflower = /girasol|helianthus/i.test(type);
  const tomato = /tomat|solanum/i.test(type);
  const scale = 0.35 + Math.max(0, Math.min(100, growth)) / 155;
  return <svg viewBox="0 0 180 230" className={`plant-illustration ${className}`} aria-hidden="true">
    <defs><linearGradient id={`${id}leaf`} x2="1" y2="1"><stop stopColor="#c8e795"/><stop offset="1" stopColor="#3e815b"/></linearGradient><linearGradient id={`${id}pot`}><stop stopColor="#bb8265"/><stop offset="1" stopColor="#744c3c"/></linearGradient></defs>
    <ellipse cx="90" cy="215" rx="54" ry="9" fill="#10291e" opacity=".15"/>
    <g style={{ transform: `translate(90px, 178px) scale(${scale}) translate(-90px, -178px)` }}>
      <g className="plant-foliage"><path d="M90 185 Q80 105 92 38" fill="none" stroke="#477c43" strokeWidth="5"/>
        {[0,1,2].map(i => <g key={i} transform={`translate(0 ${i * -35})`}><path d="M88 153 C39 155 30 124 32 112 C65 105 86 128 88 153" fill={`url(#${id}leaf)`}/><path d="M89 130 C127 137 148 113 145 93 C115 91 93 105 89 130" fill={`url(#${id}leaf)`}/><path d="M88 153 L43 122 M89 130 L136 103" stroke="#e1efb0" strokeWidth="1" opacity=".5"/></g>)}
        {sunflower && <g transform="translate(92 37)">{Array.from({length:12}, (_, i) => <ellipse key={i} cy="-21" rx="8" ry="19" transform={`rotate(${i*30})`} fill={i%2 ? '#f4c451' : '#ffe290'}/>)}<circle r="18" fill="#644830"/><circle r="12" fill="#392f24" stroke="#a58548" strokeDasharray="2 4" strokeWidth="5"/></g>}
        {tomato && <g>{[[61,108,14],[118,137,17],[106,69,11]].map(([x,y,r]) => <g key={y}><path d={`M90 ${y-20} Q${x} ${y-22} ${x} ${y}`} fill="none" stroke="#537c42" strokeWidth="3"/><circle cx={x} cy={y} r={r} fill="#dc634b"/><ellipse cx={x-4} cy={y-5} rx="4" ry="3" fill="#ffa282"/><path d={`M${x-7} ${y-r+3} l7 -4 l7 4 l-7 -1Z`} fill="#3b7041"/></g>)}</g>}
      </g>
    </g>
    <path d="M61 179 L68 211 Q90 221 112 211 L120 179Z" fill={`url(#${id}pot)`}/><ellipse cx="90" cy="180" rx="30" ry="9" fill="#c18d6c"/><ellipse cx="90" cy="179" rx="24" ry="6" fill="#433c2a"/>
  </svg>;
}
