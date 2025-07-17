
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface PhotoCaptureProps {
  photoUrl: string;
  onPhotoChange: (photoUrl: string) => void;
  patientName?: string;
}

export function PhotoCapture({ photoUrl, onPhotoChange, patientName }: PhotoCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCapturing(true);
    } catch (error) {
      console.error('Erro ao acessar a câmera:', error);
      alert('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        onPhotoChange(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onPhotoChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    onPhotoChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getInitials = () => {
    return patientName 
      ? patientName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : 'P';
  };

  return (
    <div className="space-y-4">
      <Label>Foto do Paciente</Label>
      
      <div className="flex flex-col items-center space-y-4">
        {/* Preview da foto */}
        <Avatar className="w-32 h-32">
          <AvatarImage src={photoUrl} alt={patientName || 'Paciente'} />
          <AvatarFallback className="text-2xl">
            {getInitials()}
          </AvatarFallback>
        </Avatar>

        {/* Câmera em tempo real */}
        {isCapturing && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-64 h-48 rounded-lg border"
            />
            <div className="flex justify-center space-x-2 mt-2">
              <Button onClick={capturePhoto} size="sm">
                <Camera className="h-4 w-4 mr-2" />
                Capturar
              </Button>
              <Button onClick={stopCamera} variant="outline" size="sm">
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Canvas oculto para captura */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Botões de ação */}
        {!isCapturing && (
          <div className="flex space-x-2">
            <Button
              type="button"
              onClick={startCamera}
              variant="outline"
              size="sm"
            >
              <Camera className="h-4 w-4 mr-2" />
              Tirar Foto
            </Button>
            
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Selecionar Arquivo
            </Button>

            {photoUrl && (
              <Button
                type="button"
                onClick={removePhoto}
                variant="outline"
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Remover
              </Button>
            )}
          </div>
        )}

        {/* Input de arquivo oculto */}
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
