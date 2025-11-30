// export const SUPPORTED_FILE_EXTS = ["epub", "mobi", "azw", "azw3", "fb2", "zip", "cbz", "pdf", "txt"];
export const SUPPORTED_FILE_EXTS = ['epub', 'azw3']
export const FILE_ACCEPT_FORMATS = SUPPORTED_FILE_EXTS.map(
  (ext) => `.${ext}`
).join(', ')
