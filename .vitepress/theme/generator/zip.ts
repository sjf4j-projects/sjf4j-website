import type { GeneratedFile } from './types.ts'

function uint16(output: number[], value: number): void {
  output.push(value & 255, value >>> 8 & 255)
}
function uint32(output: number[], value: number): void {
  uint16(output, value & 65535)
  uint16(output, value >>> 16)
}

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

/** Minimal, dependency-free ZIP writer using the standard STORE format (no compression). */
export function createZip(files: GeneratedFile[]): Uint8Array {
  if (files.length > 65535) throw new Error('Too many files for ZIP.')
  const encoder = new TextEncoder()
  const local: number[] = []
  const central: number[] = []
  for (const file of files) {
    const path = encoder.encode(file.path)
    const data = encoder.encode(file.content)
    if (path.length > 65535) throw new Error('A ZIP filename is too long.')
    const offset = local.length
    const crc = checksum(data)
    const time = 0
    const date = 0x0021 // 1980-01-01

    uint32(local, 0x04034b50)
    uint16(local, 20)
    uint16(local, 0x0800) // UTF-8 filenames
    uint16(local, 0) // STORE, uncompressed
    uint16(local, time)
    uint16(local, date)
    uint32(local, crc)
    uint32(local, data.length)
    uint32(local, data.length)
    uint16(local, path.length)
    uint16(local, 0)
    local.push(...path)
    local.push(...data)

    uint32(central, 0x02014b50)
    uint16(central, 20)
    uint16(central, 20)
    uint16(central, 0x0800)
    uint16(central, 0)
    uint16(central, time)
    uint16(central, date)
    uint32(central, crc)
    uint32(central, data.length)
    uint32(central, data.length)
    uint16(central, path.length)
    uint16(central, 0)
    uint16(central, 0)
    uint16(central, 0)
    uint16(central, 0)
    uint32(central, 0)
    uint32(central, offset)
    central.push(...path)
  }

  const output: number[] = [...local, ...central]
  uint32(output, 0x06054b50)
  uint16(output, 0)
  uint16(output, 0)
  uint16(output, files.length)
  uint16(output, files.length)
  uint32(output, central.length)
  uint32(output, local.length)
  uint16(output, 0)
  return Uint8Array.from(output)
}
