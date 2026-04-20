'use client';

import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Configuração do scanner
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.777778, // 16:9
        formatsToSupport: [ 
          Html5QrcodeSupportedFormats.EAN_13, 
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.UPC_A
        ]
      },
      /* verbose= */ false
    );

    scannerRef.current.render(
      (decodedText) => {
        // Sucesso na leitura
        onScan(decodedText);
        // Limpa o scanner após leitura bem-sucedida para evitar múltiplas leituras
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
        onClose();
      },
      (error) => {
        // Erro silencioso (comum durante a busca ativa)
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Erro ao limpar scanner:", err));
      }
    };
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Leitor de Código</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Aponte para o código de barras</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div id="reader" className="overflow-hidden rounded-2xl border-4 border-slate-50"></div>
        </div>

        <div className="p-6 bg-slate-50 text-center">
          <p className="text-xs font-bold text-slate-400">Funciona melhor em ambientes bem iluminados</p>
        </div>
      </div>
    </div>
  );
}
