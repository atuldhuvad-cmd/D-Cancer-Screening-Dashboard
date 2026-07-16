export const readWorkbookFile = async (file: File): Promise<ArrayBuffer> => {
  const buffer = await file.arrayBuffer()

  if (!buffer.byteLength) {
    throw new Error('The selected workbook is empty.')
  }

  return buffer
}
