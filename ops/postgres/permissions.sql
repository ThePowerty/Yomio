-- Run as the database owner after creating the login roles with passwords supplied
-- by the deployment secret manager. Never store those passwords in this file.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON DATABASE tracker FROM PUBLIC;

GRANT CONNECT ON DATABASE tracker TO yomio_app;
GRANT USAGE ON SCHEMA public TO yomio_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO yomio_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO yomio_app;

ALTER DEFAULT PRIVILEGES FOR ROLE yomio_migrator IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO yomio_app;
ALTER DEFAULT PRIVILEGES FOR ROLE yomio_migrator IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO yomio_app;

-- RLS is intentionally not enabled here. The current application uses one pooled
-- database identity and does not propagate a transaction-scoped tenant identifier.
-- Enabling a policy before that context exists would either deny every request or,
-- if the owner role were used, provide a false sense of isolation.
