CREATE OR REPLACE FUNCTION update_merchant_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE merchants
  SET rating = (SELECT AVG(rating) FROM reviews WHERE merchant_id = NEW.merchant_id)
  WHERE merchant_id = NEW.merchant_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_merchant_rating
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_merchant_rating();