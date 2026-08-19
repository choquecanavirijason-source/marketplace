@extends('emails.layouts.base')

@section('title', 'Restablecer Contraseña - ' . config('app.name'))
@section('header_title', 'Restablecer Contraseña')

@section('content')

<p>Hola,</p>

<p>Has recibido este correo porque realizaste una solicitud de restablecimiento de contraseña para tu cuenta en <strong>{{ config('app.name') }}</strong>.</p>

<div style="text-align: center; margin: 30px 0;">
    <a href="{{ url('/reset-password/'.$token) }}" style="display: inline-block; padding: 14px 28px; background-color: #10b981; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        🔐 Restablecer Contraseña
    </a>
</div>

<div class="details-card" style="background-color: #fef3c7; border-left-color: #f59e0b;">
    <p style="margin: 0; font-size: 14px;">
        ⚠️ <strong>Este enlace expirará en 60 minutos</strong><br>
        Por seguridad, el enlace es de un solo uso.
    </p>
</div>

<p>Si no realizaste esta solicitud, puedes ignorar este correo. Tu contraseña no será cambiada a menos que accedas al enlace y completes el proceso.</p>

<hr>

<div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 13px; word-break: break-all;">
    <strong>⚠️ Si el botón no funciona, copia y pega este enlace en tu navegador:</strong><br>
    <a href="{{ url('/reset-password/'.$token) }}" style="color: #10b981; word-break: break-all;">
        {{ url('/reset-password/'.$token) }}
    </a>
</div>

<p style="margin-top: 20px; color: #666;">
    Si tienes problemas para restablecer tu contraseña, no dudes en contactar a nuestro equipo de soporte.
</p>

<div style="margin-top: 20px; text-align: center;">
    <a href="{{ url('/contacto') }}" style="display: inline-block; padding: 12px 24px; background-color: #6c757d; color: #ffffff !important; text-decoration: none; border-radius: 4px; font-weight: bold;">
        🔒 Contactar Soporte
    </a>
</div>

<p style="margin-top: 20px; color: #666;">
    ¡Gracias por formar parte de {{ config('app.name') }}!
</p>

@endsection