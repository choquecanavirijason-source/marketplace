<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificado No Válido - Sistema de Validación</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary-color: #2E7D32;
            --primary-light: #4CAF50;
            --primary-dark: #1B5E20;
            --danger-color: #d32f2f;
            --danger-light: #f44336;
            --danger-dark: #c62828;
            --warning-color: #ff9800;
            --accent-color: #FFC107;
            --text-dark: #333333;
            --text-light: #757575;
            --background: #f9f9f9;
            --card-bg: #ffffff;
            --shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            --radius: 12px;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
            color: var(--text-dark);
            line-height: 1.6;
            min-height: 100vh;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .logo {
            font-size: 2.5rem;
            color: var(--danger-color);
            margin-bottom: 15px;
        }

        .title {
            color: var(--danger-dark);
            font-size: 2.2rem;
            margin-bottom: 10px;
            font-weight: 700;
        }

        .subtitle {
            color: var(--text-light);
            font-size: 1.1rem;
            margin-bottom: 30px;
        }

        .status-card {
            background-color: var(--card-bg);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            padding: 30px;
            margin-bottom: 30px;
            text-align: center;
            border-left: 5px solid var(--danger-color);
        }

        .status-icon {
            font-size: 4rem;
            color: var(--danger-color);
            margin-bottom: 20px;
        }

        .status-title {
            font-size: 1.8rem;
            color: var(--danger-dark);
            margin-bottom: 15px;
        }

        .status-message {
            font-size: 1.2rem;
            color: var(--text-light);
            margin-bottom: 10px;
        }

        .status-reason {
            background-color: #ffebee;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            color: var(--danger-dark);
            font-weight: 500;
        }

        .certificate-card {
            background-color: var(--card-bg);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            padding: 30px;
            margin-bottom: 30px;
            position: relative;
            overflow: hidden;
            opacity: 0.8;
        }

        .certificate-card::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 5px;
            background: linear-gradient(90deg, var(--danger-color), var(--warning-color));
        }

        .certificate-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e0e0e0;
        }

        .certificate-title {
            font-size: 1.5rem;
            color: var(--text-dark);
            font-weight: 600;
        }

        .certificate-badge {
            background-color: var(--danger-color);
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
        }

        .certificate-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }

        .info-group {
            margin-bottom: 15px;
        }

        .info-label {
            font-size: 0.9rem;
            color: var(--text-light);
            margin-bottom: 5px;
            font-weight: 500;
        }

        .info-value {
            font-size: 1.1rem;
            color: var(--text-dark);
            font-weight: 600;
        }

        .info-value.invalid {
            color: var(--danger-color);
            text-decoration: line-through;
        }

        .highlight {
            color: var(--danger-color);
        }

        .actions {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 30px;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 12px 25px;
            border-radius: 50px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            cursor: pointer;
            border: none;
            font-size: 1rem;
        }

        .btn-primary {
            background-color: var(--primary-color);
            color: white;
        }

        .btn-primary:hover {
            background-color: var(--primary-dark);
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(46, 125, 50, 0.3);
        }

        .btn-secondary {
            background-color: transparent;
            color: var(--danger-color);
            border: 2px solid var(--danger-color);
        }

        .btn-secondary:hover {
            background-color: rgba(211, 47, 47, 0.1);
            transform: translateY(-2px);
        }

        .btn i {
            margin-right: 8px;
        }

        .footer {
            text-align: center;
            margin-top: 40px;
            color: var(--text-light);
            font-size: 0.9rem;
        }

        .watermark {
            position: absolute;
            bottom: 20px;
            right: 20px;
            opacity: 0.1;
            font-size: 5rem;
            color: var(--danger-color);
            transform: rotate(-15deg);
        }

        @media (max-width: 768px) {
            .certificate-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }

            .actions {
                flex-direction: column;
            }

            .btn {
                width: 100%;
            }

            .title {
                font-size: 1.8rem;
            }

            .status-icon {
                font-size: 3rem;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="status-card">
            <div class="status-icon">
                <i class="fas fa-times-circle"></i>
            </div>
            <h2 class="status-title">Certificado No Válido</h2>
            <p class="status-message">{{ $message }}</p>
            
            @if(isset($reason))
            <div class="status-reason">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>Motivo:</strong> {{ $reason }}
            </div>
            @endif
        </div>

        <div class="certificate-card">
            <div class="watermark">
                <i class="fas fa-ban"></i>
            </div>

            <div class="certificate-header">
                <h2 class="certificate-title">Detalles del Certificado</h2>
                <span class="certificate-badge">NO VÁLIDO</span>
            </div>

            <div class="certificate-info">
                <div class="info-group">
                    <div class="info-label">ID del Certificado</div>
                    <div class="info-value invalid">{{ $certificate->id }}</div>
                </div>

                <div class="info-group">
                    <div class="info-label">Título del Certificado</div>
                    <div class="info-value">{{ $certificate->title }}</div>
                </div>

                <div class="info-group">
                    <div class="info-label">Certifican a:</div>
                    <div class="info-value">
                        @if(isset($user) && $user)
                            {{ $user->name }}
                        @elseif(isset($certificate->pivot) && $certificate->pivot->external_person_name)
                            {{ $certificate->pivot->external_person_name }}
                        @else
                            No especificado
                        @endif
                    </div>
                </div>

                <div class="info-group">
                    <div class="info-label">Descripción</div>
                    <div class="info-value">{{ $certificate->description ?? 'Sin descripción' }}</div>
                </div>

                @if($certificate->issue_date)
                <div class="info-group">
                    <div class="info-label">Fecha de Emisión</div>
                    <div class="info-value">{{ $certificate->issue_date->format('d/m/Y') }}</div>
                </div>
                @endif

                @if($certificate->expiration_date)
                <div class="info-group">
                    <div class="info-label">Fecha de Expiración</div>
                    <div class="info-value invalid">{{ $certificate->expiration_date->format('d/m/Y') }}</div>
                </div>
                @endif

                <div class="info-group">
                    <div class="info-label">Fecha de Registro</div>
                    <div class="info-value">{{ $certificate->created_at->format('d/m/Y H:i:s') }}</div>
                </div>
            </div>

            @if(isset($suggestions))
            <div style="margin-top: 20px; padding: 15px; background-color: #fff3e0; border-radius: 8px;">
                <h4 style="color: var(--warning-color); margin-bottom: 10px;">
                    <i class="fas fa-lightbulb"></i> Sugerencias:
                </h4>
                <ul style="margin-left: 20px; color: var(--text-dark);">
                    @foreach($suggestions as $suggestion)
                        <li>{{ $suggestion }}</li>
                    @endforeach
                </ul>
            </div>
            @endif
        </div>

        <div class="actions">
            <a href="{{ url('/') }}" class="btn btn-primary">
                <i class="fas fa-home"></i> Volver al Inicio
            </a>
            <a href="{{ url('/contacto') }}" class="btn btn-secondary">
                <i class="fas fa-envelope"></i> Contactar Soporte
            </a>
        </div>

        <div class="footer">
            <p>Sistema de Validación de Certificados Colegio de Topógrafos Cochabamba &copy; {{ date('Y') }}</p>
            <p>Para consultas, contacte al administrador del sistema</p>
        </div>
    </div>
</body>

</html>