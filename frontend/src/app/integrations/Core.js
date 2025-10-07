export async function UploadFile({ file }) {
  if (!file) throw new Error('No file provided');
  const fileUrl = URL.createObjectURL(file);
  return { file_url: fileUrl };
}


