<x-filament-panels::page>

<style>
    .cdmx-card {
        background: #fff;
        border: 2px solid #691C32;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 20px;
    }
    .cdmx-header-strip {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
    }
    .cdmx-strip {
        display: flex;
        flex-direction: column;
        border-radius: 3px;
        overflow: hidden;
    }
    .cdmx-strip-top    { width: 6px; height: 18px; background: #691C32; }
    .cdmx-strip-bottom { width: 6px; height: 7px;  background: #C8A84B; }
    .cdmx-title { font-size: 1.2rem; font-weight: 800; color: #691C32; }
    .cdmx-sub   { font-size: 11px; color: #C8A84B; font-family: monospace; letter-spacing: 2px; }

    /* Global summary cards */
    .stat-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 16px;
        margin-bottom: 28px;
    }
    .stat-card {
        border-radius: 10px;
        padding: 18px 20px;
        border: 1px solid;
    }
    .stat-card .stat-num  { font-size: 2rem; font-weight: 800; line-height: 1; }
    .stat-card .stat-lbl  { font-size: 12px; font-family: monospace; letter-spacing: 1px; margin-top: 4px; }

    /* Table */
    .rep-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
    }
    .rep-table th {
        background: #691C32;
        color: #fff;
        padding: 10px 14px;
        text-align: left;
        font-weight: 700;
        font-size: 12px;
        letter-spacing: 0.5px;
    }
    .rep-table th:first-child { border-radius: 8px 0 0 0; }
    .rep-table th:last-child  { border-radius: 0 8px 0 0; }
    .rep-table td {
        padding: 10px 14px;
        border-bottom: 1px solid #f0e4e8;
        color: #3b1a22;
    }
    .rep-table tr:last-child td { border-bottom: none; }
    .rep-table tr:hover td { background: #fdf6f8; }

    /* Progress bar */
    .bar-wrap {
        background: #f0e4e8;
        border-radius: 4px;
        height: 10px;
        width: 100%;
        min-width: 80px;
        overflow: hidden;
    }
    .bar-fill-ocu { background: #691C32; height: 100%; border-radius: 4px; transition: width 0.4s; }
    .bar-fill-lib { background: #2e7d32; height: 100%; border-radius: 4px; }

    /* Badge estado */
    .badge-ocu { background: #faeaee; color: #691C32; border: 1px solid #8B2442;
                 padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .badge-lib { background: #eaf3eb; color: #1b5e20; border: 1px solid #2e7d32;
                 padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .badge-res { background: #fdf8ec; color: #6b4f00; border: 1px solid #C8A84B;
                 padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }

    /* Alert cuando muy ocupado */
    .alerta { background: #faeaee; border-left: 4px solid #691C32;
              border-radius: 6px; padding: 10px 14px; font-size: 13px;
              color: #691C32; margin-top: 8px; display: flex; align-items: center; gap: 8px; }
</style>

{{-- ── HEADER ── --}}
<div class="cdmx-card">
    <div class="cdmx-header-strip">
        <div class="cdmx-strip">
            <div class="cdmx-strip-top"></div>
            <div class="cdmx-strip-bottom"></div>
        </div>
        <div>
            <div class="cdmx-title">Reporte de Ocupación</div>
            <div class="cdmx-sub">GENERADO: {{ $generado_en }}</div>
        </div>
    </div>

    {{-- Tarjetas globales --}}
    <div class="stat-grid">
        <div class="stat-card" style="border-color:#691C32; background:#faeaee;">
            <div class="stat-num" style="color:#691C32;">{{ $global_total }}</div>
            <div class="stat-lbl" style="color:#691C32;">CAJONES TOTALES</div>
        </div>
        <div class="stat-card" style="border-color:#8B2442; background:#faeaee;">
            <div class="stat-num" style="color:#8B2442;">{{ $global_ocupados }}</div>
            <div class="stat-lbl" style="color:#8B2442;">OCUPADOS</div>
        </div>
        <div class="stat-card" style="border-color:#2e7d32; background:#eaf3eb;">
            <div class="stat-num" style="color:#1b5e20;">{{ $global_libres }}</div>
            <div class="stat-lbl" style="color:#1b5e20;">LIBRES</div>
        </div>
        <div class="stat-card" style="border-color:#C8A84B; background:#fdf8ec;">
            <div class="stat-num" style="color:#6b4f00;">{{ $global_reservados }}</div>
            <div class="stat-lbl" style="color:#6b4f00;">RESERVADOS</div>
        </div>
        <div class="stat-card" style="border-color:#691C32; background:#691C32;">
            <div class="stat-num" style="color:#C8A84B;">{{ $global_pct }}%</div>
            <div class="stat-lbl" style="color:#fff;">OCUPACIÓN GLOBAL</div>
        </div>
    </div>
</div>

{{-- ── TABLA POR ESTACIONAMIENTO ── --}}
<div class="cdmx-card">
    <div style="font-weight:800;color:#691C32;font-size:1rem;margin-bottom:16px;">
        Detalle por Estacionamiento
    </div>

    <div style="overflow-x:auto;">
        <table class="rep-table">
            <thead>
                <tr>
                    <th>Estacionamiento</th>
                    <th style="text-align:center;">Total</th>
                    <th style="text-align:center;">Libres</th>
                    <th style="text-align:center;">Ocupados</th>
                    <th style="text-align:center;">Reservados</th>
                    <th style="min-width:140px;">% Ocupación</th>
                    <th style="min-width:140px;">% Disponible</th>
                    <th style="text-align:center;">Estado</th>
                </tr>
            </thead>
            <tbody>
                @foreach($resumen as $row)
                <tr>
                    <td>
                        <div style="font-weight:700;color:#691C32;">{{ $row['nombre'] }}</div>
                        <div style="font-size:11px;color:#9e7a83;font-family:monospace;">Piso {{ $row['piso'] }}</div>
                    </td>
                    <td style="text-align:center;font-weight:700;">{{ $row['total'] }}</td>
                    <td style="text-align:center;">
                        <span class="badge-lib">{{ $row['libres'] }}</span>
                    </td>
                    <td style="text-align:center;">
                        <span class="badge-ocu">{{ $row['ocupados'] }}</span>
                    </td>
                    <td style="text-align:center;">
                        <span class="badge-res">{{ $row['reservados'] }}</span>
                    </td>
                    <td>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <div class="bar-wrap">
                                <div class="bar-fill-ocu" style="width:{{ $row['pct_ocupado'] }}%"></div>
                            </div>
                            <span style="font-weight:700;color:#691C32;font-size:13px;min-width:38px;">
                                {{ $row['pct_ocupado'] }}%
                            </span>
                        </div>
                    </td>
                    <td>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <div class="bar-wrap">
                                <div class="bar-fill-lib" style="width:{{ $row['pct_libre'] }}%"></div>
                            </div>
                            <span style="font-weight:700;color:#1b5e20;font-size:13px;min-width:38px;">
                                {{ $row['pct_libre'] }}%
                            </span>
                        </div>
                    </td>
                    <td style="text-align:center;">
                        @if($row['pct_ocupado'] >= 90)
                            <span style="background:#691C32;color:#fff;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">LLENO</span>
                        @elseif($row['pct_ocupado'] >= 70)
                            <span style="background:#C8A84B;color:#fff;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">ALTO</span>
                        @else
                            <span style="background:#2e7d32;color:#fff;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">NORMAL</span>
                        @endif
                    </td>
                </tr>
                @endforeach
            </tbody>
            {{-- Fila total --}}
            <tfoot>
                <tr style="background:#f9f0f2;">
                    <td style="font-weight:800;color:#691C32;">TOTAL GLOBAL</td>
                    <td style="text-align:center;font-weight:800;">{{ $global_total }}</td>
                    <td style="text-align:center;font-weight:800;color:#1b5e20;">{{ $global_libres }}</td>
                    <td style="text-align:center;font-weight:800;color:#691C32;">{{ $global_ocupados }}</td>
                    <td style="text-align:center;font-weight:800;color:#6b4f00;">{{ $global_reservados }}</td>
                    <td colspan="3" style="font-weight:800;color:#691C32;">{{ $global_pct }}% ocupación global</td>
                </tr>
            </tfoot>
        </table>
    </div>

    @if($global_pct >= 90)
    <div class="alerta">
        ⚠️ <strong>Ocupación crítica:</strong> El sistema global está al {{ $global_pct }}% de capacidad.
    </div>
    @endif
</div>

{{-- ── GRÁFICA DE BARRAS SVG ── --}}
<div class="cdmx-card">
    <div style="font-weight:800;color:#691C32;font-size:1rem;margin-bottom:20px;">
        Gráfica de Ocupación por Estacionamiento
    </div>

    @php
        $maxTotal = collect($resumen)->max('total') ?: 1;
        $barW = 60; $barGap = 30; $chartH = 200; $chartPadL = 40; $chartPadB = 60;
        $svgW = count($resumen) * ($barW * 3 + $barGap + 10) + $chartPadL + 20;
    @endphp

    <div style="overflow-x:auto;">
    <svg width="{{ $svgW }}" height="{{ $chartH + $chartPadB + 20 }}" xmlns="http://www.w3.org/2000/svg"
         style="font-family:monospace;">

        {{-- Líneas de guía horizontales --}}
        @foreach([0,25,50,75,100] as $pct)
            @php $y = $chartH - ($pct / 100 * $chartH); @endphp
            <line x1="{{ $chartPadL }}" y1="{{ $y }}" x2="{{ $svgW - 10 }}" y2="{{ $y }}"
                stroke="#f0e4e8" stroke-width="1" stroke-dasharray="4,3"/>
            <text x="{{ $chartPadL - 6 }}" y="{{ $y + 4 }}"
                text-anchor="end" font-size="9" fill="#9e7a83">{{ $pct }}%</text>
        @endforeach

        @foreach($resumen as $i => $row)
            @php
                $groupX = $chartPadL + $i * ($barW * 3 + $barGap + 10) + 10;
                $hOcu = $row['total'] > 0 ? round(($row['ocupados']  / $row['total']) * $chartH) : 0;
                $hLib = $row['total'] > 0 ? round(($row['libres']    / $row['total']) * $chartH) : 0;
                $hRes = $row['total'] > 0 ? round(($row['reservados']/ $row['total']) * $chartH) : 0;
            @endphp

            {{-- Barra Ocupados --}}
            <rect x="{{ $groupX }}" y="{{ $chartH - $hOcu }}"
                width="{{ $barW }}" height="{{ $hOcu }}"
                fill="#691C32" rx="3"/>
            <text x="{{ $groupX + $barW/2 }}" y="{{ $chartH - $hOcu - 4 }}"
                text-anchor="middle" font-size="9" fill="#691C32" font-weight="700">
                {{ $row['ocupados'] }}
            </text>

            {{-- Barra Libres --}}
            <rect x="{{ $groupX + $barW + 4 }}" y="{{ $chartH - $hLib }}"
                width="{{ $barW }}" height="{{ $hLib }}"
                fill="#2e7d32" rx="3"/>
            <text x="{{ $groupX + $barW + 4 + $barW/2 }}" y="{{ $chartH - $hLib - 4 }}"
                text-anchor="middle" font-size="9" fill="#2e7d32" font-weight="700">
                {{ $row['libres'] }}
            </text>

            {{-- Barra Reservados --}}
            <rect x="{{ $groupX + $barW*2 + 8 }}" y="{{ $chartH - $hRes }}"
                width="{{ $barW }}" height="{{ $hRes }}"
                fill="#C8A84B" rx="3"/>
            <text x="{{ $groupX + $barW*2 + 8 + $barW/2 }}" y="{{ $chartH - $hRes - 4 }}"
                text-anchor="middle" font-size="9" fill="#C8A84B" font-weight="700">
                {{ $row['reservados'] }}
            </text>

            {{-- Etiqueta nombre --}}
            <text x="{{ $groupX + $barW * 1.5 + 4 }}" y="{{ $chartH + 16 }}"
                text-anchor="middle" font-size="8.5" fill="#691C32" font-weight="700">
                Est. {{ $row['piso'] }}
            </text>
            <text x="{{ $groupX + $barW * 1.5 + 4 }}" y="{{ $chartH + 28 }}"
                text-anchor="middle" font-size="7.5" fill="#9e7a83">
                {{ $row['pct_ocupado'] }}% ocup.
            </text>
        @endforeach

        {{-- Eje X --}}
        <line x1="{{ $chartPadL }}" y1="{{ $chartH }}" x2="{{ $svgW - 10 }}" y2="{{ $chartH }}"
            stroke="#691C32" stroke-width="1.5"/>

        {{-- Leyenda --}}
        @php $legY = $chartH + 50; @endphp
        <rect x="{{ $chartPadL }}" y="{{ $legY }}" width="10" height="10" fill="#691C32" rx="2"/>
        <text x="{{ $chartPadL + 14 }}" y="{{ $legY + 9 }}" font-size="9" fill="#691C32">Ocupados</text>

        <rect x="{{ $chartPadL + 75 }}" y="{{ $legY }}" width="10" height="10" fill="#2e7d32" rx="2"/>
        <text x="{{ $chartPadL + 89 }}" y="{{ $legY + 9 }}" font-size="9" fill="#2e7d32">Libres</text>

        <rect x="{{ $chartPadL + 140 }}" y="{{ $legY }}" width="10" height="10" fill="#C8A84B" rx="2"/>
        <text x="{{ $chartPadL + 154 }}" y="{{ $legY + 9 }}" font-size="9" fill="#C8A84B">Reservados</text>
    </svg>
    </div>
</div>

</x-filament-panels::page>
