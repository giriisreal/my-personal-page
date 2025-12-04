-- Create storage bucket for link icons
INSERT INTO storage.buckets (id, name, public)
VALUES ('link-icons', 'link-icons', true);

-- Allow anyone to view link icons
CREATE POLICY "Link icons are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'link-icons');

-- Allow authenticated users to upload their own link icons
CREATE POLICY "Users can upload link icons"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'link-icons' AND auth.uid() IS NOT NULL);

-- Allow users to update their own link icons
CREATE POLICY "Users can update own link icons"
ON storage.objects FOR UPDATE
USING (bucket_id = 'link-icons' AND auth.uid() IS NOT NULL);

-- Allow users to delete their own link icons
CREATE POLICY "Users can delete own link icons"
ON storage.objects FOR DELETE
USING (bucket_id = 'link-icons' AND auth.uid() IS NOT NULL);