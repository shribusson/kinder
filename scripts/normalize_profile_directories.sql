BEGIN;

DO 57870
DECLARE v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM "Vehicle";

  IF v_count = 0 THEN
    DELETE FROM "VehicleModel";
    DELETE FROM "VehicleBrand";
  ELSE
    DELETE FROM "VehicleModel" vm
    WHERE NOT EXISTS (
      SELECT 1 FROM "Vehicle" v WHERE v."modelId" = vm.id
    );

    DELETE FROM "VehicleBrand" vb
    WHERE NOT EXISTS (
      SELECT 1 FROM "Vehicle" v WHERE v."brandId" = vb.id
    );
  END IF;
END 57870;

INSERT INTO "VehicleBrand" (
  id, name, "cyrillicName", country, popular, "updatedAt", "createdAt"
)
VALUES
  (IT, IT, IT
