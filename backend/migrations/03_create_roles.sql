CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codename VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) NOT NULL UNIQUE,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

INSERT INTO roles (codename, name, description, is_system)
VALUES 
    ('superadmin', 'Super Administrador', 'Control total del sistema', TRUE),
    ('admin', 'Administrador', 'Administración general', TRUE),
    ('seller_company', 'Vendedor Empresa', 'Vendedor corporativo verificado', TRUE),
    ('seller_individual', 'Vendedor Individual', 'Vendedor particular', TRUE),
    ('seller', 'Vendedor Base', 'Rol base de vendedor', TRUE),
    ('buyer', 'Comprador', 'Cliente comprador estándar', TRUE),
    ('support', 'Soporte Operativo', 'Mesa de ayuda y resolución de reclamos', TRUE),
    ('finance', 'Finanzas & Riesgo', 'Gestión de cobros y conciliación', TRUE)
ON CONFLICT (codename) DO NOTHING;
