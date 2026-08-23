-- Architex OS v0.8 — DB-driven module registry fidelity.
-- The canonical tools.json registry carries implementation_status
-- (native|sample|scaffold) and an optional governance object per module.
-- Earlier releases dropped both when seeding the modules table; this
-- migration restores them so the DB row is a faithful mirror of the
-- canonical registry (the API's /modules-registry contract).

ALTER TABLE modules
  ADD COLUMN implementation_status VARCHAR(40) NOT NULL DEFAULT 'sample'
    AFTER status,
  ADD COLUMN governance_json JSON NULL
    AFTER implementation_status;
