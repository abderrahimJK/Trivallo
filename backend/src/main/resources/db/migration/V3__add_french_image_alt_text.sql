-- Image descriptions per language: alt_text stays the English one (required by the admin),
-- alt_text_fr is optional and falls back to English on the French site.
ALTER TABLE activity_image ADD COLUMN alt_text_fr VARCHAR(255);
