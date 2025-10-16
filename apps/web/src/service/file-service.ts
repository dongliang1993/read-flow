import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

interface UploadBookParams {
  file: File
  bucketName?: string
  folderPath?: string
  onProgress?: (progress: number) => void
}

interface UploadBookResult {
  success: boolean
  key: string
  url: string
  error?: string
}

const getS3Client = () => {
  const region = import.meta.env.VITE_AWS_REGION || 'us-east-1'
  const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID
  const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS credentials not configured')
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}

export const uploadBook = async ({
  file,
  bucketName,
  folderPath = 'books',
  onProgress,
}: UploadBookParams): Promise<UploadBookResult> => {
  try {
    const bucket = bucketName || import.meta.env.VITE_AWS_BUCKET_NAME

    if (!bucket) {
      throw new Error('S3 bucket name not configured')
    }

    const s3Client = getS3Client()

    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name}`
    const key = folderPath ? `${folderPath}/${fileName}` : fileName

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        uploadDate: new Date().toISOString(),
      },
    })

    if (onProgress) {
      onProgress(50)
    }

    await s3Client.send(command)

    if (onProgress) {
      onProgress(100)
    }

    const region = import.meta.env.VITE_AWS_REGION || 'us-east-1'
    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`

    return {
      success: true,
      key,
      url,
    }
  } catch (error) {
    console.error('Upload failed:', error)
    return {
      success: false,
      key: '',
      url: '',
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}
