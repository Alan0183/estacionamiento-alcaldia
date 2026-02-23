<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'DejaVu Sans', sans-serif; color: #3b1a22; background: #fff; padding: 28px; }

    /* Header */
    .header { border-bottom: 3px solid #691C32; padding-bottom: 14px; margin-bottom: 20px;
               display: flex; align-items: center; justify-content: space-between; }
    .strip-wrap { display: flex; gap: 0; }
    .strip-top    { width: 7px; height: 24px; background: #691C32; border-radius: 2px 2px 0 0; }
    .strip-bottom { width: 7px; height: 9px;  background: #C8A84B; border-radius: 0 0 2px 2px; }
    .title        { font-size: 18px; font-weight: bold; color: #691C32; }
    .subtitle     { font-size: 9px; color: #C8A84B; letter-spacing: 2px; margin-top: 2px; }
    .meta         { font-size: 10px; color: #9e7a83; text-align: right; }

    /* Global cards */
    .stat-grid { display: table; width: 100%; margin-bottom: 20px; }
    .stat-cell { display: table-cell; width: 20%; padding: 4px; }
    .stat-box  { border-radius: 8px; padding: 12px; text-align: center; border: 1px solid; }
    .stat-num  { font-size: 22px; font-weight: bold; line-height: 1; }
    .stat-lbl  { font-size: 9px; letter-spacing: 1px; margin-top: 4px; }

    /* Table */
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px; }
    thead th {
        background: #691C32; color: #fff;
        padding: 8px 10px; text-align: left;
        font-size: 10px; letter-spacing: 0.5px;
    }
    tbody td { padding: 8px 10px; border-bottom: 1px solid #f0e4e8; }
    tbody tr:last-child td { border-bottom: none; }
    tfoot td { padding: 8px 10px; background: #faeaee; font-weight: bold; color: #691C32; }

    .badge-ocu { background: #faeaee; color: #691C32; padding: 2px 7px;
                 border-radius: 10px; font-size: 10px; font-weight: bold; }
    .badge-lib { background: #eaf3eb; color: #1b5e20; padding: 2px 7px;
                 border-radius: 10px; font-size: 10px; font-weight: bold; }
    .badge-res { background: #fdf8ec; color: #6b4f00; padding: 2px 7px;
                 border-radius: 10px; font-size: 10px; font-weight: bold; }

    /* Bar */
    .bar-bg   { background: #f0e4e8; border-radius: 3px; height: 8px; width: 100%; }
    .bar-ocu  { background: #691C32; height: 8px; border-radius: 3px; }
    .bar-lib  { background: #2e7d32; height: 8px; border-radius: 3px; }

    .estado-lleno  { background: #691C32; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 9px; }
    .estado-alto   { background: #C8A84B; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 9px; }
    .estado-normal { background: #2e7d32; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 9px; }

    /* Footer */
    .footer { margin-top: 24px; border-top: 1px solid #f0e4e8; padding-top: 10px;
               font-size: 9px; color: #9e7a83; text-align: center; }
</style>
</head>
<body>

{{-- HEADER --}}
<div class="header">
    <div style="display:flex;align-items:center;gap:12px;">
        <div class="strip-wrap" style="flex-direction:column;">
            <div class="strip-top"></div>
            <div class="strip-bottom"></div>
        </div>
        <div>
            <div class="title">Reporte de Ocupación</div>
            <div class="subtitle">GOBIERNO DE LA CIUDAD DE MÉXICO</div>
        </div>
    </div>
    <div class="meta">
        Generado: {{ $generado_en }}<br>
        Sistema de Estacionamientos
    </div>
</div>

{{-- ESTADÍSTICAS GLOBALES --}}
<div class="stat-grid">
    <div class="stat-cell">
        <div class="stat-box" style="border-color:#691C32;background:#faeaee;">
            <div class="stat-num" style="color:#691C32;">{{ $global_total }}</div>
            <div class="stat-lbl" style="color:#691C32;">TOTALES</div>
        </div>
    </div>
    <div class="stat-cell">
        <div class="stat-box" style="border-color:#8B2442;background:#faeaee;">
            <div class="stat-num" style="color:#8B2442;">{{ $global_ocupados }}</div>
            <div class="stat-lbl" style="color:#8B2442;">OCUPADOS</div>
        </div>
    </div>
    <div class="stat-cell">
        <div class="stat-box" style="border-color:#2e7d32;background:#eaf3eb;">
            <div class="stat-num" style="color:#1b5e20;">{{ $global_libres }}</div>
            <div class="stat-lbl" style="color:#1b5e20;">LIBRES</div>
        </div>
    </div>
    <div class="stat-cell">
        <div class="stat-box" style="border-color:#C8A84B;background:#fdf8ec;">
            <div class="stat-num" style="color:#6b4f00;">{{ $global_reservados }}</div>
            <div class="stat-lbl" style="color:#6b4f00;">RESERVADOS</div>
        </div>
    </div>
    <div class="stat-cell">
        <div class="stat-box" style="border-color:#691C32;background:#691C32;">
            <div class="stat-num" style="color:#C8A84B;">{{ $global_pct }}%</div>
            <div class="stat-lbl" style="color:#fff;">OCUPACIÓN</div>
        </div>
    </div>
</div>

{{-- TABLA --}}
<table>
    <thead>
        <tr>
            <th>Estacionamiento</th>
            <th style="text-align:center;">Total</th>
            <th style="text-align:center;">Libres</th>
            <th style="text-align:center;">Ocupados</th>
            <th style="text-align:center;">Reservados</th>
            <th>% Ocupación</th>
            <th>% Disponible</th>
            <th style="text-align:center;">Estado</th>
        </tr>
    </thead>
    <tbody>
        @foreach($resumen as $row)
        <tr>
            <td>
                <strong style="color:#691C32;">{{ $row['nombre'] }}</strong><br>
                <span style="font-size:9px;color:#9e7a83;">Piso {{ $row['piso'] }}</span>
            </td>
            <td style="text-align:center;font-weight:bold;">{{ $row['total'] }}</td>
            <td style="text-align:center;"><span class="badge-lib">{{ $row['libres'] }}</span></td>
            <td style="text-align:center;"><span class="badge-ocu">{{ $row['ocupados'] }}</span></td>
            <td style="text-align:center;"><span class="badge-res">{{ $row['reservados'] }}</span></td>
            <td style="width:90px;">
                <div class="bar-bg">
                    <div class="bar-ocu" style="width:{{ $row['pct_ocupado'] }}%;"></div>
                </div>
                <span style="font-size:10px;font-weight:bold;color:#691C32;">{{ $row['pct_ocupado'] }}%</span>
            </td>
            <td style="width:90px;">
                <div class="bar-bg">
                    <div class="bar-lib" style="width:{{ $row['pct_libre'] }}%;"></div>
                </div>
                <span style="font-size:10px;font-weight:bold;color:#1b5e20;">{{ $row['pct_libre'] }}%</span>
            </td>
            <td style="text-align:center;">
                @if($row['pct_ocupado'] >= 90)
                    <span class="estado-lleno">LLENO</span>
                @elseif($row['pct_ocupado'] >= 70)
                    <span class="estado-alto">ALTO</span>
                @else
                    <span class="estado-normal">NORMAL</span>
                @endif
            </td>
        </tr>
        @endforeach
    </tbody>
    <tfoot>
        <tr>
            <td>TOTAL GLOBAL</td>
            <td style="text-align:center;">{{ $global_total }}</td>
            <td style="text-align:center;color:#1b5e20;">{{ $global_libres }}</td>
            <td style="text-align:center;color:#691C32;">{{ $global_ocupados }}</td>
            <td style="text-align:center;color:#6b4f00;">{{ $global_reservados }}</td>
            <td colspan="3">{{ $global_pct }}% ocupación global</td>
        </tr>
    </tfoot>
</table>

<div class="footer">
    Sistema de Estacionamientos — Gobierno de la Ciudad de México · {{ $generado_en }}
</div>

</body>
</html>
