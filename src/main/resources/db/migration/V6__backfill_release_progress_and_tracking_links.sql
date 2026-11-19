UPDATE catalog_media
SET latest_released_unit = CASE
    WHEN type IN ('ANIME', 'MOVIE') THEN episodes
    ELSE chapters
END
WHERE status IN ('FINISHED', 'CANCELLED')
  AND latest_released_unit IS NULL;

UPDATE tracked_items tracked
SET catalog_media_id = media.id
FROM catalog_media media
WHERE tracked.catalog_media_id IS NULL
  AND tracked.type = media.type
  AND (
      lower(tracked.title) = lower(media.title)
      OR lower(tracked.title) = lower(media.title_english)
      OR lower(tracked.title) = lower(media.title_localized)
  )
  AND NOT EXISTS (
      SELECT 1 FROM tracked_items duplicate
      WHERE duplicate.user_id = tracked.user_id
        AND duplicate.catalog_media_id = media.id
  );
