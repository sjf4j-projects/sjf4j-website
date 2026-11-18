import type { GeneratedFile } from './types.ts'

const CRC_TABLE = new Uint32Array(256)
for (let n = 0; n < 256; n++) {
  let crc = n
  for (let bit = 0; bit < 8; bit++) {
    crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1
  }
  CRC_TABLE[n] = crc >>> 0
}

function checksum(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 255]
  }
  return (crc ^ 0xffffffff) >>> 0
}

const ZIP32_LIMIT = 0xffffffff

/** Minimal, dependency-free ZIP writer using the standard STORE format (no compression). */
export function createZip(files: GeneratedFile[]): Uint8Array {
  if (files.length > 65535) throw new Error('Too many files for ZIP.')

  const encoder = new TextEncoder()
  let localLength = 0
  let centralLength = 0
  const entries = files.map((file) => {
    const name = encoder.encode(file.path)
    const data = encoder.encode(file.content)
    if (name.length > 65535) throw new Error('A ZIP filename is too long.')
    if (data.length > ZIP32_LIMIT) throw new Error('A ZIP file is too large.')

    const offset = localLength
    localLength += 30 + name.length + data.length
    centralLength += 46 + name.length
    if (localLength + centralLength + 22 > ZIP32_LIMIT) {
      throw new Error('ZIP exceeds the 32-bit size limit.')
    }
    return { name, data, offset, crc: checksum(data) }
  })

  // Allocate once and copy file bytes without spreading them into function arguments.
  const output = new Uint8Array(localLength + centralLength + 22)
  const view = new DataView(output.buffer)
  let cursor = 0
  function uint16(value: number): void {
    view.setUint16(cursor, value, true)
    cursor += 2
  }
  function uint32(value: number): void {
    view.setUint32(cursor, value, true)
    cursor += 4
  }
  function write(bytes: Uint8Array): void {
    output.set(bytes, cursor)
    cursor += bytes.length
  }

  for (const { name, data, crc } of entries) {
    uint32(0x04034b50)
    uint16(20)
    uint16(0x0800) // UTF-8 filenames
    uint16(0) // STORE, uncompressed
    uint16(0) // DOS time
    uint16(0x0021) // 1980-01-01
    uint32(crc)
    uint32(data.length)
    uint32(data.length)
    uint16(name.length)
    uint16(0)
    write(name)
    write(data)
  }

  for (const { name, data, crc, offset } of entries) {
    uint32(0x02014b50)
    uint16(20)
    uint16(20)
    uint16(0x0800)
    uint16(0)
    uint16(0)
    uint16(0x0021)
    uint32(crc)
    uint32(data.length)
    uint32(data.length)
    uint16(name.length)
    uint16(0)
    uint16(0)
    uint16(0)
    uint16(0)
    uint32(0)
    uint32(offset)
    write(name)
  }

  uint32(0x06054b50)
  uint16(0)
  uint16(0)
  uint16(files.length)
  uint16(files.length)
  uint32(centralLength)
  uint32(localLength)
  uint16(0)
  return output
}
