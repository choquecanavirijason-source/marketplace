@extends('emails.layouts.base')

@section('title', $subject . ' - ' . config('app.name'))
@section('header_title', $subject)

@section('content')

<p>Hola <strong>{{ $user->name ?? 'Estimado/a' }}</strong>,</p>

@switch($status)
    @case('confirmación')
        <p>¡Excelente noticia! Te confirmamos que hemos recibido tu pago correctamente.</p>
        @break
    @case('rechazo')
        <div class="alert alert-warning">
            <strong>⚠️ Importante:</strong> Lamentamos informarte que tu pago ha sido rechazado.
        </div>
        @break
    @default
        <p>Se ha registrado una notificación de pago en el sistema.</p>
@endswitch

<div class="details-card">
    <h3 style="margin-bottom: 15px;">📋 Detalles del Pago</h3>
    
    <div class="details-grid">
        <div class="details-label"><strong>N° Comprobante:</strong></div>
        <div class="details-value">#{{ $payment->id }}</div> <hr>
        
        <div class="details-label"><strong>Fecha:</strong></div>
        <div class="details-value">{{ $payment->created_at->format('d/m/Y H:i:s') }}</div><hr>
        
        <div class="details-label"><strong>Tipo de Pago:</strong></div>
        <div class="details-value">
            <span class="status-badge status-success">
                {{ $paymentTypes[$payment->payment_type] ?? 'Otros' }}
            </span>
        </div><hr>
        
        @if($payment->payment_type == 1)
            <div class="details-label"><strong>Periodo:</strong></div>
            <div class="details-value">{{ $payment->payment_year }} - {{ str_pad($payment->payment_month, 2, '0', STR_PAD_LEFT) }}</div><hr>
        @endif
        
        <div class="details-label"><strong>Método de Pago:</strong></div>
        <div class="details-value">{{ $payment->payment_method == 'cash' ? '💵 Efectivo' : '📱 QR' }}</div><hr>
        
        
        @if($payment->observation)
            <div class="details-label"><strong>Observaciones:</strong></div>
            <div class="details-value">{{ $payment->observation }}</div><hr>
        @endif
    </div>
    
    <div class="amount">
        Total: Bs. {{ number_format($payment->amount, 2, ',', '.') }}
    </div>
</div>

@if($status == 'confirmación')
    @if(!isset($pdf_error))
        <div class="alert" style="background-color: #d4edda; border-color: #c3e6cb;">
            📎 <strong>Adjunto encontrarás</strong> el comprobante de pago en formato PDF.
        </div>
    @else
        <div class="alert alert-warning">
            ⚠️ No se pudo generar el comprobante PDF automáticamente.<br>
            Puedes descargarlo desde el <a href="{{ config('app.url') }}/payments/{{ $payment->id }}">sistema</a>.
        </div>
    @endif
@endif

@if($status == 'rechazo')
    <div class="details-card">
        <h4>🔍 ¿Qué puedo hacer?</h4>
        <ul style="margin-left: 20px; margin-top: 10px;">
            <li>Verifica los datos de tu tarjeta/cuenta</li>
            <li>Contacta a tu banco para más información</li>
            <li>Intenta realizar el pago nuevamente</li>
        </ul>
    </div>
@endif

<hr>

<p>Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos:</p>

<div style="margin-top: 20px; text-align: center;">
    <a href="{{ url('/contacto') }}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold;">
        📧 Contactar Soporte
    </a>
</div>

<p style="margin-top: 20px; color: #666;">
    ¡Gracias por confiar en nosotros!
</p>
@endsection