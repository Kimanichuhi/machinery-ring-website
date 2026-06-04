
-- POSTERS
CREATE TABLE public.promo_posters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  link_url TEXT DEFAULT '',
  link_label TEXT DEFAULT 'Learn More',
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.promo_posters TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_posters TO authenticated;
GRANT ALL ON public.promo_posters TO service_role;
ALTER TABLE public.promo_posters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view posters" ON public.promo_posters FOR SELECT USING (true);
CREATE POLICY "Admins can insert posters" ON public.promo_posters FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update posters" ON public.promo_posters FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete posters" ON public.promo_posters FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_promo_posters_updated_at BEFORE UPDATE ON public.promo_posters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- GUIDES
CREATE TABLE public.guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'General',
  content TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  read_time TEXT DEFAULT '5 min read',
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.guides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guides TO authenticated;
GRANT ALL ON public.guides TO service_role;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published guides" ON public.guides FOR SELECT USING (is_published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert guides" ON public.guides FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update guides" ON public.guides FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete guides" ON public.guides FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_guides_updated_at BEFORE UPDATE ON public.guides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- NEWSLETTER
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update subscribers" ON public.newsletter_subscribers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete subscribers" ON public.newsletter_subscribers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed a few default guides so the page isn't empty
INSERT INTO public.guides (slug, title, description, category, content, read_time, is_popular, sort_order) VALUES
('maize-farming', 'Complete Guide to Maize Farming', 'From land preparation to harvesting, learn everything about successful maize cultivation.', 'Crop Guides',
'## Land Preparation
Plough land 2-3 weeks before planting. Test soil pH (ideal 5.5-7.0) and add lime if acidic.

## Seed Selection
Use certified hybrid seeds suited to your region. Recommended varieties: H614, H6213, DK8031.

## Planting
- Spacing: 75cm between rows, 25cm between plants
- Depth: 3-5cm
- 2 seeds per hole, thin to 1 strong seedling after germination

## Fertilization
Apply DAP at planting (50kg/acre) and top-dress with CAN at knee-height (50kg/acre).

## Pest & Disease Management
Scout weekly for fall armyworm, stalk borer, and MLN. Use IPM approach.

## Harvesting
Harvest when husks dry and moisture is below 20%. Dry to 13.5% before storage.', '15 min read', true, 1),

('organic-farming', 'Organic Farming Practices', 'Sustainable farming methods to improve soil health and crop quality naturally.', 'Sustainable Farming',
'## Building Healthy Soil
Use compost, green manures, and cover crops to maintain soil fertility.

## Natural Pest Control
Encourage beneficial insects. Use neem oil, pyrethrum, and crop rotation.

## Composting Basics
Layer browns (dry leaves, straw) and greens (kitchen waste, fresh manure) in 3:1 ratio.', '12 min read', false, 2),

('water-management', 'Water Management Techniques', 'Efficient irrigation methods and water conservation strategies for your farm.', 'Water Management',
'## Drip Irrigation
Most water-efficient method. Saves up to 60% water compared to flood irrigation.

## Mulching
Reduces evaporation by 50-70%. Use straw, grass, or plastic mulch.

## Rainwater Harvesting
Collect from roofs into tanks. Build farm ponds for runoff capture.', '10 min read', true, 3),

('pest-control', 'Pest and Disease Control', 'Identify, prevent, and treat common agricultural pests and diseases.', 'Plant Health',
'## Integrated Pest Management (IPM)
Combine biological, cultural, and chemical methods. Chemicals are last resort.

## Common Pests in Kenya
- Fall armyworm (maize)
- Aphids (vegetables)
- Tuta absoluta (tomatoes)

## Disease Prevention
- Use certified seeds
- Practice crop rotation
- Maintain field hygiene', '18 min read', false, 4);
