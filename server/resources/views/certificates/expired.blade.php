<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificado Expirado - Sistema de Validación</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --warning-color: #F57C00;
            --warning-light: #FF9800;
            --warning-dark: #EF6C00;
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
            max-width: 750px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .logo {
            font-size: 2.5rem;
            color: var(--warning-color);
            margin-bottom: 15px;
        }
        
        .title {
            color: var(--warning-dark);
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
            padding: 40px 30px;
            margin-bottom: 30px;
            text-align: center;
            border-left: 5px solid var(--warning-color);
            position: relative;
            overflow: hidden;
        }
        
        .status-icon {
            font-size: 4rem;
            color: var(--warning-color);
            margin-bottom: 25px;
        }
        
        .status-title {
            font-size: 1.8rem;
            color: var(--warning-dark);
            margin-bottom: 20px;
        }
        
        .status-message {
            font-size: 1.2rem;
            color: var(--text-light);
            margin-bottom: 15px;
            line-height: 1.8;
        }
        
        .certificate-info {
            background-color: #FFF3E0;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
            text-align: left;
        }
        
        .info-group {
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 10px;
            border-bottom: 1px solid #FFE0B2;
        }
        
        .info-label {
            font-weight: 600;
            color: var(--warning-dark);
            min-width: 150px;
        }
        
        .info-value {
            color: var(--text-dark);
            text-align: right;
        }
        
        .expiry-details {
            background-color: #FFF8E1;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        
        .expiry-title {
            color: var(--warning-dark);
            font-size: 1.1rem;
            margin-bottom: 15px;
            font-weight: 600;
            text-align: center;
        }
        
        .expiry-reasons {
            padding-left: 20px;
        }
        
        .expiry-reasons li {
            margin-bottom: 10px;
            color: var(--text-light);
        }
        
        .warning-badge {
            display: inline-block;
            background-color: var(--warning-color);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            margin-top: 15px;
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
            background-color: var(--warning-color);
            color: white;
        }
        
        .btn-primary:hover {
            background-color: var(--warning-dark);
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(245, 124, 0, 0.3);
        }
        
        .btn-secondary {
            background-color: transparent;
            color: var(--warning-color);
            border: 2px solid var(--warning-color);
        }
        
        .btn-secondary:hover {
            background-color: rgba(245, 124, 0, 0.1);
            transform: translateY(-2px);
        }
        
        .btn i {
            margin-right: 8px;
        }
        
        .watermark {
            position: absolute;
            bottom: 20px;
            right: 20px;
            opacity: 0.1;
            font-size: 5rem;
            color: var(--warning-color);
            transform: rotate(-15deg);
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            color: var(--text-light);
            font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
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
            
            .info-group {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .info-value {
                text-align: left;
                margin-top: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="status-card">
            <div class="watermark">
                <i class="fas fa-clock"></i>
            </div>
            
            <div class="status-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h2 class="status-title">Certificado Expirado o Revocado</h2>
            <p class="status-message">{{ $message }}</p>
            <p class="status-message">Este certificado ya no se encuentra vigente en nuestro sistema.</p>
            
            <!-- Información del certificado (si está disponible) -->
            <div class="certificate-info">
                <div class="info-group">
                    <span class="info-label">Código del Certificado:</span>
                    <span class="info-value">{{ $certificate->id ?? 'N/A' }}</span>
                </div>
                <div class="info-group">
                    <span class="info-label">Certifican a:</span>
                    <span class="info-value">{{ isset($user) && $user->name ? $user->name : $certificate->pivot->external_person_name }}</span>
                </div>
                <div class="info-group">
                    <span class="info-label">Fecha de Emisión:</span>
                    <span class="info-value">{{ isset($certificate->issue_date) ? $certificate->issue_date->format('d/m/Y') : 'N/A' }}</span>
                </div>
                <div class="info-group">
                    <span class="info-label">Fecha de Expiración:</span>
                    <span class="info-value">{{ isset($certificate->expiration_date) ? $certificate->expiration_date->format('d/m/Y') : 'No definida' }}</span>
                </div>
            </div>
            
            <div class="expiry-details">
                <p class="expiry-title">Motivos de expiración o revocación:</p>
                <ul class="expiry-reasons">
                    <li>El certificado ha alcanzado su fecha de expiración</li>
                    <li>El certificado ha sido revocado por la institución emisora</li>
                    <li>El certificado puede haber sido invalidado por actualizaciones del programa</li>
                </ul>
                <div class="warning-badge">Estado: No Válido</div>
            </div>
        </div>
        
        <div class="actions">
            <a href="{{ url('/') }}" class="btn btn-primary">
                <i class="fas fa-home"></i> Volver al Inicio
            </a>
        </div>
        
        <div class="footer">
            <p>Sistema de Validación de Certificados Colegio de Topografos Cochabamba &copy; {{ date('Y') }}</p>
            <p>Para renovar o validar un certificado expirado, contacte al administrador del sistema</p>
        </div>
    </div>
</body>
</html>