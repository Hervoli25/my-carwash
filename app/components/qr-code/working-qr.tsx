
'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface WorkingQRProps {
  value: string;
  size?: number;
  className?: string;
}

export function WorkingQR({ value, size = 128, className = "" }: WorkingQRProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      generateQRCode(value, canvasRef.current, size);
    }
  }, [value, size]);

  const generateQRCode = async (text: string, canvas: HTMLCanvasElement, size: number) => {
    try {
      await QRCode.toCanvas(canvas, text, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  return (
    <canvas 
      ref={canvasRef}
      className={`border border-gray-300 rounded ${className}`}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
