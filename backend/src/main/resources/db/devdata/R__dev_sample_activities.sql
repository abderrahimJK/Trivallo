-- DEV ONLY (loaded by the 'dev' profile, never in production).
-- A handful of sample activities so the API and the UI have something to show.
-- Idempotent: safe to re-run whenever this file changes.

INSERT INTO activity (slug, city_id, category_id, type, price_adult_eur, price_child_eur, duration_minutes,
                      max_group_size, operating_days, meeting_point, latitude, longitude, tripadvisor_url, status)
SELECT a.slug, ci.id, ca.id, a.type, a.price_adult, a.price_child, a.duration, a.group_size, a.days,
       a.meeting_point, a.lat, a.lng, NULL, a.status
FROM (VALUES
    ('hot-air-balloon-sunrise-marrakech', 'marrakech', 'hot-air-balloon', 'ACTIVITY', 180.00, 120.00, 240, 16,
     'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY,SUNDAY', 'Hotel pickup in Marrakech', 31.629500, -7.981100, 'PUBLISHED'),
    ('agafay-desert-quad-and-dinner', 'marrakech', 'quad-buggy', 'EXCURSION', 65.00, 45.00, 300, 12,
     'MONDAY,WEDNESDAY,FRIDAY,SATURDAY,SUNDAY', 'Hotel pickup in Marrakech', 31.481200, -8.205300, 'PUBLISHED'),
    ('moroccan-cooking-class-medina', 'marrakech', 'cooking-class', 'ACTIVITY', 45.00, 25.00, 180, 10,
     'TUESDAY,THURSDAY,SATURDAY', 'Jemaa el-Fnaa, in front of the Koutoubia', 31.625800, -7.989200, 'PUBLISHED'),
    ('ait-benhaddou-day-trip', 'ouarzazate', 'day-trip', 'EXCURSION', 40.00, 20.00, 480, 15,
     'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY', 'Ouarzazate city centre', 31.047000, -7.129800, 'PUBLISHED'),
    ('erg-chebbi-camel-trek-overnight', 'merzouga', 'camel-ride', 'EXCURSION', 85.00, 60.00, 1080, 20,
     'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY,SUNDAY', 'Merzouga village, Auberge parking', 31.099800, -4.012600, 'PUBLISHED'),
    ('merzouga-4x4-desert-tour-draft', 'merzouga', 'desert-tour', 'EXCURSION', 70.00, 50.00, 360, 6,
     'SATURDAY,SUNDAY', 'Merzouga village', 31.099800, -4.012600, 'DRAFT')
) AS a (slug, city_slug, category_slug, type, price_adult, price_child, duration, group_size, days,
        meeting_point, lat, lng, status)
JOIN city ci ON ci.slug = a.city_slug
JOIN category ca ON ca.slug = a.category_slug
ON CONFLICT (slug) DO NOTHING;

INSERT INTO activity_translation (activity_id, locale, title, summary, description, itinerary, included, not_included,
                                  meta_title, meta_description)
SELECT ac.id, t.locale, t.title, t.summary, t.description, t.itinerary, t.included, t.not_included, t.title, t.summary
FROM (VALUES
    ('hot-air-balloon-sunrise-marrakech', 'en', 'Sunrise hot-air balloon over Marrakech',
     'Float above the palm groves and Berber villages at dawn, then enjoy breakfast in a nomad tent.',
     'A one-hour flight at sunrise with views of the Atlas Mountains, followed by a traditional breakfast.',
     'Hotel pickup at 5:30, briefing and inflation, one-hour flight, breakfast, return around 10:00.',
     E'Hotel pickup and drop-off\nOne-hour flight\nBerber breakfast\nFlight certificate',
     E'Tips\nPersonal expenses'),
    ('hot-air-balloon-sunrise-marrakech', 'fr', 'Vol en montgolfière au lever du soleil à Marrakech',
     'Survolez la palmeraie et les villages berbères à l''aube, puis petit-déjeuner sous une tente nomade.',
     'Un vol d''une heure au lever du soleil avec vue sur l''Atlas, suivi d''un petit-déjeuner traditionnel.',
     'Prise en charge à 5h30, briefing et gonflage, vol d''une heure, petit-déjeuner, retour vers 10h00.',
     E'Transfert aller-retour depuis l''hôtel\nVol d''une heure\nPetit-déjeuner berbère\nCertificat de vol',
     E'Pourboires\nDépenses personnelles'),
    ('agafay-desert-quad-and-dinner', 'en', 'Agafay desert quad ride and dinner show',
     'Ride a quad across the stony Agafay desert, watch the sunset and have dinner under the stars.',
     'Two hours of quad biking in the Agafay desert, sunset over the Atlas, then a dinner show at a desert camp.',
     'Pickup at 14:00, quad ride, mint tea, sunset, dinner and show, return around 21:30.',
     E'Hotel pickup and drop-off\nQuad, helmet and scarf\nDinner and show',
     E'Drinks with dinner'),
    ('agafay-desert-quad-and-dinner', 'fr', 'Quad dans le désert d''Agafay et dîner-spectacle',
     'Roulez en quad dans le désert d''Agafay, admirez le coucher du soleil et dînez sous les étoiles.',
     'Deux heures de quad dans le désert d''Agafay, coucher du soleil sur l''Atlas, puis dîner-spectacle au campement.',
     'Prise en charge à 14h00, quad, thé à la menthe, coucher du soleil, dîner et spectacle, retour vers 21h30.',
     E'Transfert aller-retour depuis l''hôtel\nQuad, casque et chèche\nDîner et spectacle',
     E'Boissons pendant le dîner'),
    -- English only on purpose: the French API response falls back to English.
    ('moroccan-cooking-class-medina', 'en', 'Moroccan cooking class in the medina',
     'Shop for spices in the souk with a local cook, then prepare a tagine and pastries in a riad kitchen.',
     'A hands-on class in small groups, from market to table, ending with the meal you cooked.',
     'Meet at Jemaa el-Fnaa, souk visit, cooking in the riad, lunch together.',
     E'Market visit\nIngredients\nLunch\nRecipe booklet',
     E'Hotel transfers'),
    ('ait-benhaddou-day-trip', 'en', 'Aït Benhaddou and film studios day trip',
     'Explore the UNESCO-listed ksar of Aït Benhaddou and the Atlas film studios.',
     'A guided day trip from Ouarzazate to the ksar of Aït Benhaddou, with a stop at the Atlas Studios.',
     'Departure at 9:00, Atlas Studios, Aït Benhaddou guided visit, lunch, return around 17:00.',
     E'Transport\nLocal guide\nStudio entrance',
     E'Lunch\nTips'),
    ('ait-benhaddou-day-trip', 'fr', 'Excursion d''une journée à Aït Benhaddou et aux studios',
     'Découvrez le ksar d''Aït Benhaddou, classé à l''UNESCO, et les studios de cinéma Atlas.',
     'Une excursion guidée depuis Ouarzazate vers le ksar d''Aït Benhaddou, avec un arrêt aux studios Atlas.',
     'Départ à 9h00, studios Atlas, visite guidée d''Aït Benhaddou, déjeuner, retour vers 17h00.',
     E'Transport\nGuide local\nEntrée des studios',
     E'Déjeuner\nPourboires'),
    ('erg-chebbi-camel-trek-overnight', 'en', 'Erg Chebbi camel trek and desert camp night',
     'Ride a camel into the dunes at sunset, sleep in a desert camp and watch the sunrise over the Sahara.',
     'An overnight trek in the Erg Chebbi dunes with dinner, Berber music around the fire and a sunrise ride back.',
     'Meet at 16:30, camel ride to camp, dinner and music, night in a tent, sunrise, breakfast, ride back.',
     E'Camel ride\nNight in a desert camp\nDinner and breakfast',
     E'Transfer to Merzouga\nDrinks'),
    ('erg-chebbi-camel-trek-overnight', 'fr', 'Balade à dos de dromadaire et nuit en bivouac à l''Erg Chebbi',
     'Partez à dos de dromadaire au coucher du soleil, dormez au bivouac et admirez le lever du soleil sur le Sahara.',
     'Une nuit dans les dunes de l''Erg Chebbi avec dîner, musique berbère autour du feu et retour au lever du soleil.',
     'Rendez-vous à 16h30, balade jusqu''au bivouac, dîner et musique, nuit sous tente, lever du soleil, petit-déjeuner, retour.',
     E'Balade à dos de dromadaire\nNuit en bivouac\nDîner et petit-déjeuner',
     E'Transfert jusqu''à Merzouga\nBoissons'),
    ('merzouga-4x4-desert-tour-draft', 'en', '4x4 desert tour around Merzouga',
     'Draft listing, not visible on the public API.',
     NULL, NULL, NULL, NULL)
) AS t (slug, locale, title, summary, description, itinerary, included, not_included)
JOIN activity ac ON ac.slug = t.slug
ON CONFLICT (activity_id, locale) DO NOTHING;

-- Image paths are placeholders until real photos are uploaded through the admin.
INSERT INTO activity_image (activity_id, url, alt_text, sort_order)
SELECT ac.id, i.url, i.alt_text, i.sort_order
FROM (VALUES
    ('hot-air-balloon-sunrise-marrakech', '/media/dev/balloon-1.jpg', 'Balloons over the Marrakech palm grove at sunrise', 1),
    ('hot-air-balloon-sunrise-marrakech', '/media/dev/balloon-2.jpg', 'Breakfast in a nomad tent', 2)
) AS i (slug, url, alt_text, sort_order)
JOIN activity ac ON ac.slug = i.slug
WHERE NOT EXISTS (SELECT 1 FROM activity_image existing WHERE existing.url = i.url);
