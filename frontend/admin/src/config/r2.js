// Cloudflare R2 Configuration
export const R2_CONFIG = {
  bucketName: import.meta.env.VITE_R2_BUCKET_NAME || 'khanhmelody',
  accountId: import.meta.env.VITE_R2_ACCOUNT_ID,
  accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID,
  secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY,
  publicUrl: import.meta.env.VITE_R2_PUBLIC_URL || 'https://khanhmelody.r2.dev'
}

// Helper function to generate R2 object URLs
export const getR2Url = (objectKey) => {
  return `${R2_CONFIG.publicUrl}/${objectKey}`
}

// Helper function to upload file to R2 (client-side - for admin uploads)
export const uploadToR2 = async (file, objectKey) => {
  // Note: Direct R2 uploads from client require presigned URLs or backend proxy
  // This is a placeholder for the actual implementation
  // For production, implement backend endpoint to generate presigned URLs
  
  const formData = new FormData()
  formData.append('file', file)
  formData.append('objectKey', objectKey)
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload/r2`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('Upload failed')
    }
    
    const data = await response.json()
    return data.url
  } catch (error) {
    console.error('R2 upload error:', error)
    throw error
  }
}
