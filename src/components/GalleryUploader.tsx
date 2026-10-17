import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useI18n } from '../i18n'

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

type Props = {
  images: string[]
  onChange: (images: string[]) => void
  onError: (message: string) => void
  maxFiles?: number
}

/** Multi-image dropzone with reorderable previews (react-dropzone). */
export function GalleryUploader({ images, onChange, onError, maxFiles = 12 }: Props) {
  const { t } = useI18n()

  const onDrop = useCallback(
    async (accepted: File[]) => {
      if (!accepted.length) return
      const room = Math.max(0, maxFiles - images.length)
      const batch = accepted.slice(0, room)
      try {
        const urls: string[] = []
        for (const file of batch) {
          if (file.size > 4 * 1024 * 1024) {
            onError(t('Фото должно быть меньше 4 МБ'))
            continue
          }
          urls.push(await readFileAsDataUrl(file))
        }
        if (urls.length) onChange([...images, ...urls])
      } catch {
        onError(t('Не удалось прочитать фото'))
      }
    },
    [images, maxFiles, onChange, onError, t],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
    disabled: images.length >= maxFiles,
  })

  const removeAt = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const move = (from: number, dir: -1 | 1) => {
    const to = from + dir
    if (to < 0 || to >= images.length) return
    const next = [...images]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  return (
    <div className="gallery-uploader">
      <div
        {...getRootProps()}
        className={`gallery-uploader__drop${isDragActive ? ' is-active' : ''}${
          images.length >= maxFiles ? ' is-disabled' : ''
        }`}
      >
        <input {...getInputProps()} />
        <strong>{t('Перетащите фото сюда')}</strong>
        <span>{t('или нажмите, чтобы выбрать несколько файлов')}</span>
      </div>

      {images.length > 0 ? (
        <ul className="gallery-uploader__list">
          {images.map((src, index) => (
            <li key={`${src.slice(0, 40)}-${index}`} className="gallery-uploader__item">
              <img src={src} alt="" />
              <span className="gallery-uploader__badge">{index + 1}</span>
              <div className="gallery-uploader__actions">
                <button
                  type="button"
                  aria-label={t('Влево')}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label={t('Вправо')}
                  disabled={index === images.length - 1}
                  onClick={() => move(index, 1)}
                >
                  ›
                </button>
                <button type="button" aria-label={t('Удалить')} onClick={() => removeAt(index)}>
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
