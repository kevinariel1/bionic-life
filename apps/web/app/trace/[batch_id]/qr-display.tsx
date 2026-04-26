'use client'

import { QRCodeSVG } from 'qrcode.react'

export function QRDisplay({ value, size = 80 }: { value: string; size?: number }) {
  return (
    <QRCodeSVG
      value={value}
      size={size}
      fgColor="#1c1917"
      bgColor="white"
      level="M"
    />
  )
}
