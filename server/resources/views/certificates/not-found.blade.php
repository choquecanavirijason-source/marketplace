<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificado No Encontrado - Sistema de Validación</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --error-color: #D32F2F;
            --error-light: #EF5350;
            --error-dark: #C62828;
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
            max-width: 700px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .logo {
            font-size: 2.5rem;
            color: var(--error-color);
            margin-bottom: 15px;
        }
        
        .title {
            color: var(--error-dark);
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
            border-left: 5px solid var(--error-color);
            position: relative;
            overflow: hidden;
        }
        
        .status-icon {
            font-size: 4rem;
            color: var(--error-color);
            margin-bottom: 25px;
        }
        
        .status-title {
            font-size: 1.8rem;
            color: var(--error-dark);
            margin-bottom: 20px;
        }
        
        .status-message {
            font-size: 1.2rem;
            color: var(--text-light);
            margin-bottom: 15px;
            line-height: 1.8;
        }
        
        .error-details {
            background-color: #FFEBEE;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: left;
        }
        
        .error-code {
            display: inline-block;
            background-color: var(--error-color);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            margin-top: 10px;
        }
        
        .suggestions {
            background-color: #FFF8E1;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: left;
        }
        
        .suggestions-title {
            color: var(--error-dark);
            font-size: 1.1rem;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .suggestions-list {
            padding-left: 20px;
        }
        
        .suggestions-list li {
            margin-bottom: 10px;
            color: var(--text-light);
        }
        
        .watermark {
            position: absolute;
            bottom: 20px;
            right: 20px;
            opacity: 0.1;
            font-size: 5rem;
            color: var(--error-color);
            transform: rotate(-15deg);
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
            background-color: var(--error-color);
            color: white;
        }
        
        .btn-primary:hover {
            background-color: var(--error-dark);
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(211, 47, 47, 0.3);
        }
        
        .btn-secondary {
            background-color: transparent;
            color: var(--error-color);
            border: 2px solid var(--error-color);
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
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="status-card">
            <div class="watermark">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            
            <div class="status-icon">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <h2 class="status-title">Certificado No Encontrado</h2>
            <p class="status-message">{{ $message }}</p>
            <p class="status-message">El código proporcionado no corresponde a ningún certificado en nuestro sistema.</p>
            
            <div class="error-details">
                <p><strong>Posibles causas:</strong></p>
                <ul class="suggestions-list">
                    <li>El código del certificado puede haber sido ingresado incorrectamente</li>
                    <li>El certificado puede no estar registrado en nuestro sistema</li>
                    <li>El certificado puede haber sido eliminado o archivado</li>
                </ul>
                <div class="error-code">Código de error: 404</div>
            </div>
            
            <div class="suggestions">
                <p class="suggestions-title">Sugerencias:</p>
                <ul class="suggestions-list">
                    <li>Verifique que el código del certificado sea correcto</li>
                    <li>Contacte al administrador del sistema si cree que esto es un error</li>
                    <li>Si es un estudiante, comuníquese con su institución educativa</li>
                </ul>
            </div>
        </div>
        
        <div class="actions">
            <a href="{{ url('/') }}" class="btn btn-primary">
                <i class="fas fa-home"></i> Volver al Inicio
            </a>
        </div>
        
        <div class="footer">
            <p>Sistema de Validación de Certificados Colegio de Topografos Cochabamba &copy; {{ date('Y') }}</p>
            <p>Para consultas, contacte al administrador del sistema</p>
        </div>
    </div>
</body>
</html>