<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Afiliado No Habilitado</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        /* Reutilizamos estilos similares pero con color de alerta */
        :root { --error-color: #D32F2F; --primary-color: #1E4678; }
        body { font-family: 'Segoe UI', sans-serif; background: #fdf2f2; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
        .card { background: white; border-radius: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 100%; max-width: 400px; overflow: hidden; text-align: center; }
        .header { background: var(--error-color); padding: 30px; color: white; }
        .body { padding: 30px; }
        .warning-icon { font-size: 50px; color: var(--error-color); margin-bottom: 15px; }
        .btn { display: block; background: var(--primary-color); color: white; text-decoration: none; padding: 12px; border-radius: 8px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <h1 style="margin:0; font-size: 1.2rem;">ESTADO: NO HABILITADO</h1>
        </div>
        <div class="body">
            <i class="fas fa-user-slash warning-icon"></i>
            <h2>{{ $user->fullName }}</h2>
            <p style="color: #666;">El profesional indicado se encuentra actualmente en estado de <strong>BAJA</strong> o no cuenta con la habilitación vigente.</p>
            <div style="background: #fee2e2; color: #b91c1c; padding: 10px; border-radius: 5px; margin: 20px 0; font-weight: bold;">
                REGISTRO INACTIVO
            </div>
            <a href="{{ url('/') }}" class="btn">Volver al Inicio</a>
        </div>
    </div>
</body>
</html>