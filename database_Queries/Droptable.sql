-- Connect to PostgreSQL and run these commands
DROP TABLE IF EXISTS 
  "CustomizationRequests", 
  "DesignerProposals", 
  "Users", 
  "Merchants" CASCADE;

DROP TYPE IF EXISTS 
  "enum_CustomizationRequests_status",
  "enum_Users_role",
  "enum_DesignerProposals_status";