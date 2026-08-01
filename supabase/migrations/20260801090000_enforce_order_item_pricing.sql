-- ============================================================
-- Fix: order pricing was entirely client-trusted.
--
-- The cart lives in localStorage and Cart.tsx sent unit_price /
-- subtotal / total straight from client state into orders/order_items.
-- RLS on both tables only checks auth.uid() = user_id, never the price,
-- so any authenticated customer could edit their cart in devtools (or
-- call the Supabase REST API directly with their own JWT) and check out
-- real products at an arbitrary price. Admins would then see a normal-
-- looking paid-on-delivery order at the fabricated total.
--
-- Fix: recompute order_items.unit_price/subtotal from the authoritative
-- products.price at insert time, then recompute the parent order's
-- subtotal/total from its real order_items. Client-submitted numeric
-- values are no longer trusted at any step.
-- ============================================================

-- New orders always start at zero. The real subtotal/total is filled in
-- by recompute_order_totals() once order_items are attached, so whatever
-- numbers a client sends at order-creation time have no effect.
CREATE OR REPLACE FUNCTION public.zero_new_order_totals()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.subtotal := 0;
  NEW.total := 0;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS zero_new_order_totals ON public.orders;
CREATE TRIGGER zero_new_order_totals
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.zero_new_order_totals();

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS delivery_fee_non_negative;
ALTER TABLE public.orders ADD CONSTRAINT delivery_fee_non_negative CHECK (delivery_fee >= 0);

-- Overwrite unit_price/subtotal on every order_items row with the current
-- product price, ignoring whatever the client sent. Runs SECURITY DEFINER
-- so it can read products regardless of the calling role.
CREATE OR REPLACE FUNCTION public.enforce_order_item_price()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  current_price numeric;
BEGIN
  IF NEW.product_id IS NULL THEN
    RAISE EXCEPTION 'order_items.product_id is required';
  END IF;

  SELECT price INTO current_price FROM public.products WHERE id = NEW.product_id;
  IF current_price IS NULL THEN
    RAISE EXCEPTION 'Unknown product %', NEW.product_id;
  END IF;

  NEW.unit_price := current_price;
  NEW.subtotal := current_price * NEW.quantity;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_order_item_price ON public.order_items;
CREATE TRIGGER enforce_order_item_price
  BEFORE INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.enforce_order_item_price();

-- Recompute the parent order's subtotal/total from its real order_items
-- every time an item is attached. Runs SECURITY DEFINER because the
-- customer placing the order has no UPDATE policy on public.orders
-- (only admins do) and shouldn't need one for this.
CREATE OR REPLACE FUNCTION public.recompute_order_totals()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_subtotal numeric;
BEGIN
  SELECT COALESCE(SUM(subtotal), 0) INTO new_subtotal
  FROM public.order_items WHERE order_id = NEW.order_id;

  UPDATE public.orders
  SET subtotal = new_subtotal,
      total = new_subtotal + delivery_fee
  WHERE id = NEW.order_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS recompute_order_totals ON public.order_items;
CREATE TRIGGER recompute_order_totals
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.recompute_order_totals();
