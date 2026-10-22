CREATE TABLE IF NOT EXISTS personas (
    id               SERIAL PRIMARY KEY,
    nombres          VARCHAR(80)  NOT NULL,
    apellidos        VARCHAR(80)  NOT NULL,
    fecha_nacimiento DATE         NOT NULL,
    dni              CHAR(8)      NOT NULL UNIQUE CHECK (dni ~ '^[0-9]{8}$'),
    creado_en        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

INSERT INTO personas (nombres, apellidos, fecha_nacimiento, dni) VALUES
('Eduardo', 'Peña García',   '1985-03-14', '20123456'),
('María',   'Quispe Rojas',  '2003-07-22', '71234567'),
('Luis',    'Huamán Torres', '2001-11-05', '72345678')
ON CONFLICT (dni) DO NOTHING;   -- permite ejecutar el script más de una vez
