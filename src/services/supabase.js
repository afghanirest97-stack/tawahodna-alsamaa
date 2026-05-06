import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mdukcwedcilvvlbmzstr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kdWtjd2VkY2lsdnZsYm16c3RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMjkzMDEsImV4cCI6MjA5MzYwNTMwMX0.Be6vTW7CGmuqF0_7WcQKd2cELT8NOrZmlxFeU8nknRE';

export const supabase = createClient(supabaseUrl, supabaseKey);

// دوال مساعدة
export const uploadFile = async (bucket, file, folder = '') => {
  if (!file) return null;
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);
    
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);
    
  return publicUrl;
};

export const deleteFile = async (bucket, fileUrl) => {
  if (!fileUrl) return;
  
  const fileName = fileUrl.split('/').pop();
  const { error } = await supabase.storage
    .from(bucket)
    .remove([fileName]);
    
  if (error) throw error;
  return true;
};