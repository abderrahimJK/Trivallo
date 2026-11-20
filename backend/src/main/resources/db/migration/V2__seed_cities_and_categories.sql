-- Launch cities and the starting set of categories, in English and French.
-- Hero images are set later through the admin once photos are uploaded.

INSERT INTO city (slug, sort_order) VALUES
    ('marrakech', 1),
    ('ouarzazate', 2),
    ('merzouga', 3);

INSERT INTO city_translation (city_id, locale, name, description, meta_title, meta_description)
SELECT c.id, t.locale, t.name, t.description, t.meta_title, t.meta_description
FROM (VALUES
    ('marrakech', 'en', 'Marrakech',
     'The Red City: souks, palaces and gardens, with the Atlas Mountains and the Agafay desert a short drive away.',
     'Things to do in Marrakech: excursions and activities',
     'Book the best excursions and activities in Marrakech: hot-air balloons, Agafay desert, Atlas day trips, cooking classes and more.'),
    ('marrakech', 'fr', 'Marrakech',
     'La Ville rouge : souks, palais et jardins, avec l''Atlas et le désert d''Agafay à quelques kilomètres.',
     'Que faire à Marrakech : excursions et activités',
     'Réservez les meilleures excursions et activités à Marrakech : montgolfière, désert d''Agafay, Atlas, cours de cuisine et plus.'),
    ('ouarzazate', 'en', 'Ouarzazate',
     'The gateway to the Sahara, home to film studios and the kasbahs of the Draa and Dades valleys.',
     'Things to do in Ouarzazate: excursions and activities',
     'Discover excursions and activities around Ouarzazate: Aït Benhaddou, film studios, kasbahs and desert valleys.'),
    ('ouarzazate', 'fr', 'Ouarzazate',
     'La porte du désert, entre studios de cinéma et kasbahs des vallées du Drâa et du Dadès.',
     'Que faire à Ouarzazate : excursions et activités',
     'Découvrez les excursions et activités autour de Ouarzazate : Aït Benhaddou, studios de cinéma, kasbahs et vallées.'),
    ('merzouga', 'en', 'Merzouga',
     'A village at the foot of the Erg Chebbi dunes: camel treks, desert camps and Saharan sunrises.',
     'Things to do in Merzouga: desert tours and activities',
     'Book camel treks, desert camp nights, quad and 4x4 tours in the Erg Chebbi dunes of Merzouga.'),
    ('merzouga', 'fr', 'Merzouga',
     'Un village au pied des dunes de l''Erg Chebbi : balades à dos de dromadaire, bivouacs et levers de soleil sur le Sahara.',
     'Que faire à Merzouga : excursions et activités dans le désert',
     'Réservez balades à dos de dromadaire, nuits en bivouac, quad et 4x4 dans les dunes de l''Erg Chebbi à Merzouga.')
) AS t (slug, locale, name, description, meta_title, meta_description)
JOIN city c ON c.slug = t.slug;

INSERT INTO category (slug, icon, sort_order) VALUES
    ('desert-tour', 'dune', 1),
    ('day-trip', 'route', 2),
    ('camel-ride', 'camel', 3),
    ('quad-buggy', 'quad', 4),
    ('hot-air-balloon', 'balloon', 5),
    ('hiking', 'mountain', 6),
    ('cultural-tour', 'kasbah', 7),
    ('cooking-class', 'tagine', 8);

INSERT INTO category_translation (category_id, locale, name)
SELECT c.id, t.locale, t.name
FROM (VALUES
    ('desert-tour', 'en', 'Desert tours'),
    ('desert-tour', 'fr', 'Excursions dans le désert'),
    ('day-trip', 'en', 'Day trips'),
    ('day-trip', 'fr', 'Excursions d''une journée'),
    ('camel-ride', 'en', 'Camel rides'),
    ('camel-ride', 'fr', 'Balades à dos de dromadaire'),
    ('quad-buggy', 'en', 'Quad and buggy'),
    ('quad-buggy', 'fr', 'Quad et buggy'),
    ('hot-air-balloon', 'en', 'Hot-air balloon'),
    ('hot-air-balloon', 'fr', 'Montgolfière'),
    ('hiking', 'en', 'Hiking'),
    ('hiking', 'fr', 'Randonnée'),
    ('cultural-tour', 'en', 'Cultural tours'),
    ('cultural-tour', 'fr', 'Visites culturelles'),
    ('cooking-class', 'en', 'Cooking classes'),
    ('cooking-class', 'fr', 'Cours de cuisine')
) AS t (slug, locale, name)
JOIN category c ON c.slug = t.slug;
