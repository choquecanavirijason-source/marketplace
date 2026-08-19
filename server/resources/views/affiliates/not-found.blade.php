<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro No Encontrado - CTB</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --error-color: #546E7A; /* Un color neutro/grisáceo para "no encontrado" */
            --primary-color: #1E4678;
            --text-dark: #333333;
            --background: #eceff1;
        }
        body { 
            font-family: 'Segoe UI', sans-serif; 
            background: var(--background); 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh; 
            margin: 0; 
        }
        .card { 
            background: white; 
            border-radius: 15px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
            width: 90%; 
            max-width: 400px; 
            overflow: hidden; 
            text-align: center; 
        }
        .header { 
            background: var(--error-color); 
            padding: 25px; 
            color: white; 
        }
        .body { padding: 30px; }
        .icon-box { 
            font-size: 60px; 
            color: var(--error-color); 
            margin-bottom: 20px; 
        }
        .msg-title { font-size: 1.4rem; color: var(--text-dark); margin-bottom: 10px; }
        .msg-text { color: #666; font-size: 0.95rem; line-height: 1.5; }
        .info-box {
            background: #f8f9fa;
            border-left: 4px solid var(--error-color);
            padding: 15px;
            text-align: left;
            margin: 20px 0;
            font-size: 0.85rem;
        }
        .btn { 
            display: block; 
            background: var(--primary-color); 
            color: white; 
            text-decoration: none; 
            padding: 12px; 
            border-radius: 8px; 
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <h1 style="margin:0; font-size: 1.2rem;">ERROR DE VERIFICACIÓN</h1>
        </div>
        <div class="body">
            <div class="icon-box">
                <i class="fas fa-search-minus"></i>
            </div>
            <h2 class="msg-title">Registro No Encontrado</h2>
            <p class="msg-text">
                El código de afiliado escaneado no coincide con ningún profesional registrado en nuestra base de datos oficial.
            </p>
            
            <div class="info-box">
                <strong>Sugerencias:</strong>
                <ul style="margin: 10px 0 0 15px; padding: 0;">
                    <li>Verifique que el código sea correcto.</li>
                    <li>Asegúrese de que el carnet sea original.</li>
                    <li>Contacte con el Colegio de Topógrafos si cree que es un error.</li>
                </ul>
            </div>

            <a href="{{ url('/') }}" class="btn">Volver al Inicio</a>
        </div>
    </div>
</body>
</html>