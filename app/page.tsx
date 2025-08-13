"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, Download, RotateCcw, Share2, Linkedin, Twitter, Loader2 } from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';

export default function Home() {
  const [userName, setUserName] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const templateRef = useRef<HTMLDivElement>(null);

  // Professional background removal using IMG.LY
  // Resize image to max 512x512 before background removal
  const resizeImage = (file: File, maxSize = 512): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            } else {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Resize failed'));
          }, 'image/png', 0.9);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processImageWithBackgroundRemoval = async (imageFile: File): Promise<string> => {
    try {
      setIsProcessing(true);
      // Resize image before background removal
      const resizedBlob = await resizeImage(imageFile, 512);
      // Use IMG.LY's background removal - works entirely in browser, use 'isnet_quint8' model for fastest speed
      const processedBlob = await removeBackground(resizedBlob, { model: 'isnet_quint8' });
      // Convert blob to data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(processedBlob);
      });
    } catch (error) {
      console.error('Background removal failed:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const originalImageUrl = e.target?.result as string;
        setUploadedImage(originalImageUrl);

        // Process image for background removal
        try {
          const processedImageUrl = await processImageWithBackgroundRemoval(file);
          setProcessedImage(processedImageUrl);
        } catch (error) {
          console.error('Failed to process image:', error);
          // Fallback to original image if background removal fails
          setProcessedImage(originalImageUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const generateBadgeImage = async (): Promise<string> => {
    if (!templateRef.current) return '';
    const canvas = canvasRef.current;
    if (!canvas) return '';
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Set canvas size to match template
    canvas.width = 800;
    canvas.height = 800;

    // Preview reference:
    // Photo: absolute top-[44%] right-[0%], w-72 h-72 (288px)
    // Name: absolute bottom-[26%] right-[9%]

    // Move image a little right and down, ensure spacing from name
    const photoDiameter = 370;
    const photoRadius = photoDiameter / 2;
    // Move photo right and down, with extra padding from right and name
    const photoCenterX = 800 - photoRadius - 10; // 10px padding from right (was 20)
    const photoCenterY = canvas.height * 0.48; // move down from 0.44 to 0.48

    // Decrease font size and move name a little further down
    const nameX = 800 - (800 * 0.22); // right: 22%
    const nameY = 800 - (800 * 0.25); // move down from 0.29 to 0.25

    // Draw the badge background image
    return new Promise((resolve) => {
      const badgeImg = new window.Image();
      badgeImg.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(badgeImg, 0, 0, canvas.width, canvas.height);

        if (processedImage && !isProcessing) {
          const userImg = new window.Image();
          userImg.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(photoCenterX, photoCenterY, photoRadius, 0, Math.PI * 2);
            ctx.clip();
            // Draw image centered in the circle
            ctx.drawImage(
              userImg,
              photoCenterX - photoRadius,
              photoCenterY - photoRadius,
              photoDiameter,
              photoDiameter
            );
            ctx.restore();

            // Draw name overlay
            if (userName) {
              ctx.fillStyle = '#374151';
              ctx.font = 'bold 20px Inter'; // even smaller font
              ctx.textAlign = 'center';
              ctx.fillText(userName.toUpperCase(), nameX, nameY);
            }
            const dataUrl = canvas.toDataURL();
            setGeneratedImageUrl(dataUrl);
            resolve(dataUrl);
          };
          userImg.src = processedImage;
        } else {
          // Draw name overlay only
          if (userName) {
            ctx.fillStyle = '#374151';
            ctx.font = 'bold 32px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(userName.toUpperCase(), nameX, nameY);
          }
          const dataUrl = canvas.toDataURL();
          setGeneratedImageUrl(dataUrl);
          resolve(dataUrl);
        }
      };
      badgeImg.src = '/Ambassador.png';
    });
  };

  const handleDownload = async () => {
    const dataUrl = await generateBadgeImage();
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = 'google-student-ambassador.png';
      link.href = dataUrl;
      link.click();
    }
  };

  const handleLinkedInShare = async () => {
    // Generate the badge image first
    await generateBadgeImage();
    
    const shareText = `Excited to share that I've been selected as a Google Student Ambassador

In this role, I'll be:
✨Turn Gemini AI from a name students know into a skill they master.
✨ Inspire creative and practical AI projects.
✨ Build a culture of innovation on campus.

Excited to turn this opportunity into a meaningful impact!

This isn't just about AI 👇🏻

it's about create, innovate, and lead the future. 🌟

💡 want to join the movement?
📍 Apply here → https://event.recodehive.com/gemini

Let's shape the future, one project at a time. 🚀

#googlegemini #pingnetwork #googlestudentambassador`;

    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(shareText)}`;
    
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  const handleTwitterShare = async () => {
    // Generate the badge image first
    await generateBadgeImage();
    
    const shareText = `Excited to share that I've been selected as a Google Student Ambassador

In this role, I'll be:
✨Turn Gemini AI from a name students know into a skill they master.
✨ Inspire creative and practical AI projects.
✨ Build a culture of innovation on campus.

Excited to turn this opportunity into a meaningful impact!

This isn't just about AI 👇🏻

it's about create, innovate, and lead the future. 🌟

💡 want to join the movement?
📍 Apply here → https://event.recodehive.com/gemini

Let's shape the future, one project at a time. 🚀

#googlegemini #pingnetwork #googlestudentambassador`;

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`;
    
    window.open(twitterUrl, '_blank', 'width=600,height=600');
  };

  const handleReset = () => {
    setUserName('');
    setUploadedImage(null);
    setProcessedImage(null);
    setIsProcessing(false);
    setGeneratedImageUrl(null);
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
                <Label htmlFor="userNameInput">Your Name</Label>
                <Input
                  id="userNameInput"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photoInput">Profile Photo</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  {uploadedImage ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={processedImage || uploadedImage}
                          alt="Uploaded"
                          className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-white shadow-lg"
                        />
                        {isProcessing && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-full">
                            <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 text-blue-500 animate-spin inline-block" />
                            Processing...
                          </>
                        ) : (
                          <>Photo uploaded successfully!</> 
                        )}
                      </p>
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
                    disabled={isProcessing}
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

              {/* LinkedIn Share Button */}
              <div className="pt-4 border-t space-y-3">
                <Button
                  onClick={handleLinkedInShare}
                  disabled={!userName && !uploadedImage}
                  className="w-full bg-[#0077B5] hover:bg-[#005885] text-white"
                  size="lg"
                >
                  <Linkedin className="h-5 w-5 mr-2" />
                  Share on LinkedIn
                </Button>
                
                <Button
                  onClick={handleTwitterShare}
                  disabled={!userName && !uploadedImage}
                  className="w-full bg-[#1DA1F2] hover:bg-[#1a91da] text-white"
                  size="lg"
                >
                  <Twitter className="h-5 w-5 mr-2" />
                  Share on Twitter
                </Button>
                
                <p className="text-sm text-gray-500 text-center">
                  Share your Google Student Ambassador achievement with your networks
                </p>
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
                  {/* Show photo in badge only after processing completes */}
                  {processedImage && !isProcessing && (
                    <div className="absolute top-[44%] right-[0%] transform -translate-y-1/2">
                      <div className="relative w-72 h-72 sm:w-64 sm:h-64 rounded-full overflow-hidden">
                        <img
                          src={processedImage ?? undefined}
                          alt="User"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  {/* User Name Overlay */}
                  {userName && (
                    <div className="absolute bottom-[26%] right-[5%] text-center">
                      <div className="text-sm sm:text-small font-bold text-gray-700 tracking-wide">
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

        {/* Footer */}
        <footer className="mt-16 border-t border-gray-200 pt-8 pb-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Need Help? Reach Out to Us</h3>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Tech Related Queries</h4>
                <a 
                  href="mailto:studentambassador@aiskillshouse.com"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  studentambassador@aiskillshouse.com
                </a>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">All Other Inquiries</h4>
                <a 
                  href="mailto:ping_googlesupport@pingnetwork.in"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  ping_googlesupport@pingnetwork.in
                </a>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Learn More</h4>
                <a 
                  href="https://www.recodehive.com/docs/docs/google-campus-ambassador-part-4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Get Gemini PRO For Free
                </a>
              </div>
            </div>
            <div className="pt-4 text-sm text-gray-500">
              <p>© This is created by community, no affiliation with any organization. For support reach out <a href="https://www.linkedin.com/in/sanjay-k-v/" className="text-blue-600 hover:text-blue-800 transition-colors">developer</a></p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
  
}