<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Afiliado Verificado - CTB</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary-color: #1E4678;
            --success-color: #2E7D32;
            --text-dark: #333333;
            --text-light: #757575;
            --background: #f5f7fa;
            --card-bg: #ffffff;
            --shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        body { font-family: 'Segoe UI', sans-serif; background: var(--background); display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; margin: 0; }
        .card { background: var(--card-bg); border-radius: 15px; box-shadow: var(--shadow); width: 100%; max-width: 400px; overflow: hidden; text-align: center; }
        .header { background: var(--primary-color); padding: 30px; color: white; }
        .profile-img { width: 130px; height: 130px; border-radius: 50%; border: 5px solid white; object-fit: cover; margin-bottom: 15px; background: #eee; }
        .status-badge { background: var(--success-color); color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; margin-bottom: 10px; display: inline-block; }
        .name { font-size: 1.5rem; margin: 0; text-transform: uppercase; font-weight: bold; }
        .body { padding: 25px; text-align: left; }
        .info-row { border-bottom: 1px solid #eee; padding: 10px 0; display: flex; justify-content: space-between; }
        .label { color: var(--text-light); font-weight: bold; font-size: 0.85rem; }
        .value { color: var(--text-dark); font-weight: 600; }
        .footer-status { background: #e8f5e9; color: var(--success-color); padding: 15px; font-weight: bold; text-align: center; font-size: 0.9rem; }
        .btn { display: block; background: var(--primary-color); color: white; text-decoration: none; padding: 12px; border-radius: 8px; margin-top: 20px; text-align: center; font-weight: bold; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <div class="status-badge"><i class="fas fa-check-circle"></i> HABILITADO</div>
            <br>
            @if($user->profile_picture)
                <img src="{{ asset('storage/' . $user->profile_picture) }}" class="profile-img">
            @else
                <img src="{{ asset('images/default-avatar.png') }}" class="profile-img">
            @endif
            <h1 class="name">{{ $user->fullName }}</h1>
        </div>
        <div class="body">
            <div class="info-row">
                <span class="label">C.I.:</span>
                <span class="value">{{ $user->ci }}</span>
            </div>
            <div class="info-row">
                <span class="label">REGISTRO NACIONAL:</span>
                <span class="value">{{ $user->registration_code }}</span>
            </div>
            <div class="info-row">
                <span class="label">COLEGIO SEDE:</span>
                <span class="value">COCHABAMBA</span>
            </div>
            <a href="{{ url('/') }}" class="btn">Volver al Inicio</a>
        </div>
        <div class="footer-status">
            <i class="fas fa-shield-alt"></i> AFILIADO VERIFICADO - CTB
        </div>
    </div>
</body>
</html>