# 文件服务

## 配置

在项目根目录创建 `.env` 文件，添加以下环境变量：

```env
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=your_access_key_id
VITE_AWS_SECRET_ACCESS_KEY=your_secret_access_key
VITE_AWS_BUCKET_NAME=your_bucket_name
```

## 使用示例

```typescript
import { uploadBook } from './service/file-service'

const handleFileUpload = async (file: File) => {
  const result = await uploadBook({
    file,
    bucketName: 'my-books-bucket', // 可选，默认使用环境变量
    folderPath: 'books', // 可选，默认为 'books'
    onProgress: (progress) => {
      console.log(`上传进度: ${progress}%`)
    },
  })

  if (result.success) {
    console.log('上传成功！')
    console.log('文件 URL:', result.url)
    console.log('文件 Key:', result.key)
  } else {
    console.error('上传失败:', result.error)
  }
}
```

