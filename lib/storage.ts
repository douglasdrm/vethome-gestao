import { supabase } from './supabase';

/**
 * Faz upload de um arquivo para o bucket 'vethome'
 * Organiza em pastas por UserID para garantir segurança RLS
 */
export async function uploadFile(
  file: File, 
  userId: string, 
  category: 'pets' | 'vacinas' | 'exames' = 'pets'
): Promise<string> {
  // 1. Validar tamanho (5MB)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error('O arquivo deve ter no máximo 5MB.');
  }

  // 2. Validar tipo
  if (!file.type.startsWith('image/')) {
    throw new Error('Apenas imagens são permitidas.');
  }

  // 3. Gerar nome único
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `${userId}/${category}/${fileName}`;

  // 4. Fazer upload
  const { error: uploadError } = await supabase.storage
    .from('vethome')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Erro no upload:', uploadError);
    throw new Error('Não foi possível enviar a imagem.');
  }

  // 5. Retornar URL pública
  const { data } = supabase.storage
    .from('vethome')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
