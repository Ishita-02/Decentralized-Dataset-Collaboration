// Minimal upload stub to replace previous backend uploader.
// In production, replace with IPFS (e.g., web3.storage or pinata) and return CID URL.

export async function UploadFile({ file }) {
  if (!file) throw new Error('No file provided');
  // For now, create an object URL so the UI can open it. Not persistent.
  const fileUrl = URL.createObjectURL(file);
  return { file_url: fileUrl };
}


