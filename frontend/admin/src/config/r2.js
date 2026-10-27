const API_BASE = import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.DEV ? '/api' : 'https://api.khanhmelodymussic.com/api')

export const uploadToR2 = async (file, token) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE}/upload/r2`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'File could not be uploaded')
  }
  return data.objectKey
}
