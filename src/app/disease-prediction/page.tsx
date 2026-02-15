'use client';

import {
  plantDiseaseDiagnosis,
  type PlantDiseaseDiagnosisOutput,
} from '@/ai/flows/plant-disease-diagnosis-flow';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Bot, CircleDashed, Image as ImageIcon, Upload } from 'lucide-react';
import Image from 'next/image';
import { useState, useTransition } from 'react';

const placeholder = PlaceHolderImages.find(
  (p) => p.id === 'disease-upload-placeholder'
)!;

export default function DiseasePredictionPage() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<PlantDiseaseDiagnosisOutput | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
            variant: "destructive",
            title: "Image too large",
            description: "Please upload an image smaller than 4MB.",
        })
        return;
      }
      setResult(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setDataUrl(reader.result as string);
        setPreviewUrl(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!dataUrl) {
      toast({
        variant: "destructive",
        title: "No image selected",
        description: "Please upload an image of the plant.",
      });
      return;
    }

    startTransition(async () => {
      const diagnosis = await plantDiseaseDiagnosis({
        photoDataUri: dataUrl,
        description,
      });
      setResult(diagnosis);
    });
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Disease Diagnosis</CardTitle>
          <CardDescription>
            Upload an image of an affected plant to get an AI diagnosis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plant-image">Plant Image</Label>
              <div className="relative aspect-video w-full overflow-hidden rounded-md border-2 border-dashed">
                <Image
                  src={previewUrl || placeholder.imageUrl}
                  alt="Plant preview"
                  fill
                  className="object-cover"
                  data-ai-hint={placeholder.imageHint}
                />
                {isPending && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                    <CircleDashed className="mb-2 h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Analyzing image...</p>
                  </div>
                )}
                 <div className={cn(
                  "absolute inset-0 flex flex-col items-center justify-center bg-background/50 opacity-0 transition-opacity",
                  !previewUrl && "opacity-100",
                  "hover:opacity-100"
                )}>
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Click to upload or drag & drop</p>
                </div>
                 <Input
                  id="plant-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  disabled={isPending}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Symptoms (Optional)</Label>
              <Textarea
                id="description"
                placeholder="e.g., Yellow spots on leaves, wilting stems..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending || !dataUrl}>
              <Upload className="mr-2 h-4 w-4" />
              Diagnose Plant
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>AI Diagnosis Report</CardTitle>
          <CardDescription>
            The diagnosis from our AI will appear below.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          {(isPending || result) ? (
            <div className="space-y-4">
                {result?.diseaseIdentification.isDiseased ? (
                    <>
                        <div className='flex items-center justify-between'>
                            <h3 className="text-xl font-bold font-headline text-destructive-foreground/90">{result.diseaseIdentification.diseaseName}</h3>
                            <Badge variant="destructive">Diseased</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{result.diseaseIdentification.description}</p>
                        <div>
                            <Label className='text-xs'>Confidence</Label>
                            <Progress value={result.diseaseIdentification.confidence * 100} className="h-2" />
                            <p className='text-xs text-right text-muted-foreground'>{(result.diseaseIdentification.confidence * 100).toFixed(0)}%</p>
                        </div>
                        <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Treatment Suggestions</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                        {result.treatmentSuggestions.map((tip, i) => <li key={i}>{tip}</li>)}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>Preventative Measures</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                        {result.preventativeMeasures.map((tip, i) => <li key={i}>{tip}</li>)}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </>
                ) : (
                  result && !result.diseaseIdentification.isDiseased && (
                    <div className="text-center p-8">
                       <h3 className="text-xl font-bold font-headline text-primary">Plant Appears Healthy</h3>
                       <p className="text-sm text-muted-foreground mt-2">No disease was detected in the provided image.</p>
                    </div>
                  )
                )}
            </div>
          ) : (
            <div className="flex h-full min-h-64 items-center justify-center text-center">
              <div>
                <Bot className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Upload a plant image and click diagnose to see the report.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
