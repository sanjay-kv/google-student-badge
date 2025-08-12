"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, Download, RotateCcw } from 'lucide-react';

export default function Home() {
  const [userName, setUserName] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const templateRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (!templateRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match template
    canvas.width = 800;
    canvas.height = 800;

    // Create background with gradient
    const gradient = ctx.createLinearGradient(0, 0, 800, 800);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 800);

    // Draw the template background elements
    // Top-right blue shape
    ctx.beginPath();
    ctx.fillStyle = '#3b82f6';
    ctx.roundRect(600, 0, 200, 300, [0, 50, 0, 50]);
    ctx.fill();

    // Bottom-right purple shape
    ctx.beginPath();
    ctx.fillStyle = '#8b5cf6';
    ctx.roundRect(600, 600, 200, 200, [50, 0, 0, 0]);
    ctx.fill();

    // Draw logo area (simplified)
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 24px Inter';
    ctx.fillText('📦', 50, 180);

    // Draw main text
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 72px Inter';
    ctx.fillText('Google', 50, 320);
    ctx.fillText('Student', 50, 420);
    ctx.fillText('Ambassador', 50, 520);

    // Draw user image if uploaded
    if (uploadedImage) {
      const img = new Image();
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(650, 350, 100, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, 550, 250, 200, 200);
        ctx.restore();

        // Draw name
        if (userName) {
          ctx.fillStyle = '#6b7280';
          ctx.font = 'bold 32px Inter';
          ctx.textAlign = 'center';
          ctx.fillText(userName.toUpperCase(), 650, 500);
        }

        // Download
        const link = document.createElement('a');
        link.download = 'google-student-ambassador.png';
        link.href = canvas.toDataURL();
        link.click();
      };
      img.src = uploadedImage;
    } else {
      // Draw name without image
      if (userName) {
        ctx.fillStyle = '#6b7280';
        ctx.font = 'bold 32px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(userName.toUpperCase(), 650, 500);
      }

      // Download
      const link = document.createElement('a');
      link.download = 'google-student-ambassador.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const handleReset = () => {
    setUserName('');
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Google Student Ambassador
          </h1>
          <p className="text-gray-600 text-lg">
            Create your personalized Google Student Ambassador template
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Customize Your Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Profile Photo</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  {uploadedImage ? (
                    <div className="space-y-4">
                      <img
                        src={uploadedImage}
                        alt="Uploaded"
                        className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-white shadow-lg"
                      />
                      <p className="text-sm text-gray-600">Photo uploaded successfully!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-gray-600">Click to upload your photo</p>
                        <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4"
                  >
                    {uploadedImage ? 'Change Photo' : 'Choose Photo'}
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleDownload}
                  disabled={!userName && !uploadedImage}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  disabled={!userName && !uploadedImage}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div 
                  ref={templateRef}
                  className="relative max-w-full rounded-2xl shadow-2xl overflow-hidden"
                  style={{ maxWidth: '500px' }}
                >
                  <img
                    src="/Ambassador.png"
                    alt="Google Student Ambassador Badge"
                    className="w-full h-auto block"
                  />
                  
                  {/* User Photo Overlay */}
                  {uploadedImage && (
                    <div className="absolute top-[30%] right-[8%] transform -translate-y-1/2">
                      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden">
                        <img
                          src={uploadedImage}
                          alt="User"
                          className="w-full h-full object-cover"
                          style={{
                            clipPath: 'circle(50% at 50% 50%)'
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* User Name Overlay */}
                  {userName && (
                    <div className="absolute bottom-[20%] right-[8%] text-center">
                      <div className="text-lg sm:text-xl font-bold text-gray-800 tracking-wider uppercase">
                        {userName.toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <canvas
          ref={canvasRef}
          className="hidden"
          width="800"
          height="800"
        />
      </div>
    </div>
  );
}