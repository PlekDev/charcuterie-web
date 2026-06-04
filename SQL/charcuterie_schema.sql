

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SCHEMA IF NOT EXISTS chaputeria;



-- TIPOS (ENUMs) — todos en el schema chaputeria

CREATE TYPE chaputeria.user_role      AS ENUM ('customer', 'admin');
CREATE TYPE chaputeria.order_status   AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled');
CREATE TYPE chaputeria.payment_method AS ENUM ('transfer', 'cash', 'card');
CREATE TYPE chaputeria.payment_status AS ENUM ('pending', 'submitted', 'verified', 'rejected');
CREATE TYPE chaputeria.delivery_type   AS ENUM ('home', 'pickup', 'external');
CREATE TYPE chaputeria.delivery_status AS ENUM ('pending', 'preparing', 'ready', 'in_transit', 'delivered', 'cancelled');



-- DOMAIN 1: USERS & AUTH

CREATE TABLE chaputeria.users (
                                  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  cognito_id  VARCHAR(255) UNIQUE,           -- = sub del JWT de Cognito
                                  name        VARCHAR(120) NOT NULL,
                                  email       VARCHAR(255) NOT NULL UNIQUE,
                                  phone       VARCHAR(20),
                                  role        chaputeria.user_role NOT NULL DEFAULT 'customer',
                                  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE chaputeria.addresses (
                                      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                      user_id         UUID NOT NULL REFERENCES chaputeria.users(id) ON DELETE CASCADE,
                                      street          VARCHAR(255) NOT NULL,
                                      city            VARCHAR(100) NOT NULL,
                                      state           VARCHAR(100) NOT NULL,
                                      zip_code        VARCHAR(10),
                                      reference_notes TEXT,                       -- antes "references" (palabra reservada)
                                      is_default      BOOLEAN NOT NULL DEFAULT FALSE,
                                      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Solo una direccion default por usuario
CREATE UNIQUE INDEX idx_addresses_default
    ON chaputeria.addresses(user_id)
    WHERE is_default = TRUE;



-- DOMAIN 2: SUPPLIERS
CREATE TABLE chaputeria.suppliers (
                                      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                      name         VARCHAR(150) NOT NULL,
                                      contact_name VARCHAR(120),
                                      email        VARCHAR(255) UNIQUE,
                                      phone        VARCHAR(20),
                                      notes        TEXT,
                                      active       BOOLEAN NOT NULL DEFAULT TRUE,
                                      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



-- DOMAIN 3: PRODUCT CATALOG
CREATE TABLE chaputeria.products (
                                     id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                     name        VARCHAR(150) NOT NULL UNIQUE,   -- el UNIQUE ya crea su indice
                                     description TEXT,
                                     price       NUMERIC(10,2) NOT NULL CHECK (price > 0),
                                     category    VARCHAR(80),
                                     available   BOOLEAN NOT NULL DEFAULT TRUE,
                                     image_url   VARCHAR(500),                   -- URL en Supabase Storage
                                     created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                     updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE chaputeria.inventory_items (
                                            id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                            product_id     UUID NOT NULL REFERENCES chaputeria.products(id)  ON DELETE RESTRICT,
                                            supplier_id    UUID NOT NULL REFERENCES chaputeria.suppliers(id) ON DELETE RESTRICT,
                                            quantity       INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
                                            min_stock      INTEGER NOT NULL DEFAULT 5,
                                            last_restocked TIMESTAMPTZ,
                                            UNIQUE (product_id, supplier_id)            -- 1 registro por par producto-proveedor
);



-- DOMAIN 4: ORDERS
CREATE TABLE chaputeria.orders (
                                   id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                   user_id       UUID NOT NULL REFERENCES chaputeria.users(id) ON DELETE RESTRICT,
                                   address_id    UUID REFERENCES chaputeria.addresses(id) ON DELETE SET NULL,
                                   status        chaputeria.order_status NOT NULL DEFAULT 'pending',
                                   total         NUMERIC(10,2) NOT NULL CHECK (total >= 0),
                                   allergy_notes TEXT,
                                   next_day_prep BOOLEAN NOT NULL DEFAULT FALSE,
                                   scheduled_at  TIMESTAMPTZ,
                                   created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                   updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE chaputeria.order_items (
                                        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                        order_id   UUID NOT NULL REFERENCES chaputeria.orders(id) ON DELETE CASCADE,
                                        product_id UUID NOT NULL REFERENCES chaputeria.products(id) ON DELETE RESTRICT,
                                        quantity   INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
                                        unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price > 0),
                                        UNIQUE (order_id, product_id)               -- mismo producto solo una vez por orden
);



-- DOMAIN 5: PAYMENTS
CREATE TABLE chaputeria.payments (
                                     id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                     order_id    UUID NOT NULL UNIQUE REFERENCES chaputeria.orders(id) ON DELETE CASCADE,
                                     amount      NUMERIC(10,2) NOT NULL CHECK (amount > 0),
                                     method      chaputeria.payment_method NOT NULL DEFAULT 'transfer',
                                     status      chaputeria.payment_status NOT NULL DEFAULT 'pending',
                                     receipt_url TEXT,
                                     paid_at     TIMESTAMPTZ,
                                     created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



-- DOMAIN 6: DELIVERIES
CREATE TABLE chaputeria.deliveries (
                                       id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                       order_id      UUID NOT NULL UNIQUE REFERENCES chaputeria.orders(id) ON DELETE CASCADE,
                                       type          chaputeria.delivery_type NOT NULL,
                                       status        chaputeria.delivery_status NOT NULL DEFAULT 'pending',
                                       tracking_info TEXT,
                                       pickup_time   TIMESTAMPTZ,
                                       delivered_at  TIMESTAMPTZ,
                                       created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



-- INDICES
--   (NO se crean indices para products.name, payments.order_id ni
--    deliveries.order_id: ya los crea su constraint UNIQUE.)

CREATE INDEX idx_orders_user        ON chaputeria.orders(user_id);
CREATE INDEX idx_orders_status      ON chaputeria.orders(status);
CREATE INDEX idx_orders_scheduled   ON chaputeria.orders(scheduled_at);
CREATE INDEX idx_order_items_order  ON chaputeria.order_items(order_id);
CREATE INDEX idx_order_items_product ON chaputeria.order_items(product_id);
CREATE INDEX idx_inventory_product  ON chaputeria.inventory_items(product_id);
CREATE INDEX idx_inventory_supplier ON chaputeria.inventory_items(supplier_id);
CREATE INDEX idx_addresses_user     ON chaputeria.addresses(user_id);



-- TRIGGER — auto updated_at
CREATE OR REPLACE FUNCTION chaputeria.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON chaputeria.users
    FOR EACH ROW EXECUTE FUNCTION chaputeria.set_updated_at();

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON chaputeria.products
    FOR EACH ROW EXECUTE FUNCTION chaputeria.set_updated_at();

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON chaputeria.orders
    FOR EACH ROW EXECUTE FUNCTION chaputeria.set_updated_at();



-- TRIGGER — descuento de inventario al confirmar
--   FIX: el inventario es por (product, supplier), asi que un
--   producto puede tener varias filas. Descontamos FIFO por
--   last_restocked, con FOR UPDATE (lock anti-race) y excepcion
--   clara si no hay stock. SECURITY DEFINER para que funcione
--   sin importar quien confirme.

CREATE OR REPLACE FUNCTION chaputeria.deduct_inventory_on_confirm()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
item      RECORD;
    inv       RECORD;
    remaining INTEGER;
BEGIN
    IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
        FOR item IN
SELECT product_id, quantity
FROM chaputeria.order_items
WHERE order_id = NEW.id
    LOOP
            remaining := item.quantity;

FOR inv IN
SELECT id, quantity
FROM chaputeria.inventory_items
WHERE product_id = item.product_id
ORDER BY last_restocked NULLS FIRST, id
    FOR UPDATE
    LOOP
                EXIT WHEN remaining <= 0;

IF inv.quantity >= remaining THEN
UPDATE chaputeria.inventory_items
SET quantity = quantity - remaining
WHERE id = inv.id;
remaining := 0;
ELSE
UPDATE chaputeria.inventory_items
SET quantity = 0
WHERE id = inv.id;
remaining := remaining - inv.quantity;
END IF;
END LOOP;

            IF remaining > 0 THEN
                RAISE EXCEPTION
                    'Stock insuficiente para el producto % (faltan % unidades)',
                    item.product_id, remaining;
END IF;
END LOOP;
END IF;

RETURN NEW;
END;
$$;

CREATE TRIGGER trg_deduct_inventory
    AFTER UPDATE ON chaputeria.orders
    FOR EACH ROW EXECUTE FUNCTION chaputeria.deduct_inventory_on_confirm();



-- EXPONER EL SCHEMA AL DATA API + GRANTS
--   (recuerda agregar `chaputeria` en Settings > Data API >
--    "Exposed schemas" y "Extra search path")

GRANT USAGE ON SCHEMA chaputeria TO anon, authenticated, service_role;

-- service_role = backend (bypassa RLS): acceso total
GRANT ALL ON ALL TABLES    IN SCHEMA chaputeria TO service_role;
GRANT ALL ON ALL ROUTINES  IN SCHEMA chaputeria TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA chaputeria TO service_role;

-- authenticated = logueados; los privilegios de tabla los filtra RLS
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA chaputeria TO authenticated;
GRANT EXECUTE ON ALL ROUTINES  IN SCHEMA chaputeria TO authenticated;
GRANT USAGE   ON ALL SEQUENCES IN SCHEMA chaputeria TO authenticated;

-- anon = no logueado: solo lectura (defensa en profundidad)
GRANT SELECT ON ALL TABLES IN SCHEMA chaputeria TO anon;

-- Privilegios por default para objetos FUTUROS
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA chaputeria
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA chaputeria
    GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA chaputeria
    GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA chaputeria
    GRANT EXECUTE ON ROUTINES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA chaputeria
    GRANT USAGE ON SEQUENCES TO authenticated, service_role;



-- CARVE-OUT ANTI-ESCALACION EN users
--   Para restringir columnas hay que dar el privilegio A NIVEL
--   COLUMNA (un GRANT de tabla permite todas). Resultado: un
--   customer NO puede setear ni cambiar su propio `role`.
--   Promover a admin se hace desde el backend con service_role.

REVOKE INSERT, UPDATE ON chaputeria.users FROM anon, authenticated;
GRANT  INSERT (cognito_id, name, email, phone) ON chaputeria.users TO authenticated;
GRANT  UPDATE (name, phone) ON chaputeria.users TO authenticated;



-- HELPER FUNCTIONS (SECURITY DEFINER para evitar recursion de RLS
--   sobre users; search_path fijo por seguridad / linter)
CREATE OR REPLACE FUNCTION chaputeria.current_user_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
SELECT id FROM chaputeria.users
WHERE cognito_id = (auth.jwt() ->> 'sub')
    LIMIT 1
$$;

CREATE OR REPLACE FUNCTION chaputeria.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
SELECT EXISTS (
    SELECT 1 FROM chaputeria.users
    WHERE cognito_id = (auth.jwt() ->> 'sub')
      AND role = 'admin'
)
           $$;

CREATE OR REPLACE FUNCTION chaputeria.owns_order(p_order_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
SELECT EXISTS (
    SELECT 1 FROM chaputeria.orders
    WHERE id = p_order_id
      AND user_id = chaputeria.current_user_id()
)
           $$;

-- 1. Forzar el precio desde el catalogo (ignora lo que mande el cliente)
CREATE OR REPLACE FUNCTION chaputeria.enforce_order_item_price()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
v_price     NUMERIC(10,2);
    v_available BOOLEAN;
BEGIN
SELECT price, available INTO v_price, v_available
FROM chaputeria.products
WHERE id = NEW.product_id;

IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto % no existe', NEW.product_id;
END IF;
    IF NOT v_available THEN
        RAISE EXCEPTION 'Producto % no esta disponible', NEW.product_id;
END IF;

    NEW.unit_price := v_price;   -- el precio lo manda el server, no el cliente
RETURN NEW;
END;
$$;

-- 2. Recalcular orders.total desde los order_items
CREATE OR REPLACE FUNCTION chaputeria.recalc_order_total()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER          -- necesario: el customer no puede UPDATE orders bajo RLS
SET search_path = ''
AS $$
DECLARE
v_order_id uuid;
BEGIN
    v_order_id := COALESCE(NEW.order_id, OLD.order_id);

UPDATE chaputeria.orders o
SET total = COALESCE((
                         SELECT SUM(oi.quantity * oi.unit_price)
                         FROM chaputeria.order_items oi
                         WHERE oi.order_id = v_order_id
                     ), 0)
WHERE o.id = v_order_id;

-- Si en un UPDATE cambio el order_id (raro), recalcula tambien el viejo
IF TG_OP = 'UPDATE' AND NEW.order_id IS DISTINCT FROM OLD.order_id THEN
UPDATE chaputeria.orders o
SET total = COALESCE((
                         SELECT SUM(oi.quantity * oi.unit_price)
                         FROM chaputeria.order_items oi
                         WHERE oi.order_id = OLD.order_id
                     ), 0)
WHERE o.id = OLD.order_id;
END IF;

RETURN NULL;   -- AFTER trigger: el valor de retorno se ignora
END;
$$;

-- 3. Una orden recien creada no tiene items: total arranca en 0
CREATE OR REPLACE FUNCTION chaputeria.init_order_total()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.total := 0;
RETURN NEW;
END;
$$;

-- Triggers
CREATE TRIGGER trg_init_order_total
    BEFORE INSERT ON chaputeria.orders
    FOR EACH ROW EXECUTE FUNCTION chaputeria.init_order_total();

CREATE TRIGGER trg_enforce_order_item_price
    BEFORE INSERT OR UPDATE ON chaputeria.order_items
                         FOR EACH ROW EXECUTE FUNCTION chaputeria.enforce_order_item_price();

CREATE TRIGGER trg_recalc_order_total
    AFTER INSERT OR UPDATE OR DELETE ON chaputeria.order_items
    FOR EACH ROW EXECUTE FUNCTION chaputeria.recalc_order_total();





GRANT EXECUTE ON FUNCTION chaputeria.current_user_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION chaputeria.is_admin()        TO anon, authenticated;
GRANT EXECUTE ON FUNCTION chaputeria.owns_order(uuid)  TO anon, authenticated;



-- HABILITAR RLS
ALTER TABLE chaputeria.users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE chaputeria.addresses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE chaputeria.suppliers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE chaputeria.products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE chaputeria.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chaputeria.orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE chaputeria.order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE chaputeria.payments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE chaputeria.deliveries      ENABLE ROW LEVEL SECURITY;



-- POLICIES
--   is_admin()/current_user_id() van en (select ...) para que se
--   evaluen una vez por query (initPlan), no por fila.


-- ---------- users ----------
CREATE POLICY users_select_own ON chaputeria.users
    FOR SELECT TO authenticated
                   USING (cognito_id = (auth.jwt() ->> 'sub') OR (select chaputeria.is_admin()));

CREATE POLICY users_insert_self ON chaputeria.users
    FOR INSERT TO authenticated
    WITH CHECK (cognito_id = (auth.jwt() ->> 'sub'));

CREATE POLICY users_update_own ON chaputeria.users
    FOR UPDATE TO authenticated
                          USING (cognito_id = (auth.jwt() ->> 'sub') OR (select chaputeria.is_admin()))
        WITH CHECK (cognito_id = (auth.jwt() ->> 'sub') OR (select chaputeria.is_admin()));

CREATE POLICY users_delete_admin ON chaputeria.users
    FOR DELETE TO authenticated
    USING ((select chaputeria.is_admin()));

-- ---------- addresses ----------
CREATE POLICY addresses_all_own ON chaputeria.addresses
    FOR ALL TO authenticated
    USING (user_id = (select chaputeria.current_user_id()) OR (select chaputeria.is_admin()))
    WITH CHECK (user_id = (select chaputeria.current_user_id()) OR (select chaputeria.is_admin()));

-- ---------- products (catalogo publico; admin escribe) ----------
CREATE POLICY products_select_public ON chaputeria.products
    FOR SELECT TO anon, authenticated
                                                USING (available OR (select chaputeria.is_admin()));

CREATE POLICY products_write_admin ON chaputeria.products
    FOR ALL TO authenticated
    USING ((select chaputeria.is_admin()))
    WITH CHECK ((select chaputeria.is_admin()));

-- ---------- suppliers (admin only) ----------
CREATE POLICY suppliers_admin_all ON chaputeria.suppliers
    FOR ALL TO authenticated
    USING ((select chaputeria.is_admin()))
    WITH CHECK ((select chaputeria.is_admin()));

-- ---------- inventory_items (admin only) ----------
CREATE POLICY inventory_admin_all ON chaputeria.inventory_items
    FOR ALL TO authenticated
    USING ((select chaputeria.is_admin()))
    WITH CHECK ((select chaputeria.is_admin()));

-- ---------- orders ----------
CREATE POLICY orders_select_own ON chaputeria.orders
    FOR SELECT TO authenticated
                                        USING (user_id = (select chaputeria.current_user_id()) OR (select chaputeria.is_admin()));

CREATE POLICY orders_insert_own ON chaputeria.orders
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select chaputeria.current_user_id()));

CREATE POLICY orders_update_admin ON chaputeria.orders
    FOR UPDATE TO authenticated
                          USING ((select chaputeria.is_admin()))
        WITH CHECK ((select chaputeria.is_admin()));

CREATE POLICY orders_delete_admin ON chaputeria.orders
    FOR DELETE TO authenticated
    USING ((select chaputeria.is_admin()));

-- ---------- order_items ----------
CREATE POLICY order_items_select_own ON chaputeria.order_items
    FOR SELECT TO authenticated
                                         USING (chaputeria.owns_order(order_id) OR (select chaputeria.is_admin()));

CREATE POLICY order_items_insert_own ON chaputeria.order_items
    FOR INSERT TO authenticated
    WITH CHECK (chaputeria.owns_order(order_id));

CREATE POLICY order_items_update_admin ON chaputeria.order_items
    FOR UPDATE TO authenticated
                          USING ((select chaputeria.is_admin()))
        WITH CHECK ((select chaputeria.is_admin()));

CREATE POLICY order_items_delete_own ON chaputeria.order_items
    FOR DELETE TO authenticated
    USING (chaputeria.owns_order(order_id) OR (select chaputeria.is_admin()));

-- ---------- payments ----------
CREATE POLICY payments_select_own ON chaputeria.payments
    FOR SELECT TO authenticated
                                         USING (chaputeria.owns_order(order_id) OR (select chaputeria.is_admin()));

-- El customer sube su pago pero NO puede auto-verificarse.
CREATE POLICY payments_insert_own ON chaputeria.payments
    FOR INSERT TO authenticated
    WITH CHECK (
        chaputeria.owns_order(order_id)
        AND status IN ('pending', 'submitted')
    );

CREATE POLICY payments_update_admin ON chaputeria.payments
    FOR UPDATE TO authenticated
                          USING ((select chaputeria.is_admin()))
        WITH CHECK ((select chaputeria.is_admin()));

-- ---------- deliveries ----------
CREATE POLICY deliveries_select_own ON chaputeria.deliveries
    FOR SELECT TO authenticated
                   USING (chaputeria.owns_order(order_id) OR (select chaputeria.is_admin()));

CREATE POLICY deliveries_write_admin ON chaputeria.deliveries
    FOR ALL TO authenticated
    USING ((select chaputeria.is_admin()))
    WITH CHECK ((select chaputeria.is_admin()));






-- Creacion de user funcion sacada de CCL (casi)

CREATE OR REPLACE FUNCTION chaputeria.create_user_from_cognito(
    p_cognito_id text,
    p_email      text,
    p_name       text,
    p_phone      text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
v_id uuid;
BEGIN
    -- Caso normal + re-login: upsert por cognito_id
INSERT INTO chaputeria.users (cognito_id, name, email, phone)
VALUES (p_cognito_id, p_name, p_email, p_phone)
    ON CONFLICT (cognito_id) DO UPDATE
                                    SET name = EXCLUDED.name, phone = EXCLUDED.phone
                                    RETURNING id INTO v_id;
RETURN v_id;
EXCEPTION
    -- El email ya existe en otra fila: enlaza ese row al cognito_id actual
    WHEN unique_violation THEN
UPDATE chaputeria.users
SET cognito_id = p_cognito_id, name = p_name, phone = p_phone
WHERE email = p_email
    RETURNING id INTO v_id;
RETURN v_id;
END;
$$;

-- Solo el backend lo llama
GRANT EXECUTE ON FUNCTION chaputeria.create_user_from_cognito(text, text, text, text) TO service_role;




-- SEED
--   Productos de ejemplo + admin. El row admin DEBE tener
--   cognito_id = el `sub` de Cognito del usuario admin, si no
--   is_admin() nunca matchea. Corre el INSERT del admin tras
--   crear ese usuario en el User Pool y poner aqui su sub.



INSERT INTO chaputeria.products (name, description, price, category) VALUES
                                                                         ('Tablita Clasica',  'Quesos, carnes frias y acompanamientos',   350.00, 'tablitas'),
                                                                         ('Tablita Premium',  'Quesos importados, jamon serrano, nueces', 550.00, 'tablitas'),
                                                                         ('Tablita Dulce',    'Frutas, chocolates, mermeladas y quesos',  420.00, 'tablitas'),
                                                                         ('Tablita Personal', 'Porcion individual ideal para regalo',     220.00, 'tablitas');

-- INSERT INTO chaputeria.users (cognito_id, name, email, role) VALUES
--   ('REEMPLAZA_CON_EL_COGNITO_SUB', 'Admin', 'admin@charcuterie.com', 'admin');