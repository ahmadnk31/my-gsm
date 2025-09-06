import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './card';
import { Button } from './button';

interface ImageDropzoneProps {
  onFileSelect: (file: File | null) => void;
  currentImageUrl?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxSize?: number; // in bytes
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onFileSelect,
  currentImageUrl,
  placeholder = "Drop an image here, or click to select",
  className,
  disabled = false,
  maxSize = 5 * 1024 * 1024 // 5MB default
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
        setError(`File is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`);
      } else if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
        setError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      } else {
        setError('Invalid file. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      onFileSelect(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  }, [onFileSelect, maxSize]);

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    setError(null);
    onFileSelect(null);
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize,
    multiple: false,
    disabled
  });

  const displayImage = preview || currentImageUrl;
  const hasError = isDragReject || error;

  return (
    <div className={cn("space-y-2", className)}>
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragActive && !isDragReject && "border-primary bg-primary/5",
          hasError && "border-destructive bg-destructive/5",
          disabled && "opacity-50 cursor-not-allowed",
          !hasError && !isDragActive && "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="p-6">
          {displayImage ? (
            <div className="space-y-4">
              <div className="relative inline-block">
                <img
                  src={displayImage}
                  alt="Preview"
                  className="max-w-full max-h-48 object-contain rounded border"
                />
                {!disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              {!disabled && (
                <p className="text-sm text-muted-foreground text-center">
                  Click or drop a new image to replace
                </p>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                {hasError ? (
                  <AlertCircle className="h-6 w-6 text-destructive" />
                ) : isDragActive ? (
                  <Upload className="h-6 w-6 text-primary animate-bounce" />
                ) : (
                  <Image className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              
              <div className="mt-4">
                <p className="text-sm font-medium text-foreground">
                  {isDragActive
                    ? "Drop the image here"
                    : placeholder
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPEG, PNG, GIF, WebP up to {Math.round(maxSize / 1024 / 1024)}MB
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
};
