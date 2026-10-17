import { useCallback, useId } from 'react'
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
  value: string | null
  onChange: (url: string | null) => void
  onError: (message: string) => void
  /** Optional caption under the frame (e.g. product name). */
  caption?: string
}

/**
 * Single cover image field — drag & drop, centered preview, replace/remove.
 * Matches common commerce-admin patterns (Shopify / admin UIs), not a fake PDP mock.
 */
export function CoverImageField({ value, onChange, onError, caption }: Props) {
  const { t } = useI18n()
  const labelId = useId()

  const applyFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return
      if (!file.type.startsWith('image/')) {
        onError(t('Выберите файл изображения'))
        return
      }
      if (file.size > 4 * 1024 * 1024) {
        onError(t('Фото должно быть меньше 4 МБ'))
        return
      }
      try {
        onChange(await readFileAsDataUrl(file))
      } catch {
        onError(t('Не удалось прочитать фото'))
      }
    },
    [onChange, onError, t],
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: (files) => void applyFile(files[0]),
    accept: { 'image/*': [] },
    multiple: false,
    noClick: Boolean(value),
    noKeyboard: Boolean(value),
  })

  return (
    <div className="cover-field">
      <div
        {...getRootProps()}
        className={`cover-field__frame${isDragActive ? ' is-dragging' : ''}${
          value ? ' has-image' : ''
        }`}
        aria-labelledby={labelId}
      >
        <input {...getInputProps()} />

        {value ? (
          <img className="cover-field__img" src={value} alt="" />
        ) : (
          <div className="cover-field__empty">
            <span className="cover-field__icon" aria-hidden>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 16l4.5-4.5a2 2 0 012.8 0L16 16m-2-2 1.2-1.2a2 2 0 012.8 0L20 15M8 8h.01M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <strong id={labelId}>{t('Обложка товара')}</strong>
            <span>{t('Перетащите фото или нажмите, чтобы выбрать')}</span>
          </div>
        )}

        {value ? (
          <div className="cover-field__toolbar">
            <button type="button" onClick={(e) => { e.stopPropagation(); open() }}>
              {t('Заменить')}
            </button>
            <button
              type="button"
              className="cover-field__toolbar-danger"
              onClick={(e) => {
                e.stopPropagation()
                onChange(null)
              }}
            >
              {t('Удалить')}
            </button>
          </div>
        ) : null}
      </div>

      {caption?.trim() ? (
        <p className="cover-field__caption">{caption.trim()}</p>
      ) : (
        <p className="cover-field__hint">
          {t('Главное фото в каталоге и на странице товара')}
        </p>
      )}
    </div>
  )
}
