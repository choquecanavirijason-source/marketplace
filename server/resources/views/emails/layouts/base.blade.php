<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', config('app.name'))</title>
    <style>
        /* Reset y estilos base */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
        }
        
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .email-container {
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        /* Header */
        .email-header {
            background: linear-gradient(135deg, #39589b 0%, #2c4578 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        
        .email-header h1 {
            font-size: 24px;
            margin-bottom: 10px;
        }
        
        .email-header h2 {
            font-size: 18px;
            font-weight: normal;
            opacity: 0.95;
        }
        
        .logo {
            max-width: 150px;
            margin-bottom: 20px;
        }
        
        /* Content */
        .email-content {
            padding: 40px 30px;
        }
        
        /* Footer */
        .email-footer {
            background-color: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e9ecef;
        }
        
        .email-footer a {
            color: #39589b;
            text-decoration: none;
        }
        
        /* Componentes */
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #39589b;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
        }
        
        .details-card {
            background-color: #f8f9fa;
            border-left: 4px solid #39589b;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        
        .details-grid {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 12px;
            margin: 15px 0;
        }
        
        .details-label {
            font-weight: bold;
            color: #555;
        }
        
        .details-value {
            color: #333;
        }
        
        .amount {
            font-size: 28px;
            color: #28a745;
            font-weight: bold;
            margin: 15px 0;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
        }
        
        .status-success {
            background-color: #d4edda;
            color: #155724;
        }
        
        .status-error {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .status-warning {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .alert {
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }
        
        .alert-warning {
            background-color: #fff3cd;
            border: 1px solid #ffeeba;
            color: #856404;
        }
        
        hr {
            margin: 20px 0;
            border: none;
            border-top: 1px solid #e9ecef;
        }
        
        @media only screen and (max-width: 600px) {
            .email-wrapper {
                padding: 10px;
            }
            
            .email-content {
                padding: 20px;
            }
            
            .details-grid {
                grid-template-columns: 1fr;
                gap: 5px;
            }
        }
    </style>
    @yield('styles')
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <!-- Header -->
            <div class="email-header">
                <img src="{{ asset('/images/logo.png') }}" 
     alt="{{ config('app.name') }}" 
     class="logo"
     width="150"
     height="auto">
                <h1>{{ config('app.name') }}</h1>
                <h2>@yield('header_title')</h2>
            </div>
            
            <!-- Content -->
            <div class="email-content">
                @yield('content')
            </div>
            
            <!-- Footer -->
            <div class="email-footer">
                <p>
                    © {{ date('Y') }} {{ config('app.name') }}. Todos los derechos reservados.<br>
                    Este es un correo automático, por favor no responder.
                </p>
                <p style="margin-top: 10px;">
                    <a href="{{ url('/') }}" target="_blank" style="color: #007bff; text-decoration: underline;">Visitar sitio web</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>