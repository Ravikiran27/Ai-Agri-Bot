'use client';

import {
  recommendCrop,
  type CropRecommendationInput,
  type CropRecommendationOutput,
} from '@/ai/flows/crop-recommendation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { Leaf, Bot, CircleDashed } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { auth } from "@/lib/firebase";

const formSchema = z.object({
  soilpH: z.coerce.number().min(0).max(14),
  nitrogenLevel: z.coerce.number().min(0),
  phosphorusLevel: z.coerce.number().min(0),
  potassiumLevel: z.coerce.number().min(0),
  farmingGoals: z.string().min(10, 'Please describe your goals in more detail.'),
  location: z.string().optional(),
});

export default function CropRecommendationPage() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<CropRecommendationOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      soilpH: 7.0,
      nitrogenLevel: 50,
      phosphorusLevel: 50,
      potassiumLevel: 50,
      farmingGoals: '',
      location: '',
    },
  });

  async function logCropHistory(input: CropRecommendationInput, output: CropRecommendationOutput) {
    const user = auth.currentUser;
    if (!user) return;
    await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user.uid,
        type: "crop-recommendation",
        data: { input, output },
      }),
    });
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    setResult(null);
    startTransition(async () => {
      const recommendation = await recommendCrop(values as CropRecommendationInput);
      setResult(recommendation);
      await logCropHistory(values as CropRecommendationInput, recommendation);
    });
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Crop Advisor</CardTitle>
            <CardDescription>
              Enter your soil data and goals to get crop recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="soilpH"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Soil pH</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nitrogenLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nitrogen (ppm)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phosphorusLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phosphorus (ppm)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="potassiumLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Potassium (ppm)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Central Valley, California" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="farmingGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farming Goals</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., maximize yield, drought resistance, organic farming..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? (
                    <>
                      <CircleDashed className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Get Recommendations'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
            <CardDescription>
              Our AI will provide personalized crop advice here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isPending && (
              <div className="flex h-64 items-center justify-center">
                 <div className="text-center">
                    <Bot className="mx-auto mb-4 h-12 w-12 animate-pulse text-primary" />
                    <p className="text-muted-foreground">Generating recommendations...</p>
                 </div>
              </div>
            )}
            {result && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Recommended Crops</h3>
                  {result.recommendedCrops.map((crop) => (
                    <Card key={crop.name} className="bg-background/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Leaf className="text-primary" /> {crop.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <h4 className="font-semibold">Why this crop?</h4>
                          <p className="text-sm text-muted-foreground">{crop.explanation}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold">Cultivation Tips</h4>
                          <p className="text-sm text-muted-foreground">{crop.cultivationTips}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div>
                   <h3 className="font-semibold text-lg mb-2">Overall Advice</h3>
                   <p className="text-sm text-muted-foreground">{result.overallAdvice}</p>
                </div>
              </div>
            )}
            {!isPending && !result && (
              <div className="flex h-64 items-center justify-center text-center text-muted-foreground">
                <p>Your recommendations will appear here once you submit the form.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
