import { useState, useEffect, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════
const API_URL    = '/api/parking/map-data';
const REFRESH_MS = 15000;

// ═══════════════════════════════════════════════════════════════════════
// PALETA COMPARTIDA
// ═══════════════════════════════════════════════════════════════════════
// Paleta institucional CDMX — Guinda #691C32 · Dorado #C8A84B · Fondo #F4EFE9
const COLORS = {
    libre:     { fill: '#eaf3eb', stroke: '#2e7d32', strokeH: '#388e3c', text: '#1b5e20' },
    ocupado:   { fill: '#faeaee', stroke: '#691C32', strokeH: '#8B2442', text: '#691C32' },
    reservado: { fill: '#fdf8ec', stroke: '#C8A84B', strokeH: '#b8952a', text: '#6b4f00' },
};
const BADGE = {
    libre:     { bg:'#eaf3eb', color:'#1b5e20', border:'#2e7d32', label:'Libre' },
    ocupado:   { bg:'#faeaee', color:'#691C32', border:'#8B2442', label:'Ocupado' },
    reservado: { bg:'#fdf8ec', color:'#6b4f00', border:'#C8A84B', label:'Reservado' },
};

// ═══════════════════════════════════════════════════════════════════════
// TOOLTIP
// ═══════════════════════════════════════════════════════════════════════
function Tooltip({ visible, x, y, slotKey, info }) {
    if (!visible) return null;
    const estado = info?.estado ?? 'libre';
    const badge  = BADGE[estado] ?? BADGE.libre;
    return (
        <div style={{
            position:'fixed', left:x, top:y, zIndex:1000,
            background:'#fff', border:'2px solid #691C32',
            borderRadius:10, padding:'14px 18px', pointerEvents:'none',
            minWidth:210, boxShadow:'0 6px 24px rgba(105,28,50,0.15)',
            fontFamily:"'Syne',system-ui,sans-serif",
        }}>
            <div style={{fontFamily:'monospace',fontSize:11,color:'#9e7a83',textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>
                CAJÓN #{slotKey}
            </div>
            <div style={{fontSize:16,fontWeight:700,color:'#691C32',marginBottom:4}}>
                {estado==='libre' ? 'Disponible' : (info?.nombre||'—')}
            </div>
            {estado!=='libre' && (
                <div style={{fontFamily:'monospace',fontSize:13,color:'#C8A84B',letterSpacing:2,marginBottom:4}}>
                    {estado==='ocupado' ? (info?.placa||'—') : (info?.notas||'—')}
                </div>
            )}
            {estado==='ocupado' && info?.phone && (
                <div style={{fontSize:13,color:'#C8A84B',marginBottom:6}}>{info.phone}</div>
            )}
            <span style={{
                display:'inline-block',fontSize:11,fontWeight:700,padding:'3px 10px',
                borderRadius:20,textTransform:'uppercase',letterSpacing:1,marginTop:4,
                background:badge.bg,color:badge.color,border:`1px solid ${badge.border}`,
            }}>{badge.label}</span>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════
// ── MAPA PISO 1 ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════
const SW1=26, SH1=36, G1=1;
function row1(nums,sx,sy,w=SW1,h=SH1,sfx=''){
    return nums.map((n,i)=>({num:n,x:sx+i*(w+G1),y:sy,w,h,suffix:sfx,slotKey:sfx?`${n}${sfx}`:String(n)}));
}
const SLOTS_P1=[
    ...row1([1,2,3,4,5,6,7],80,12),
    ...row1([8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35],530,12),
    ...[64,65,66].map((n,i)=>({num:n,x:80,y:148+i*34,w:SW1,h:30,suffix:'',slotKey:String(n)})),
    ...row1([63,62,61,60,59],112,148,SW1,90),
    ...row1([58,57,56,55,54,53,52],904,148,SW1,90),
    ...row1([51,50,49,48,47,46,45,44,43,42,41,40,39,38,37,36],1112,148,SW1,90),
    ...row1([139,140,141,142,143,144,145,146,147,148],112,248,SW1,70,'B'),
    ...row1([67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92],430,248,SW1,70),
    ...row1([136,135,134,133,132,131,130,129,128],80,358,SW1,50,'B'),
    ...row1([127,126,125,124,123,122,121,120,119,118,117,116,115,114,113,112,111,110,109,108,107,106,105,104,103,102,101,100,99,98,97,96,95,94,93],330,358,SW1,50),
    {num:138,x:56,y:248,w:22,h:70,suffix:'B',slotKey:'138B'},
    {num:137,x:56,y:358,w:22,h:50,suffix:'B',slotKey:'137B'},
];

function SlotP1({slot,info,onEnter,onMove,onLeave}){
    const [hov,setHov]=useState(false);
    const estado=info?.estado??'libre';
    const c=COLORS[estado]??COLORS.libre;
    return (
        <g style={{cursor:'pointer'}}
            onMouseEnter={e=>{setHov(true);onEnter(e,slot.slotKey);}}
            onMouseMove={onMove} onMouseLeave={()=>{setHov(false);onLeave();}}>
            <rect x={slot.x} y={slot.y} width={slot.w} height={slot.h} rx={3}
                fill={c.fill} stroke={hov?c.strokeH:c.stroke} strokeWidth={hov?2:1.5}
                style={{filter:hov?'brightness(1.6)':'none',transition:'filter 0.15s'}}/>
            <text x={slot.x+slot.w/2} y={slot.y+slot.h/2-(slot.suffix?5:0)}
                fontSize={8} fill={c.text} textAnchor="middle" dominantBaseline="middle"
                fontFamily="monospace" style={{pointerEvents:'none',userSelect:'none'}}>{slot.num}</text>
            {slot.suffix&&<text x={slot.x+slot.w/2} y={slot.y+slot.h/2+8}
                fontSize={8} fill={c.text} textAnchor="middle"
                fontFamily="monospace" style={{pointerEvents:'none',userSelect:'none'}}>B</text>}
        </g>
    );
}

function MapaPiso1({data,onEnter,onMove,onLeave}){
    return (
        <div style={{background:'#fff',border:'2px solid #691C32',borderRadius:12,padding:20,overflowX:'auto',display:'flex',justifyContent:'center'}}>
            <svg viewBox="0 0 1560 430" xmlns="http://www.w3.org/2000/svg" style={{display:'block',minWidth:1400}}>
                <rect x="2" y="2" width="50" height="90" fill="#faeaee" stroke="#691C32" strokeWidth={1.5} rx={4}/>
                <text x="27" y="47" fontSize={9} fontWeight={700} fill="#691C32"
                    textAnchor="middle" dominantBaseline="middle" transform="rotate(-90,27,47)"
                    style={{letterSpacing:2,fontFamily:'Syne,sans-serif'}}>ENTRADA</text>
                <text x="380" y="120" fontSize={10} fill="#9e7a83" textAnchor="middle"
                    fontFamily="monospace" style={{letterSpacing:2}}>PASILLO CENTRAL</text>
                <rect x="55" y="2" width="1498" height="420" fill="none" stroke="#691C32" strokeWidth={1} rx={4}/>
                <line x1="55" y1="230" x2="1553" y2="230" stroke="#ddd0d4" strokeWidth={1} strokeDasharray="4,4"/>
                <line x1="55" y1="340" x2="1553" y2="340" stroke="#ddd0d4" strokeWidth={1} strokeDasharray="4,4"/>
                {SLOTS_P1.map(slot=>(
                    <SlotP1 key={`p1-${slot.slotKey}`} slot={slot} info={data[slot.slotKey]}
                        onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                ))}
            </svg>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════
// ── MAPA PISO 2 ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════
const SW2=28, SH2=22, G2=1;
function row2(nums,sx,sy){
    return nums.map((n,i)=>({num:n,x:sx+i*(SW2+G2),y:sy,slotKey:String(n)}));
}
const ox=60, rowH2=SH2+G2;

// Sección 1 (esquina superior derecha): 335–346
// 346 y 345 están posicionados 30px a la izquierda del bloque (S1_EXTRA)
// por eso NO se incluyen en S1_TOP/S1_BOT para evitar keys duplicadas
const S1_TOP=[344,342,340,338,336];   // sin 346
const S1_BOT=[343,341,339,337,335];   // sin 345
const s1x=ox+370, s1y=80;
// Cajones 346/345 separados a la izquierda del bloque
const S1_EXTRA=[
    {num:346,x:s1x-30,y:s1y,       slotKey:'346'},
    {num:345,x:s1x-30,y:s1y+rowH2, slotKey:'345'},
];

// Sección 2: 309–334
const S2_TOP=[309,311,313,315,317,319,321,323,325,327,329,331,333];
const S2_BOT=[310,312,314,316,318,320,322,324,326,328,330,332,334];
const s2x=ox, s2y=195;

// Sección 3: 283–308
const S3_TOP=[308,306,304,302,300,298,296,294,292,290,288,286,284];
const S3_BOT=[307,305,303,301,299,297,295,293,291,289,287,285,283];
const s3x=ox, s3y=310;

// Sección 4: 251–282
const S4_TOP=[252,254,256,262,264,266,268,270,272,274,276,278,280,282];
const S4_BOT=[251,253,255,261,263,265,267,269,271,273,275,277,279,281];
const s4x=ox, s4y=420;

const SLOTS_P2=[
    ...S1_EXTRA,
    ...row2(S1_TOP,s1x,s1y),
    ...row2(S1_BOT,s1x,s1y+rowH2),
    ...row2(S2_TOP,s2x,s2y),
    ...row2(S2_BOT,s2x,s2y+rowH2),
    ...row2(S3_TOP,s3x,s3y),
    ...row2(S3_BOT,s3x,s3y+rowH2),
    ...row2(S4_TOP,s4x,s4y),
    ...row2(S4_BOT,s4x,s4y+rowH2),
];

function SlotP2({slot,info,onEnter,onMove,onLeave}){
    const [hov,setHov]=useState(false);
    const estado=info?.estado??'libre';
    const c=COLORS[estado]??COLORS.libre;
    return (
        <g style={{cursor:'pointer'}}
            onMouseEnter={e=>{setHov(true);onEnter(e,slot.slotKey);}}
            onMouseMove={onMove} onMouseLeave={()=>{setHov(false);onLeave();}}>
            <rect x={slot.x} y={slot.y} width={SW2} height={SH2} rx={2}
                fill={c.fill} stroke={hov?c.strokeH:c.stroke} strokeWidth={hov?2:1}
                style={{filter:hov?'brightness(1.6)':'none',transition:'fill 0.15s'}}/>
            <text x={slot.x+SW2/2} y={slot.y+SH2/2+4}
                textAnchor="middle" fontSize={8} fill={c.text}
                fontFamily="'Courier New',monospace" fontWeight="600"
                style={{pointerEvents:'none',userSelect:'none'}}>{slot.num}</text>
        </g>
    );
}

function MapaPiso2({data,onEnter,onMove,onLeave}){
    const svgW=700, svgH=510;
    return (
        <div style={{background:'#fff',border:'2px solid #691C32',borderRadius:12,padding:20,
                     boxShadow:'0 4px 20px rgba(105,28,50,0.08)',overflowX:'auto',display:'flex',justifyContent:'center'}}>
            <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
                <defs>
                    <marker id="arrow2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L6,3 z" fill="#C8A84B"/>
                    </marker>
                </defs>

                {/* ENTRADA */}
                <text x={18} y={svgH/2} fontSize={9} fill="#9e7a83" fontFamily="monospace"
                    textAnchor="middle" transform={`rotate(-90,18,${svgH/2})`} letterSpacing={2}>ENTRADA</text>
                <line x1={30} y1={svgH/2} x2={45} y2={svgH/2} stroke="#C8A84B" strokeWidth={1.5} markerEnd="url(#arrow2)"/>

                {/* MOTOS */}
                <rect x={ox+140} y={10} width={100} height={55} rx={4}
                    fill="#f9f2f4" stroke="#c5a0aa" strokeWidth={1} strokeDasharray="3,2"/>
                <text x={ox+190} y={43} textAnchor="middle" fontSize={11}
                    fill="#691C32" fontFamily="monospace" letterSpacing={1}>MOTOS</text>

                {/* Bloque edificio */}
                <rect x={ox+270} y={10} width={90} height={40} rx={4}
                    fill="#f9f2f4" stroke="#c5a0aa" strokeWidth={1}/>

                {/* Divisores */}
                <line x1={ox} y1={185} x2={ox+svgW-120} y2={185} stroke="#ddd0d4" strokeWidth={0.5} strokeDasharray="4,4"/>
                <line x1={ox} y1={300} x2={ox+svgW-120} y2={300} stroke="#ddd0d4" strokeWidth={0.5} strokeDasharray="4,4"/>
                <line x1={ox} y1={410} x2={ox+svgW-120} y2={410} stroke="#ddd0d4" strokeWidth={0.5} strokeDasharray="4,4"/>

                {/* Labels pasillo */}
                {[{x:ox-20,y:s2y+SH2*1.5,t:'A'},{x:ox-20,y:s3y+SH2*1.5,t:'B'},{x:ox-20,y:s4y+SH2*1.5,t:'C'}].map(l=>(
                    <text key={l.t} x={l.x} y={l.y} fontSize={9} fill="#691C32"
                        fontFamily="monospace" textAnchor="middle" letterSpacing={1}>{l.t}</text>
                ))}

                {/* Cajones */}
                {SLOTS_P2.map(slot=>(
                    <SlotP2 key={`p2-${slot.slotKey}`} slot={slot} info={data[slot.slotKey]}
                        onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                ))}
            </svg>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════
// HOOK: carga de datos por piso
// ═══════════════════════════════════════════════════════════════════════
function useFloorData(piso) {
    const [data,   setData]   = useState({});
    const [stats,  setStats]  = useState({libres:0,ocupados:0,reservados:0});
    const [sync,   setSync]   = useState('idle');
    const [time,   setTime]   = useState('');

    const fetch_ = useCallback(async()=>{
        setSync('loading');
        try {
            const res  = await fetch(`${API_URL}?piso=${piso}`,{
                headers:{'Accept':'application/json','X-Requested-With':'XMLHttpRequest'},
            });
            if(!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            setData(json);
            const vals = Object.values(json);
            setStats({
                libres:    vals.filter(v=>v.estado==='libre').length,
                ocupados:  vals.filter(v=>v.estado==='ocupado').length,
                reservados:vals.filter(v=>v.estado==='reservado').length,
            });
            setSync('ok');
            setTime(new Date().toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit',second:'2-digit'}));
        } catch(e){
            console.error(e);
            setSync('error');
        }
    },[piso]);

    // Limpiar datos al cambiar de piso y hacer fetch inmediato
    useEffect(()=>{
        setData({});
        setStats({libres:0,ocupados:0,reservados:0});
        setSync('idle');
        fetch_();
        const id=setInterval(fetch_,REFRESH_MS);
        return ()=>clearInterval(id);
    },[fetch_]);

    return {data,stats,sync,time,refetch:fetch_};
}

// ═══════════════════════════════════════════════════════════════════════
// ── MAPA PISO 3 — Parque de la Juventud ───────────────────────────────
// ═══════════════════════════════════════════════════════════════════════
const SW3=30, SH3=40;

// Cajones piso 3 con posiciones exactas del plano
const SLOTS_P3 = [
    // Columna izquierda vertical: 4,3,2,1 (de arriba a abajo)
    {num:4,  x:75, y:175,              slotKey:'4'},
    {num:3,  x:75, y:175+(SW3+1),      slotKey:'3'},
    {num:2,  x:75, y:175+(SW3+1)*2,    slotKey:'2'},
    {num:1,  x:75, y:175+(SW3+1)*3,    slotKey:'1'},
    // Fila superior izquierda: 5,6
    {num:5,  x:130,             y:100, slotKey:'5'},
    {num:6,  x:130+(SW3+1),     y:100, slotKey:'6'},
    // Fila superior derecha: 7,8,9,10
    {num:7,  x:345,             y:100, slotKey:'7'},
    {num:8,  x:345+(SW3+1),     y:100, slotKey:'8'},
    {num:9,  x:345+(SW3+1)*2,   y:100, slotKey:'9'},
    {num:10, x:345+(SW3+1)*3,   y:100, slotKey:'10'},
];

function SlotP3({slot, info, onEnter, onMove, onLeave}) {
    const [hov, setHov] = useState(false);
    const estado = info?.estado ?? 'libre';
    const c = COLORS[estado] ?? COLORS.libre;
    return (
        <g style={{cursor:'pointer'}}
            onMouseEnter={e=>{setHov(true); onEnter(e, slot.slotKey);}}
            onMouseMove={onMove}
            onMouseLeave={()=>{setHov(false); onLeave();}}>
            <rect x={slot.x} y={slot.y} width={SW3} height={SH3} rx={2}
                fill={c.fill} stroke={hov ? c.strokeH : c.stroke}
                strokeWidth={hov ? 2 : 1}
                style={{filter:hov?'brightness(1.6)':'none', transition:'fill 0.15s'}}/>
            <text x={slot.x+SW3/2} y={slot.y+SH3/2+4}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={9} fill={c.text}
                fontFamily="'Courier New',monospace" fontWeight="700"
                style={{pointerEvents:'none', userSelect:'none'}}>
                {slot.num}
            </text>
        </g>
    );
}

function Building3({x,y,w,h,label,sublabel,fontSize=9}){
    return (
        <g>
            <rect x={x} y={y} width={w} height={h} rx={3}
                fill="#f9f2f4" stroke="#c5a0aa" strokeWidth={1}/>
            <text x={x+w/2} y={y+h/2-(sublabel?7:0)}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={fontSize} fill="#9e7a83"
                fontFamily="'Courier New',monospace" letterSpacing={0.5}>{label}</text>
            {sublabel && sublabel.map((l,i)=>(
                <text key={i} x={x+w/2}
                    y={y+h/2+(i-sublabel.length/2+1)*11+3}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={fontSize-1} fill="#9e7a83"
                    fontFamily="'Courier New',monospace">{l}</text>
            ))}
        </g>
    );
}

function MapaPiso3({data, onEnter, onMove, onLeave}) {
    const W=720, H=380, pad=20;
    return (
        <div style={{background:'#fff', border:'2px solid #691C32', borderRadius:14,
                     padding:16, boxShadow:'0 4px 20px rgba(105,28,50,0.08)', overflowX:'auto', display:'flex', justifyContent:'center'}}>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
                <defs>
                    <marker id="arr3" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L6,3 z" fill="#C8A84B"/>
                    </marker>
                </defs>

                {/* Borde exterior */}
                <rect x={pad} y={pad} width={W-pad*2} height={H-pad*2-30}
                    rx={4} fill="none" stroke="#ddd0d4" strokeWidth={1.5}/>

                {/* Banner inferior */}
                <rect x={pad} y={H-pad-30} width={W-pad*2} height={28}
                    rx={3} fill="#f9f2f4" stroke="#c5a0aa" strokeWidth={1}/>
                <text x={W/2} y={H-pad-16} textAnchor="middle" dominantBaseline="middle"
                    fontSize={10} fill="#691C32" fontFamily="'Courier New',monospace"
                    letterSpacing={3} fill="#691C32">PARQUE DE LA JUVENTUD</text>

                {/* Edificios / áreas */}
                <Building3 x={220} y={30}  w={110} h={55} label="KIOSKO"/>
                <Building3 x={460} y={30}  w={120} h={55} label="ENTRADA" sublabel={["POR CALLE 4"]}/>
                <Building3 x={pad+2} y={70} w={100} h={55} label="OFICINAS" sublabel={["MEDIO","AMBIENTE"]} fontSize={8}/>
                {/* FORO DEL OLIVAR — bloque vertical derecho */}
                <rect x={W-pad-42} y={110} width={40} height={H-pad*2-30-110+10}
                    rx={3} fill="#f9f2f4" stroke="#c5a0aa" strokeWidth={1}/>
                <text x={W-pad-22} y={110+(H-pad*2-30-110+10)/2}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={9} fill="#9e7a83" fontFamily="'Courier New',monospace"
                    letterSpacing={1}
                    transform={`rotate(-90,${W-pad-22},${110+(H-pad*2-30-110+10)/2})`}>
                    FORO DEL OLIVAR
                </text>

                <Building3 x={pad+2} y={175} w={65} h={22} label="OFICINA" fontSize={8}/>
                <Building3 x={pad+2} y={200} w={65} h={70} label="DIRECCIÓN"
                    sublabel={["DE MEDIO","AMBIENTE"]} fontSize={7}/>

                {/* Línea de pasillo bajo slots 5-10 */}
                <line x1={125} y1={145} x2={460} y2={145}
                    stroke="#ddd0d4" strokeWidth={0.5} strokeDasharray="4,4"/>

                {/* Flecha entrada Calle 4 */}
                <line x1={520} y1={90} x2={520} y2={145}
                    stroke="#C8A84B" strokeWidth={1.2} strokeDasharray="3,2"
                    markerEnd="url(#arr3)"/>

                {/* Cajones */}
                {SLOTS_P3.map(slot=>(
                    <SlotP3 key={`p3-${slot.slotKey}`} slot={slot}
                        info={data[slot.slotKey]}
                        onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                ))}
            </svg>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════
// ── MAPA PISO 4 — Prolongación Calle 4 / Canario ─────────────────────
// ═══════════════════════════════════════════════════════════════════════
const SW4=28, SH4=22;

// ── Helpers de posición (misma lógica del plano original) ────────────
const W4=780, H4=430, pad4=16;
const streetY4 = H4 - pad4 - 28;
const botRowY4 = streetY4 - SH4 - 6;
const topRowY4 = 100;
const topRowYLow4 = topRowY4 + 30;
const lx4 = pad4 + 38;
const rightEdge4 = W4 - pad4 - 4;
const plusX4 = 390, plusW4 = 20;

// Cajones 1 y 2 (columna derecha)
const s1x4 = rightEdge4 - SW4;
const s1yTop4 = topRowY4 + 20;
const s1yBot4 = s1yTop4 + SH4 + 2;

// Fila inferior: calcular x de cada cajón de derecha a izquierda
const bot4 = {};
let cur4 = rightEdge4;
[3,4,5,6,7,8,9].forEach(n => { cur4 -= SW4; bot4[n]=cur4; cur4 -= 1; });
const oficinaBotW4=48, oficinaBotX4=cur4-oficinaBotW4; cur4=oficinaBotX4;
[10,11,12,13,14,15,16].forEach(n => { cur4 -= SW4; bot4[n]=cur4; cur4 -= 1; });
const jardinW4=32, jardinX4=cur4-jardinW4; cur4=jardinX4;
[17,18,19,20,21].forEach(n => { cur4 -= SW4; bot4[n]=cur4; cur4 -= 1; });
const casetaW4=36, casetaX4=cur4-casetaW4;

// Fila superior: cajones 22-31 alrededor del + central
const top4 = {};
let tcur4 = plusX4;
[22,23,24,25,26,27].forEach(n => { tcur4 -= SW4; top4[n]=tcur4; tcur4 -= 1; });
tcur4 = plusX4 + plusW4;
[28,29,30,31].forEach(n => { top4[n]=tcur4; tcur4 += SW4+1; });

// Cajones 32 y 37 (standalone, marcados con x)
const s32x4=470, s32y4=topRowY4-50;
const s37x4=560, s37y4=topRowY4-50;

// Cajones 33-36 encima de OFICINA superior
const oficTopX4=380, oficTopY4=topRowY4-70;

function SlotP4({slot, info, onEnter, onMove, onLeave}) {
    const [hov,setHov] = useState(false);
    const estado = info?.estado ?? 'libre';
    const c = COLORS[estado] ?? COLORS.libre;
    const w = slot.w ?? SW4;
    const h = slot.h ?? SH4;
    return (
        <g style={{cursor:'pointer'}}
            onMouseEnter={e=>{setHov(true); onEnter(e, String(slot.num));}}
            onMouseMove={onMove}
            onMouseLeave={()=>{setHov(false); onLeave();}}>
            <rect x={slot.x} y={slot.y} width={w} height={h} rx={2}
                fill={c.fill} stroke={hov?c.strokeH:c.stroke}
                strokeWidth={hov?2:1}
                style={{filter:hov?'brightness(1.6)':'none',transition:'fill 0.15s'}}/>
            <text x={slot.x+w/2} y={slot.y+h/2}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={8} fill={c.text}
                fontFamily="'Courier New',monospace" fontWeight="700"
                style={{pointerEvents:'none',userSelect:'none'}}>
                {slot.num}
            </text>
        </g>
    );
}

function Box4({x,y,w,h,lines=[],fontSize=8,dashed=false}) {
    return (
        <g>
            <rect x={x} y={y} width={w} height={h} rx={3}
                fill="#F9F2F4" stroke="#c5a0aa" strokeWidth={1}
                strokeDasharray={dashed?'4,3':undefined}/>
            {lines.map((l,i)=>(
                <text key={i} x={x+w/2}
                    y={y+h/2+(i-(lines.length-1)/2)*(fontSize+3)}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={fontSize} fill="#9e7a83"
                    fontFamily="'Courier New',monospace" letterSpacing={0.3}>{l}</text>
            ))}
        </g>
    );
}

// Lista de todos los cajones del piso 4 para el render
const SLOTS_P4 = [
    // Columna derecha: 1 y 2
    {num:1,  x:s1x4, y:s1yTop4},
    {num:2,  x:s1x4, y:s1yBot4},
    // Fila inferior: 3-21
    ...[3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21].map(n=>({num:n, x:bot4[n], y:botRowY4})),
    // Fila superior — todos al mismo nivel que 27: 22-26
    ...[22,23,24,25,26].map(n=>({num:n, x:top4[n], y:topRowYLow4})),
    // Fila superior bajada: 27-31
    ...[27,28,29,30,31].map(n=>({num:n, x:top4[n], y:topRowYLow4})),
    // Standalone con altura extra: 32, 37
    {num:32, x:s32x4, y:s32y4, h:SH4+10},
    {num:37, x:s37x4, y:s37y4, h:SH4+10},
    // Sobre OFICINA superior: 33-36
    ...[33,34,35,36].map((n,i)=>({num:n, x:oficTopX4+i*(SW4+1), y:oficTopY4-SH4-4})),
];

function MapaPiso4({data, onEnter, onMove, onLeave}) {
    return (
        <div style={{background:'#fff',border:'2px solid #691C32',borderRadius:14,
                     padding:16,boxShadow:'0 4px 20px rgba(105,28,50,0.08)',overflowX:'auto',display:'flex',justifyContent:'center'}}>
            <svg width={W4} height={H4} viewBox={`0 0 ${W4} ${H4}`}>
                <defs>
                    <marker id="arr4" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L6,3 z" fill="#C8A84B"/>
                    </marker>
                </defs>

                {/* Borde exterior */}
                <rect x={pad4+36} y={pad4} width={W4-pad4-40} height={streetY4-pad4}
                    fill="none" stroke="#ddd0d4" strokeWidth={1.5} rx={3}/>

                {/* CANARIO — etiqueta vertical izquierda */}
                <rect x={pad4} y={pad4} width={36} height={streetY4-pad4}
                    rx={3} fill="#F9F2F4" stroke="#c5a0aa" strokeWidth={1.5}/>
                <text x={pad4+18} y={pad4+(streetY4-pad4)/2}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={11} fill="#9e7a83" fontFamily="'Courier New',monospace"
                    letterSpacing={2} transform={`rotate(-90,${pad4+18},${pad4+(streetY4-pad4)/2})`}>
                    CANARIO
                </text>

                {/* PROLONGACIÓN CALLE 4 — banner inferior */}
                <rect x={pad4+36} y={streetY4} width={W4-pad4-40} height={28}
                    rx={3} fill="#f9f2f4" stroke="#c5a0aa" strokeWidth={1}/>
                <text x={(W4+pad4+36)/2} y={streetY4+14}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={10} fill="#691C32" fontFamily="'Courier New',monospace"
                    letterSpacing={3}>PROLONGACIÓN CALLE 4</text>

                {/* Edificios */}
                <Box4 x={lx4+2}    y={80}  w={160} h={80} lines={["PROTECCIÓN","CIVIL"]}   fontSize={9}/>
                <Box4 x={lx4+164}  y={95}  w={80}  h={65} lines={["SUBES-","TACIÓN"]}      fontSize={8}/>
                <Box4 x={oficTopX4} y={oficTopY4} w={90} h={50} lines={["OFICINA"]}         fontSize={9}/>

                {/* FORO DEL OLIVAR — bloque vertical derecho */}
                <rect x={W4-pad4-42} y={110} width={40} height={streetY4-pad4-110+10}
                    rx={3} fill="#f9f2f4" stroke="#c5a0aa" strokeWidth={1}/>
                <text x={W4-pad4-22} y={110+(streetY4-pad4-110+10)/2}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={9} fill="#9e7a83" fontFamily="'Courier New',monospace"
                    letterSpacing={1}
                    transform={`rotate(-90,${W4-pad4-22},${110+(streetY4-pad4-110+10)/2})`}>
                    FORO DEL OLIVAR
                </text>

                {/* + columna central */}
                <rect x={plusX4} y={topRowYLow4} width={plusW4} height={SH4}
                    fill="#F9F2F4" stroke="#c5a0aa" strokeWidth={1} rx={1}/>
                <text x={plusX4+plusW4/2} y={topRowYLow4+SH4/2}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={10} fill="#691C32" fontFamily="'Courier New',monospace">+</text>

                {/* Marcadores x sobre 32 y 37 */}
                <text x={s32x4+SW4/2} y={s32y4-7} textAnchor="middle" fontSize={8}
                    fill="#9e7a83" fontFamily="'Courier New',monospace">x</text>
                <text x={s37x4+SW4/2} y={s37y4-7} textAnchor="middle" fontSize={8}
                    fill="#9e7a83" fontFamily="'Courier New',monospace">x</text>

                {/* Entrada */}
                <text x={lx4+6} y={botRowY4-12} fontSize={8} fill="#9e7a83"
                    fontFamily="'Courier New',monospace" letterSpacing={1}
                    transform={`rotate(-90,${lx4+6},${botRowY4-12})`}>Entrada</text>
                <line x1={lx4+18} y1={botRowY4-4} x2={lx4+50} y2={botRowY4-4}
                    stroke="#C8A84B" strokeWidth={1.2} strokeDasharray="3,2"
                    markerEnd="url(#arr4)"/>

                {/* Cajas fila inferior */}
                <Box4 x={casetaX4}    y={botRowY4} w={casetaW4}    h={SH4} lines={["CASETA"]}  fontSize={7}/>
                <Box4 x={jardinX4}    y={botRowY4} w={jardinW4}    h={SH4} lines={["JARDÍN"]}  fontSize={6}/>
                <Box4 x={oficinaBotX4} y={botRowY4} w={oficinaBotW4} h={SH4} lines={["OFICINA"]} fontSize={7}/>

                {/* Línea divisoria */}
                <line x1={lx4+36} y1={botRowY4-18} x2={rightEdge4} y2={botRowY4-18}
                    stroke="#ddd0d4" strokeWidth={0.5} strokeDasharray="5,4"/>

                {/* Cajones */}
                {SLOTS_P4.map(slot=>(
                    <SlotP4 key={`p4-${slot.num}`} slot={slot}
                        info={data[String(slot.num)]}
                        onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                ))}
            </svg>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════
// ── MAPA PISO 5 — Calle Anconitanos / Av. Central ─────────────────────
// ═══════════════════════════════════════════════════════════════════════
const SW5=24, SH5=18, G5=1;

function GroupP5({nums, x, y, cols=1, data, onEnter, onMove, onLeave, border=true}) {
    const rows = Math.ceil(nums.length / cols);
    const gw = cols*SW5+(cols-1)*G5+6;
    const gh = rows*SH5+(rows-1)*G5+6;
    return (
        <g>
            {border && <rect x={x} y={y} width={gw} height={gh} rx={2}
                fill="none" stroke="#c5a0aa" strokeWidth={1}/>}
            {nums.map((n,i)=>{
                const c=i%cols, r=Math.floor(i/cols);
                return <SlotP5 key={`p5-${n}`}
                    num={n} x={x+3+c*(SW5+G5)} y={y+3+r*(SH5+G5)}
                    info={data[String(n)]} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>;
            })}
        </g>
    );
}

function SlotP5({num, x, y, w=SW5, h=SH5, info, onEnter, onMove, onLeave}) {
    const [hov,setHov] = useState(false);
    const estado = info?.estado ?? 'libre';
    const c = COLORS[estado] ?? COLORS.libre;
    return (
        <g style={{cursor:'pointer'}}
            onMouseEnter={e=>{setHov(true); onEnter(e, String(num));}}
            onMouseMove={onMove}
            onMouseLeave={()=>{setHov(false); onLeave();}}>
            <rect x={x} y={y} width={w} height={h} rx={2}
                fill={c.fill} stroke={hov?c.strokeH:c.stroke}
                strokeWidth={hov?2:1}
                style={{filter:hov?'brightness(1.6)':'none',transition:'fill 0.15s'}}/>
            <text x={x+w/2} y={y+h/2}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={6.5} fill={c.text}
                fontFamily="'Courier New',monospace" fontWeight="700"
                style={{pointerEvents:'none',userSelect:'none'}}>{num}</text>
        </g>
    );
}

function Box5({x,y,w,h,label='',sub,italic}) {
    return (
        <g>
            <rect x={x} y={y} width={w} height={h} rx={3}
                fill="#f9f2f4" stroke="#c5a0aa" strokeWidth={1.5}/>
            <text x={x+w/2} y={y+h/2-(sub?6:0)}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={11} fill="#4a6080"
                fontFamily="'Courier New',monospace"
                fontStyle={italic?'italic':'normal'}>{label}</text>
            {sub && <text x={x+w/2} y={y+h/2+8}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={8} fill="#4a6080"
                fontFamily="'Courier New',monospace">{sub}</text>}
        </g>
    );
}

function MapaPiso5({data, onEnter, onMove, onLeave}) {
    const W=920, H=560, pad=14;
    const leftX=pad+2, rightBound=840, streetY=H-pad-26, topY=pad;
    const avX=rightBound+4, avW=52, entradaH=95;

    return (
        <div style={{background:'#fff',border:'2px solid #691C32',borderRadius:14,
                     padding:12,boxShadow:'0 4px 20px rgba(105,28,50,0.08)',overflowX:'auto',display:'flex',justifyContent:'center'}}>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>

                {/* Borde exterior */}
                <rect x={leftX} y={topY} width={rightBound-leftX} height={streetY-topY}
                    fill="none" stroke="#ddd0d4" strokeWidth={1.5} rx={3}/>

                {/* CALLE ANCONITANOS */}
                <rect x={leftX} y={streetY} width={rightBound-leftX} height={26}
                    rx={3} fill="#f9f2f4" stroke="#c5a0aa" strokeWidth={1}/>
                <text x={(leftX+rightBound)/2} y={streetY+13}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={10} fill="#691C32" fontFamily="'Courier New',monospace"
                    letterSpacing={3} fontWeight="700">CALLE ANCONITANOS</text>

                {/* AV. CENTRAL */}
                <rect x={avX} y={topY+entradaH+3} width={avW} height={streetY-topY-entradaH-3}
                    rx={3} fill="#f9f2f4" stroke="#c5a0aa" strokeWidth={1.5}/>
                <text x={avX+avW/2} y={topY+entradaH+3+(streetY-topY-entradaH-3)/2}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={9} fill="#4a6080" fontFamily="'Courier New',monospace"
                    letterSpacing={1.5}
                    transform={`rotate(-90,${avX+avW/2},${topY+entradaH+3+(streetY-topY-entradaH-3)/2})`}>
                    Av. Central</text>

                {/* ENTRADA / SALIDA */}
                <Box5 x={avX} y={topY} w={avW} h={entradaH} label="ENTRADA" sub="/ SALIDA"/>

                {/* Edificios */}
                <Box5 x={leftX+3} y={topY+3} w={215} h={130} label="Edificio" italic/>
                <Box5 x={328} y={topY+3} w={90} h={65} label="Edificio" italic/>
                <Box5 x={440} y={topY+3} w={200} h={58}/>
                <Box5 x={648} y={topY+3} w={48} h={58}/>
                <Box5 x={702} y={topY+3} w={60} h={58}/>

                {/* ── TOP AREA ── */}
                <SlotP5 num={250} x={leftX+3}   y={topY+138} w={28} h={SH5} info={data['250']} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <SlotP5 num={249} x={leftX+35}  y={topY+138} w={65} h={SH5} info={data['249']} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <SlotP5 num={248} x={leftX+104} y={topY+138} w={60} h={SH5} info={data['248']} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <SlotP5 num={247} x={leftX+168} y={topY+138} w={52} h={SH5} info={data['247']} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>

                <GroupP5 nums={[246,245]}   x={328}          y={topY+72} cols={1} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[244,243]}   x={328+SW5+G5+8} y={topY+72} cols={1} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[242,241]}   x={420}          y={topY+72} cols={1} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[240,239,238,237,236,235,234,233,232,231]} x={440} y={topY+63} cols={10} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[230,229]}   x={708} y={topY+63} cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[228]}       x={766} y={topY+63} cols={1} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>

                {/* ── SECCIÓN IZQUIERDA ── */}
                <text x={leftX+4} y={215} fontSize={8} fill="#9e7a83" fontFamily="'Courier New',monospace">x</text>
                <GroupP5 nums={[129,128,131,130]}              x={leftX+16}              y={206}             cols={4} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[133,132]}                      x={leftX+16+2*(SW5+G5)+8} y={206+SH5+G5+4}    cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[135,134]} x={leftX+110} y={288}             cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[137,136]} x={leftX+110} y={288+SH5+G5+4}   cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[139,138]} x={leftX+110} y={342}             cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[141,140]} x={leftX+110} y={342+SH5+G5+4}   cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[143,142]} x={leftX+110} y={400}             cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[145,144]} x={leftX+110} y={400+SH5+G5+4}   cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>

                {/* ── CENTRO-IZQUIERDA ── */}
                <GroupP5 nums={[171,170]}  x={310} y={246}           cols={1} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[173,175]}  x={338} y={222}           cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[172,174]}  x={338} y={222+SH5+G5+4}  cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[167,166]}  x={310} y={308}           cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[169,168]}  x={370} y={308}           cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[159,158]}  x={310} y={358}           cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[163,162]}  x={310} y={358+SH5+G5+4}  cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[165,164]}  x={370} y={358}           cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[161,160]}  x={370} y={358+SH5+G5+4}  cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[151,150]}  x={310} y={416}           cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[155,154]}  x={310} y={416+SH5+G5+4}  cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[157,156]}  x={370} y={416}           cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[153,152]}  x={370} y={416+SH5+G5+4}  cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[147,146]}  x={310} y={472}           cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[149,148]}  x={370} y={472}           cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>

                {/* ── CENTRO-DERECHA ── */}
                <GroupP5 nums={[177,176]} x={448} y={198} cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[179,178]} x={448} y={224} cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[181,180]} x={448} y={250} cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <SlotP5 num={182} x={508} y={198} w={SW5} h={SH5*2+G5+6} info={data['182']} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <SlotP5 num={183} x={508} y={284} w={SW5} h={SH5*2+G5+6} info={data['183']} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>

                {/* ── COLUMNA VERTICAL CENTRO-DERECHA ── */}
                <GroupP5 nums={[197,196,195,194]} x={546} y={198} cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[193,192,191,190]} x={546} y={248} cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[189,188,187,186]} x={546} y={360} cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[185,184]}         x={546} y={440} cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>

                {/* ── COLUMNA DERECHA ── */}
                <GroupP5 nums={[199,198]} x={658} y={178}           cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[201,200]} x={658} y={178+SH5+G5+4}  cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[205,203]} x={658} y={244}           cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[204,202]} x={658} y={244+SH5+G5+4}  cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[207,206]} x={658} y={318}           cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[209,208]} x={658} y={318+SH5+G5+4}  cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[211,210]} x={658} y={396}           cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[213,212]} x={658} y={396+SH5+G5+4}  cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[214]}     x={658}           y={460} cols={1} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[215]}     x={658+SW5+G5+30} y={460} cols={1} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>

                {/* ── COLUMNA AV. CENTRAL ── */}
                <GroupP5 nums={[226,227]} x={720} y={178}           cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[224,225]} x={720} y={178+SH5+G5+4}  cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[222,223]} x={720} y={244}           cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[220,221]} x={720} y={244+SH5+G5+4}  cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[218,219]} x={720} y={318}           cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>
                <GroupP5 nums={[216,217]} x={720} y={318+SH5+G5+4}  cols={2} data={data} onEnter={onEnter} onMove={onMove} onLeave={onLeave}/>

            </svg>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════
const PISOS = [
    {id:1, label:'Estacionamiento 1',  sublabel:'ESTACIONAMIENTO CALLE 10'},
    {id:2, label:'Estacionamiento 2',  sublabel:'ESTACIONAMIENTO CANARIOS'},
    {id:3, label:'Estacionamiento 3',  sublabel:'ESTACIONAMIENTO MEDIO AMBIENTE'},
    {id:4, label:'Estacionamiento 4',  sublabel:'ESTACIONAMIENTO OBRAS'},
    {id:5, label:'Estacionamiento 5',  sublabel:'ESTACIONAMIENTO PAGADURIA'},
];

// ═══════════════════════════════════════════════════════════════════════
// HOOKS RESPONSIVE
// ═══════════════════════════════════════════════════════════════════════
function useScreenWidth() {
    const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    useEffect(()=>{
        const fn = ()=>setW(window.innerWidth);
        window.addEventListener('resize', fn);
        return ()=>window.removeEventListener('resize', fn);
    },[]);
    return w;
}

const CAJONES_POR_PISO = {
    1: [
        ...[1,2,3,4,5,6,7].map(String),
        ...[8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35].map(String),
        ...[64,65,66,63,62,61,60,59].map(String),
        ...[58,57,56,55,54,53,52].map(String),
        ...[51,50,49,48,47,46,45,44,43,42,41,40,39,38,37,36].map(String),
        ...['139B','140B','141B','142B','143B','144B','145B','146B','147B','148B'],
        ...[67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92].map(String),
        ...['136B','135B','134B','133B','132B','131B','130B','129B','128B'],
        ...[127,126,125,124,123,122,121,120,119,118,117,116,115,114,113,112,111,110,109,108,107,106,105,104,103,102,101,100,99,98,97,96,95,94,93].map(String),
        '138B','137B',
    ],
    2: [
        ...[335,336,337,338,339,340,341,342,343,344,345,346].map(String),
        ...[309,310,311,312,313,314,315,316,317,318,319,320,321,322,323,324,325,326,327,328,329,330,331,332,333,334].map(String),
        ...[283,284,285,286,287,288,289,290,291,292,293,294,295,296,297,298,299,300,301,302,303,304,305,306,307,308].map(String),
        ...[251,252,253,254,255,256,261,262,263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282].map(String),
    ],
    3: [1,2,3,4,5,6,7,8,9,10].map(String),
    4: Array.from({length:37},(_,i)=>String(i+1)),
    5: [
        ...[250,249,248,247,246,245,244,243,242,241,240,239,238,237,236,235,234,233,232,231,230,229,228].map(String),
        ...[128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145].map(String),
        ...[146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175].map(String),
        ...[176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197].map(String),
        ...[198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215].map(String),
        ...[216,217,218,219,220,221,222,223,224,225,226,227].map(String),
    ],
};

const EST = {
    libre:     {bg:'#eaf3eb',border:'#2e7d32',text:'#1b5e20',label:'Libre'},
    ocupado:   {bg:'#faeaee',border:'#691C32',text:'#691C32',label:'Ocupado'},
    reservado: {bg:'#fdf8ec',border:'#C8A84B',text:'#6b4f00',label:'Reservado'},
};

// MODAL DE DETALLE
function ModalDetalle({ slotKey, info, onClose }) {
    if (!slotKey) return null;
    const estado = info?.estado ?? 'libre';
    const c = EST[estado] ?? EST.libre;
    const campos = [
        {icon:'person', label:'Nombre',   value: info?.nombre},
        {icon:'car',    label:'Placa',    value: info?.placa,    mono:true},
        {icon:'tool',   label:'Modelo',   value: info?.modelo},
        {icon:'phone',  label:'Telefono', value: info?.telefono, mono:true},
        {icon:'note',   label:'Notas',    value: info?.notas},
    ].filter(f => f.value);

    const iconMap = {
        person: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#691C32" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
        car:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#691C32" strokeWidth="2"><rect x="1" y="11" width="22" height="9" rx="2"/><path d="M5 11l2-5h10l2 5"/><circle cx="7" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/></svg>,
        tool:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#691C32" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
        phone:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#691C32" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>,
        note:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#691C32" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    };

    return (
        <>
            <div onClick={onClose} style={{
                position:'fixed',inset:0,zIndex:900,
                background:'rgba(60,10,20,0.5)',
                backdropFilter:'blur(3px)',
                WebkitBackdropFilter:'blur(3px)',
            }}/>
            <div style={{
                position:'fixed',bottom:0,left:0,right:0,zIndex:901,
                background:'#fff',
                borderRadius:'22px 22px 0 0',
                border:'2px solid #691C32',
                borderBottom:'none',
                boxShadow:'0 -10px 50px rgba(105,28,50,0.25)',
                fontFamily:"'Syne',system-ui,sans-serif",
                animation:'cdmxUp 0.28s cubic-bezier(.32,1.1,.58,1)',
                maxHeight:'90vh',
                overflowY:'auto',
            }}>
                <style>{`@keyframes cdmxUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
                <div style={{display:'flex',justifyContent:'center',padding:'14px 0 6px'}}>
                    <div style={{width:44,height:5,background:'#ddd0d4',borderRadius:3}}/>
                </div>
                <div style={{height:4,background:'linear-gradient(90deg,#691C32 70%,#C8A84B 100%)',margin:'8px 20px 20px',borderRadius:2}}/>
                <div style={{padding:'0 20px 32px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:22}}>
                        <div style={{
                            width:62,height:62,borderRadius:14,
                            background:c.bg,border:'2.5px solid '+c.border,
                            display:'flex',alignItems:'center',justifyContent:'center',
                            fontFamily:'monospace',fontWeight:900,fontSize:20,color:c.text,flexShrink:0,
                        }}>{slotKey}</div>
                        <div style={{flex:1}}>
                            <div style={{fontSize:10,color:'#9e7a83',fontFamily:'monospace',letterSpacing:1.5,textTransform:'uppercase',marginBottom:6}}>CAJON #{slotKey}</div>
                            <span style={{
                                display:'inline-block',
                                background:c.border,color:'#fff',
                                padding:'5px 16px',borderRadius:20,
                                fontSize:12,fontWeight:700,letterSpacing:1,textTransform:'uppercase',
                            }}>{c.label}</span>
                        </div>
                        <button onClick={onClose} style={{
                            width:38,height:38,borderRadius:'50%',
                            background:'#f9f2f4',border:'1.5px solid #ddd0d4',
                            color:'#691C32',fontSize:22,cursor:'pointer',
                            display:'flex',alignItems:'center',justifyContent:'center',
                            flexShrink:0,lineHeight:1,
                        }}>×</button>
                    </div>

                    {estado==='libre' ? (
                        <div style={{
                            background:'#eaf3eb',border:'1.5px solid #2e7d32',
                            borderRadius:14,padding:'24px',textAlign:'center',
                        }}>
                            <div style={{fontSize:40,marginBottom:8}}>🟢</div>
                            <div style={{fontWeight:800,color:'#1b5e20',fontSize:18}}>Cajón disponible</div>
                            <div style={{color:'#4a8c57',fontSize:13,marginTop:4,fontFamily:'monospace'}}>Sin vehículo registrado</div>
                        </div>
                    ) : (
                        <div style={{display:'flex',flexDirection:'column',gap:10}}>
                            {campos.length > 0 ? campos.map(f=>(
                                <div key={f.label} style={{
                                    display:'flex',alignItems:'center',gap:14,
                                    background:'#F4EFE9',borderRadius:12,padding:'13px 16px',
                                }}>
                                    <div style={{flexShrink:0}}>{iconMap[f.icon]}</div>
                                    <div style={{flex:1,minWidth:0}}>
                                        <div style={{fontSize:9,color:'#9e7a83',fontFamily:'monospace',letterSpacing:1.5,textTransform:'uppercase',marginBottom:3}}>{f.label}</div>
                                        <div style={{
                                            fontSize:15,fontWeight:700,color:'#3b1a22',
                                            fontFamily:f.mono?'monospace':'inherit',
                                            letterSpacing:f.mono?2:0,
                                            overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',
                                        }}>{f.value}</div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{background:'#F4EFE9',borderRadius:12,padding:'20px',textAlign:'center',color:'#9e7a83',fontSize:13,fontFamily:'monospace'}}>
                                    Sin información adicional
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

// LISTADO MOVIL
function ListadoMovil({ pisoActivo, data, cols }) {
    const [filtro,   setFiltro]   = useState('todos');
    const [modalKey, setModalKey] = useState(null);
    const cajones = CAJONES_POR_PISO[pisoActivo] || [];
    const libres     = cajones.filter(k=>(data[k]?.estado??'libre')==='libre').length;
    const ocupados   = cajones.filter(k=>data[k]?.estado==='ocupado').length;
    const reservados = cajones.filter(k=>data[k]?.estado==='reservado').length;
    const filtrados  = cajones.filter(k=>filtro==='todos'||(data[k]?.estado??'libre')===filtro);

    return (
        <div style={{width:'100%'}}>
            <ModalDetalle slotKey={modalKey} info={data[modalKey]??{}} onClose={()=>setModalKey(null)}/>
            <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
                {[
                    {k:'todos',     l:'Todos ('+cajones.length+')',   bg:'#fff',    fg:'#691C32',br:'#691C32'},
                    {k:'libre',     l:'Libres ('+libres+')',           bg:'#eaf3eb', fg:'#1b5e20',br:'#2e7d32'},
                    {k:'ocupado',   l:'Ocupados ('+ocupados+')',       bg:'#faeaee', fg:'#691C32',br:'#8B2442'},
                    {k:'reservado', l:'Reservados ('+reservados+')',   bg:'#fdf8ec', fg:'#6b4f00',br:'#C8A84B'},
                ].map(f=>(
                    <button key={f.k} onClick={()=>setFiltro(f.k)} style={{
                        background:filtro===f.k?f.fg:f.bg, color:filtro===f.k?'#fff':f.fg,
                        border:'1.5px solid '+f.br, borderRadius:20, padding:'6px 14px',
                        fontSize:12, fontWeight:700, fontFamily:'monospace', cursor:'pointer', transition:'all 0.15s',
                    }}>{f.l}</button>
                ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat('+cols+',1fr)',gap:10}}>
                {filtrados.map(key=>{
                    const info   = data[key]??{};
                    const estado = info.estado??'libre';
                    const c = EST[estado]??EST.libre;
                    return (
                        <div key={key} onClick={()=>setModalKey(key)}
                            style={{
                                background:c.bg,border:'1.5px solid '+c.border,
                                borderRadius:12,padding:'12px 14px',
                                display:'flex',alignItems:'center',gap:11,
                                cursor:'pointer',transition:'transform 0.1s',
                                WebkitTapHighlightColor:'transparent',
                            }}
                            onTouchStart={e=>e.currentTarget.style.transform='scale(0.97)'}
                            onTouchEnd={e=>e.currentTarget.style.transform=''}
                        >
                            <div style={{
                                minWidth:44,height:44,borderRadius:10,
                                background:'#fff',border:'2px solid '+c.border,
                                display:'flex',alignItems:'center',justifyContent:'center',
                                fontFamily:'monospace',fontWeight:900,fontSize:13,color:c.text,flexShrink:0,
                            }}>{key}</div>
                            <div style={{flex:1,minWidth:0}}>
                                <div style={{fontWeight:700,color:c.text,fontSize:14,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                                    {estado==='libre'?'Disponible':(info.nombre||'—')}
                                </div>
                                {estado!=='libre'&&info.placa&&(
                                    <div style={{fontFamily:'monospace',fontSize:11,color:'#9e7a83',letterSpacing:1,marginTop:2}}>
                                        {info.placa}{info.modelo?' · '+info.modelo:''}
                                    </div>
                                )}
                            </div>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.border} strokeWidth="2.5" style={{flexShrink:0}}>
                                <polyline points="9 18 15 12 9 6"/>
                            </svg>
                        </div>
                    );
                })}
            </div>
            {filtrados.length===0&&(
                <div style={{textAlign:'center',padding:'40px 20px',color:'#9e7a83',fontFamily:'monospace',fontSize:13}}>
                    Sin cajones con ese estado
                </div>
            )}
        </div>
    );
}

export default function ParkingIndex() {
    const [pisoActivo, setPisoActivo] = useState(1);
    const [menuOpen,   setMenuOpen]   = useState(false);
    const [tooltip, setTooltip] = useState({visible:false,x:0,y:0,slotKey:'',info:null});

    const screenW = useScreenWidth();
    const isMobile = screenW < 768;
    const isTablet = screenW >= 768 && screenW < 1100;
    const {data,stats,sync,time} = useFloorData(pisoActivo);

    const pisoInfo = PISOS.find(p=>p.id===pisoActivo);

    // Sync dot
    const dotColor = {idle:'#c5a0aa',loading:'#C8A84B',ok:'#2e7d32',error:'#691C32'}[sync];
    const dotAnim  = sync==='loading'?'pulse 1s infinite':'none';

    // Tooltip handlers
    const handleEnter = useCallback((e, slotKey)=>{
        const info = data[slotKey]??{estado:'libre'};
        const pos  = calcPos(e.clientX,e.clientY);
        setTooltip({visible:true,...pos,slotKey,info});
    },[data]);

    const handleMove = useCallback((e)=>{
        const pos = calcPos(e.clientX,e.clientY);
        setTooltip(t=>t.visible?{...t,...pos}:t);
    },[]);

    const handleLeave = useCallback(()=>{
        setTooltip(t=>({...t,visible:false}));
    },[]);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@400;700;800&display=swap');
                @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
                *{box-sizing:border-box;}
                .floor-menu{position:relative;display:inline-block;}
                .floor-btn{
                    display:flex;align-items:center;gap:10px;
                    background:#fff;border:2px solid #691C32;
                    color:#691C32;border-radius:8px;padding:10px 16px;
                    cursor:pointer;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;
                    transition:all 0.15s;
                }
                .floor-btn:hover{background:#691C32;color:#fff;}
                .floor-badge{
                    background:#faeaee;color:#691C32;
                    border:1px solid #C8A84B;border-radius:6px;
                    padding:2px 8px;font-size:12px;font-family:monospace;font-weight:700;
                }
                .floor-dropdown{
                    position:absolute;top:calc(100% + 6px);left:0;
                    background:#fff;border:2px solid #691C32;
                    border-radius:10px;min-width:260px;z-index:500;
                    box-shadow:0 8px 32px rgba(105,28,50,0.15);overflow:hidden;
                }
                .floor-option{
                    display:flex;flex-direction:column;gap:2px;
                    padding:12px 16px;cursor:pointer;
                    transition:background 0.12s;border-bottom:1px solid #f0e4e8;
                    font-family:'Syne',sans-serif;
                }
                .floor-option:last-child{border-bottom:none;}
                .floor-option:hover{background:#faeaee;}
                .floor-option.active{background:#691C32;}
                .floor-option.active .floor-option-label{color:#fff;}
                .floor-option.active .floor-option-sub{color:#C8A84B;}
                .floor-option-label{font-size:14px;font-weight:700;color:#691C32;}
                .floor-option-sub{font-size:11px;color:#9e7a83;font-family:monospace;}
                .chevron{transition:transform 0.2s;}
                .chevron.open{transform:rotate(180deg);}
                .map-center{display:flex;justify-content:center;width:100%;overflow-x:auto;}
                @media(max-width:767px){
                    .floor-btn{padding:7px 10px;font-size:12px;}
                    .floor-badge{font-size:11px;}
                    .hdr-sublabel{display:none;}
                    .stats-bar{display:none!important;}
                }
                @media(max-width:1099px){
                    .floor-btn{font-size:13px;}
                }
            `}</style>

            <div style={{background:'#F4EFE9',minHeight:'100vh',padding:24,
                         fontFamily:"'Syne',system-ui,sans-serif",color:'#691C32'}}>

                {/* ── HEADER ─────────────────────────────────────────── */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                             marginBottom:28,paddingBottom:20,
                             borderBottom:'3px solid #691C32',
                             flexWrap:'wrap',gap:12}}>

                    <div style={{display:'flex',alignItems:'center',gap:14}}>
                        {/* Franja institucional guinda/dorado */}
                        <div style={{display:'flex',flexDirection:'column',gap:0,borderRadius:3,overflow:'hidden'}}>
                            <div style={{width:7,height:22,background:'#691C32'}}/>
                            <div style={{width:7,height:9, background:'#C8A84B'}}/>
                        </div>
                        <div>
                            <img src="/img/logo.svg" alt="Logo Institucional" style={{ height: 70 }} />
                        </div>

                        {/* ── MENÚ DESPLEGABLE PISOS ── */}
                        <div className="floor-menu" style={{marginLeft:8}}>
                            <button className="floor-btn" onClick={()=>setMenuOpen(o=>!o)}>
                                <span className="floor-badge">{pisoInfo?.label}</span>
                                <span className="hdr-sublabel" style={{fontSize:12,color:'#9e7a83',fontFamily:'monospace'}}>{pisoInfo?.sublabel}</span>
                                <svg className={`chevron${menuOpen?' open':''}`} width="14" height="14"
                                    viewBox="0 0 24 24" fill="none" stroke="#691C32" strokeWidth="2.5">
                                    <polyline points="6 9 12 15 18 9"/>
                                </svg>
                            </button>

                            {menuOpen && (
                                <>
                                    <div style={{position:'fixed',inset:0,zIndex:499}}
                                         onClick={()=>setMenuOpen(false)}/>
                                    <div className="floor-dropdown">
                                        {PISOS.map(p=>(
                                            <div key={p.id}
                                                className={`floor-option${pisoActivo===p.id?' active':''}`}
                                                onClick={()=>{setPisoActivo(p.id);setMenuOpen(false);}}>
                                                <span className="floor-option-label">{p.label}</span>
                                                <span className="floor-option-sub">{p.sublabel}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Stats + sync */}
                    <div className="stats-bar" style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                        {[
                            {color:'#1b5e20',bg:'#eaf3eb',border:'#2e7d32',label:`${stats.libres} Libres`},
                            {color:'#691C32',bg:'#faeaee',border:'#8B2442',label:`${stats.ocupados} Ocupados`},
                            {color:'#6b4f00',bg:'#fdf8ec',border:'#C8A84B',label:`${stats.reservados} Reservados`},
                        ].map(({color,bg,border,label})=>(
                            <div key={label} style={{
                                display:'flex',alignItems:'center',gap:7,
                                fontFamily:'monospace',fontSize:13,fontWeight:700,
                                background:bg,border:`1px solid ${border}`,
                                borderRadius:6,padding:'5px 12px',color,
                            }}>
                                <div style={{width:8,height:8,borderRadius:2,background:color}}/>
                                <span>{label}</span>
                            </div>
                        ))}
                        <div style={{display:'flex',alignItems:'center',gap:6,
                                     fontFamily:'monospace',fontSize:12,color:'#9e7a83',
                                     background:'#fff',border:'1px solid #ddd0d4',
                                     borderRadius:6,padding:'5px 10px'}}>
                            <div style={{width:8,height:8,borderRadius:'50%',
                                         background:dotColor,animation:dotAnim}}/>
                            <span>
                                {sync==='loading'&&'Actualizando…'}
                                {sync==='ok'&&`Sync ${time}`}
                                {sync==='error'&&'Sin conexión'}
                                {sync==='idle'&&'—'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── STATS en móvil ─────────────────────────────────── */}
                {isMobile && (
                    <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
                        {[
                            {color:'#1b5e20',bg:'#eaf3eb',border:'#2e7d32',label:stats.libres+' Libres'},
                            {color:'#691C32',bg:'#faeaee',border:'#8B2442',label:stats.ocupados+' Ocupados'},
                            {color:'#6b4f00',bg:'#fdf8ec',border:'#C8A84B',label:stats.reservados+' Reservados'},
                        ].map(({color,bg,border,label})=>(
                            <div key={label} style={{display:'flex',alignItems:'center',gap:6,fontFamily:'monospace',fontSize:12,fontWeight:700,background:bg,border:'1px solid '+border,borderRadius:6,padding:'4px 10px',color}}>
                                <div style={{width:7,height:7,borderRadius:2,background:color}}/>
                                <span>{label}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── MAPA (desktop) o LISTADO (mobile/tablet) ─────────── */}
                {(isMobile||isTablet) ? (
                    <ListadoMovil
                        pisoActivo={pisoActivo}
                        data={data}
                        cols={isTablet ? 2 : 1}
                    />
                ) : (
                <div className="map-center">
                    {pisoActivo===1 && (
                        <MapaPiso1 data={data} onEnter={handleEnter} onMove={handleMove} onLeave={handleLeave}/>
                    )}
                    {pisoActivo===2 && (
                        <MapaPiso2 data={data} onEnter={handleEnter} onMove={handleMove} onLeave={handleLeave}/>
                    )}
                    {pisoActivo===3 && (
                        <MapaPiso3 data={data} onEnter={handleEnter} onMove={handleMove} onLeave={handleLeave}/>
                    )}
                    {pisoActivo===4 && (
                        <MapaPiso4 data={data} onEnter={handleEnter} onMove={handleMove} onLeave={handleLeave}/>
                    )}
                    {pisoActivo===5 && (
                        <MapaPiso5 data={data} onEnter={handleEnter} onMove={handleMove} onLeave={handleLeave}/>
                    )}
                </div>
                )}

            </div>

            <Tooltip {...tooltip}/>
        </>
    );
}

function calcPos(cx,cy){
    const TW=220,TH=130;
    return {
        x: cx+16+TW>window.innerWidth  ? cx-TW-16 : cx+16,
        y: cy-10+TH>window.innerHeight ? cy-TH    : cy-10,
    };
}
