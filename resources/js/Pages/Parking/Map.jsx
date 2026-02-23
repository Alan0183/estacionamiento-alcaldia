import { useState, useEffect, useRef, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════
const API_URL    = '/api/parking/map-data';
const REFRESH_MS = 15000; // refresco cada 15 segundos

// ═══════════════════════════════════════════════════════════════════════
// LAYOUT — posiciones corregidas para evitar solapamientos
// FIX: Bloque 58-52 movido a x=904, Bloque 51-36 a x=1112
//      Esto hace visibles los cajones 52 y 53 que antes quedaban ocultos
// ═══════════════════════════════════════════════════════════════════════
const SW = 26, SH = 36, GAP = 1;

function makeRow(nums, startX, startY, w = SW, h = SH, suffix = '') {
    return nums.map((n, i) => ({
        num:    n,
        x:      startX + i * (w + GAP),
        y:      startY,
        w, h, suffix,
        slotKey: suffix ? `${n}${suffix}` : String(n),
    }));
}

const SLOT_DEFS = [
    // FILA SUPERIOR izquierda: 1–7
    ...makeRow([1,2,3,4,5,6,7], 80, 12),

    // FILA SUPERIOR derecha: 8–35
    ...makeRow([8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,
                23,24,25,26,27,28,29,30,31,32,33,34,35], 530, 12),

    // COLUMNA IZQUIERDA MEDIA: 64, 65, 66
    ...[64,65,66].map((n, i) => ({
        num: n, x: 80, y: 148 + i * 34, w: SW, h: 30,
        suffix: '', slotKey: String(n),
    })),

    // BLOQUE 63–59 (5 cajones, fila media izquierda)
    ...makeRow([63,62,61,60,59], 112, 148, SW, 90),

    // BLOQUE 58–52 (7 cajones) — FIX: antes x=760, ahora x=904
    ...makeRow([58,57,56,55,54,53,52], 904, 148, SW, 90),

    // BLOQUE 51–36 (16 cajones) — FIX: antes x=900, ahora x=1112
    ...makeRow([51,50,49,48,47,46,45,44,43,42,41,40,39,38,37,36], 1112, 148, SW, 90),

    // FILA MEDIA-BAJA: 139B–148B
    ...makeRow([139,140,141,142,143,144,145,146,147,148], 112, 248, SW, 70, 'B'),

    // FILA MEDIA-BAJA: 67–92
    ...makeRow([67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,
                83,84,85,86,87,88,89,90,91,92], 430, 248, SW, 70),

    // FILA INFERIOR izquierda: 136B–128B
    ...makeRow([136,135,134,133,132,131,130,129,128], 80, 358, SW, 50, 'B'),

    // FILA INFERIOR derecha: 127–93
    ...makeRow([127,126,125,124,123,122,121,120,119,118,117,116,115,
                114,113,112,111,110,109,108,107,106,105,104,103,102,
                101,100,99,98,97,96,95,94,93], 330, 358, SW, 50),

    // PARED IZQUIERDA: 138B y 137B
    { num: 138, x: 56, y: 248, w: 22, h: 70,  suffix: 'B', slotKey: '138B' },
    { num: 137, x: 56, y: 358, w: 22, h: 50,  suffix: 'B', slotKey: '137B' },
];

// ═══════════════════════════════════════════════════════════════════════
// PALETA DE COLORES
// ═══════════════════════════════════════════════════════════════════════
const COLORS = {
    libre:     { fill: '#0f2d1a', stroke: '#238636', strokeHover: '#2ea043', text: '#3fb950' },
    ocupado:   { fill: '#2d0f0f', stroke: '#da3633', strokeHover: '#f85149', text: '#f85149' },
    reservado: { fill: '#2d1f00', stroke: '#9e6a03', strokeHover: '#d29922', text: '#d29922' },
};

const BADGE = {
    libre:     { bg: '#0f2d1a', color: '#2ea043', border: '#238636', label: 'Libre' },
    ocupado:   { bg: '#2d0f0f', color: '#f85149', border: '#da3633', label: 'Ocupado' },
    reservado: { bg: '#2d1f00', color: '#d29922', border: '#9e6a03', label: 'Reservado' },
};

// ═══════════════════════════════════════════════════════════════════════
// COMPONENTE: Cajón individual
// ═══════════════════════════════════════════════════════════════════════
function Slot({ slot, info, onEnter, onMove, onLeave }) {
    const [hovered, setHovered] = useState(false);
    const estado  = info?.estado ?? 'libre';
    const colors  = COLORS[estado] ?? COLORS.libre;

    return (
        <g
            style={{ cursor: 'pointer' }}
            onMouseEnter={(e) => { setHovered(true);  onEnter(e, slot.slotKey); }}
            onMouseMove={(e)  => onMove(e)}
            onMouseLeave={(e) => { setHovered(false); onLeave(); }}
        >
            <rect
                x={slot.x} y={slot.y}
                width={slot.w} height={slot.h}
                rx={3}
                fill={colors.fill}
                stroke={hovered ? colors.strokeHover : colors.stroke}
                strokeWidth={hovered ? 2 : 1.5}
                style={{
                    filter:     hovered ? 'brightness(1.6)' : 'none',
                    transition: 'filter 0.15s, stroke-width 0.15s',
                }}
            />
            {/* Número */}
            <text
                x={slot.x + slot.w / 2}
                y={slot.y + slot.h / 2 - (slot.suffix ? 5 : 0)}
                fontSize={8}
                fill={colors.text}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="'JetBrains Mono', monospace"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
                {slot.num}
            </text>
            {/* Sufijo B */}
            {slot.suffix && (
                <text
                    x={slot.x + slot.w / 2}
                    y={slot.y + slot.h / 2 + 8}
                    fontSize={8}
                    fill={colors.text}
                    textAnchor="middle"
                    fontFamily="'JetBrains Mono', monospace"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                    B
                </text>
            )}
        </g>
    );
}

// ═══════════════════════════════════════════════════════════════════════
// COMPONENTE: Tooltip flotante
// ═══════════════════════════════════════════════════════════════════════
function Tooltip({ visible, x, y, slotKey, info }) {
    if (!visible) return null;

    const estado = info?.estado ?? 'libre';
    const badge  = BADGE[estado] ?? BADGE.libre;

    return (
        <div style={{
            position:   'fixed',
            left:       x,
            top:        y,
            background: '#1c2128',
            border:     '1px solid #30363d',
            borderRadius: 10,
            padding:    '14px 18px',
            pointerEvents: 'none',
            zIndex:     1000,
            minWidth:   210,
            boxShadow:  '0 8px 32px rgba(0,0,0,0.5)',
            fontFamily: "'Syne', system-ui, sans-serif",
        }}>
            {/* Número de cajón */}
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#8b949e',
                          textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                CAJÓN #{slotKey}
            </div>

            {/* Nombre */}
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f6fc', marginBottom: 4 }}>
                {estado === 'libre' ? 'Disponible' : (info?.nombre || '—')}
            </div>

            {/* Placa o notas */}
            {estado !== 'libre' && (
                <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#58a6ff',
                              letterSpacing: 2, marginBottom: 4 }}>
                    {estado === 'ocupado' ? (info?.placa || '—') : (info?.notas || '—')}
                </div>
            )}

            {/* Modelo (solo ocupado) */}
            {estado === 'ocupado' && info?.phone && (
                <div style={{ fontSize: 13, color: '#58a6ff', marginBottom: 6 }}>
                    {info.phone}
                </div>
            )}

            {/* Badge estado */}
            <span style={{
                display:      'inline-block',
                fontSize:     11,
                fontWeight:   700,
                padding:      '3px 10px',
                borderRadius: 20,
                textTransform:'uppercase',
                letterSpacing: 1,
                background:   badge.bg,
                color:        badge.color,
                border:       `1px solid ${badge.border}`,
                marginTop:    estado === 'libre' ? 8 : 0,
            }}>
                {badge.label}
            </span>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════
export default function Map() {
    const [slotsData, setSlotsData]   = useState({});
    const [stats, setStats]           = useState({ libres: 0, ocupados: 0, reservados: 0 });
    const [syncState, setSyncState]   = useState('idle');   // idle | loading | ok | error
    const [syncTime,  setSyncTime]    = useState('');
    const [tooltip, setTooltip]       = useState({
        visible: false, x: 0, y: 0, slotKey: '', info: null,
    });

    // Ref para acceder al tooltip position en el handler de mousemove
    const tooltipPos = useRef({ x: 0, y: 0 });

    // ── Fetch de datos ────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        setSyncState('loading');
        try {
            const res = await fetch(API_URL, {
                headers: {
                    'Accept':           'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            // La API devuelve: { "1": { slot_number, nombre, placa, modelo, estado, notas }, ... }
            const data = await res.json();
            setSlotsData(data);

            // Calcular estadísticas
            const vals = Object.values(data);
            setStats({
                libres:     vals.filter(v => v.estado === 'libre').length,
                ocupados:   vals.filter(v => v.estado === 'ocupado').length,
                reservados: vals.filter(v => v.estado === 'reservado').length,
            });

            setSyncState('ok');
            setSyncTime(new Date().toLocaleTimeString('es-MX', {
                hour: '2-digit', minute: '2-digit', second: '2-digit',
            }));
        } catch (err) {
            console.error('[ParkingMap] Error:', err);
            setSyncState('error');
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, REFRESH_MS);
        return () => clearInterval(interval);
    }, [fetchData]);

    // ── Handlers tooltip ──────────────────────────────────────────────
    const handleEnter = useCallback((e, slotKey) => {
        const info = slotsData[slotKey] ?? { estado: 'libre' };
        const pos  = calcTooltipPos(e.clientX, e.clientY);
        tooltipPos.current = pos;
        setTooltip({ visible: true, ...pos, slotKey, info });
    }, [slotsData]);

    const handleMove = useCallback((e) => {
        const pos = calcTooltipPos(e.clientX, e.clientY);
        tooltipPos.current = pos;
        setTooltip(t => t.visible ? { ...t, ...pos } : t);
    }, []);

    const handleLeave = useCallback(() => {
        setTooltip(t => ({ ...t, visible: false }));
    }, []);

    // ── Sync dot color ────────────────────────────────────────────────
    const syncDotColor = {
        idle:    '#444c56',
        loading: '#d29922',
        ok:      '#238636',
        error:   '#da3633',
    }[syncState];

    const syncDotAnim = syncState === 'loading' ? 'pulse 1s infinite' : 'none';

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@400;700;800&display=swap');
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
                * { box-sizing: border-box; }
            `}</style>

            <div style={{
                background: '#0d1117', minHeight: '100vh', padding: 24,
                fontFamily: "'Syne', system-ui, sans-serif", color: '#c9d1d9',
            }}>
                {/* ── Header ─────────────────────────────────────────── */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid #30363d',
                    flexWrap: 'wrap', gap: 12,
                }}>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f0f6fc', margin: 0 }}>
                        Parking <span style={{ color: '#58a6ff' }}>MAP</span>
                    </h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                        {/* Estadísticas */}
                        {[
                            { color: '#238636', label: `${stats.libres} Libres` },
                            { color: '#da3633', label: `${stats.ocupados} Ocupados` },
                            { color: '#9e6a03', label: `${stats.reservados} Reservados` },
                        ].map(({ color, label }) => (
                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8,
                                                      fontFamily: 'monospace', fontSize: 13 }}>
                                <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                                <span>{label}</span>
                            </div>
                        ))}

                        {/* Indicador de sync */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6,
                                      fontFamily: 'monospace', fontSize: 12, color: '#8b949e' }}>
                            <div style={{
                                width: 8, height: 8, borderRadius: '50%',
                                background: syncDotColor,
                                animation: syncDotAnim,
                            }} />
                            <span>
                                {syncState === 'loading' && 'Actualizando…'}
                                {syncState === 'ok'      && `Actualizado ${syncTime}`}
                                {syncState === 'error'   && 'Sin conexión'}
                                {syncState === 'idle'    && '—'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Mapa SVG ───────────────────────────────────────── */}
                <div style={{
                    background: '#161b22', border: '1px solid #30363d',
                    borderRadius: 12, padding: 20, overflowX: 'auto',
                }}>
                    <svg
                        viewBox="0 0 1560 430"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ display: 'block', minWidth: 1400 }}
                    >
                        {/* Entrada */}
                        <rect x="2" y="2" width="50" height="90"
                              fill="#161b22" stroke="#58a6ff" strokeWidth={1.5} rx={4} />
                        <text x="27" y="47"
                              fontSize={9} fontWeight={700} fill="#58a6ff"
                              textAnchor="middle" dominantBaseline="middle"
                              transform="rotate(-90,27,47)"
                              style={{ letterSpacing: 2, fontFamily: 'Syne, sans-serif' }}>
                            ENTRADA
                        </text>

                        {/* Pasillo */}
                        <text x="380" y="120"
                              fontSize={10} fill="#444c56" textAnchor="middle"
                              fontFamily="'JetBrains Mono', monospace"
                              style={{ letterSpacing: 2 }}>
                            PASILLO CENTRAL
                        </text>

                        {/* Borde exterior */}
                        <rect x="55" y="2" width="1498" height="420"
                              fill="none" stroke="#21262d" strokeWidth={1.5} rx={4} />

                        {/* Líneas divisorias */}
                        <line x1="55" y1="230" x2="1553" y2="230"
                              stroke="#21262d" strokeWidth={1} strokeDasharray="4,4" />
                        <line x1="55" y1="340" x2="1553" y2="340"
                              stroke="#21262d" strokeWidth={1} strokeDasharray="4,4" />

                        {/* Cajones */}
                        {SLOT_DEFS.map((slot) => (
                            <Slot
                                key={slot.slotKey}
                                slot={slot}
                                info={slotsData[slot.slotKey]}
                                onEnter={handleEnter}
                                onMove={handleMove}
                                onLeave={handleLeave}
                            />
                        ))}
                    </svg>
                </div>
            </div>

            {/* Tooltip */}
            <Tooltip {...tooltip} />
        </>
    );
}

// ── Helpers ───────────────────────────────────────────────────────────
function calcTooltipPos(clientX, clientY) {
    const TW = 220, TH = 130;
    return {
        x: clientX + 16 + TW > window.innerWidth  ? clientX - TW - 16 : clientX + 16,
        y: clientY - 10 + TH > window.innerHeight ? clientY - TH       : clientY - 10,
    };
}
