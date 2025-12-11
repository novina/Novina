-- FIX: Update model_id for Gemini to valid OpenRouter endpoint
UPDATE ai_providers 
SET model_id = 'google/gemini-2.5-flash' 
WHERE name = 'gemini';

-- FIX: Enable delete policy for news_batches
DROP POLICY IF EXISTS "Users can delete their own batches" ON news_batches;
CREATE POLICY "Users can delete their own batches" ON news_batches
  FOR DELETE TO authenticated USING (true);

-- FIX: Enable all operations for authenticated users on news_batches
DROP POLICY IF EXISTS "Authenticated users can manage batches" ON news_batches;
CREATE POLICY "Authenticated users can manage batches" ON news_batches
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Verify the model_id was updated
SELECT name, display_name, model_id FROM ai_providers WHERE name = 'gemini';
