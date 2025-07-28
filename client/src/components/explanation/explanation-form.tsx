import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Video, FileText, Send, Baby, Skull, Lightbulb, GraduationCap, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const explanationSchema = z.object({
  topicId: z.string().min(1, "Please select a topic"),
  type: z.enum(['text', 'audio', 'video']),
  content: z.string().min(100, "Explanation must be at least 100 characters"),
  feedbackMode: z.enum(['baby', 'troll', 'socratic', 'teacher']),
  isPublic: z.boolean().optional(),
});

type ExplanationData = z.infer<typeof explanationSchema>;

interface ExplanationFormProps {
  topics: any[];
  onSubmit: (data: ExplanationData & { recordedBlob?: Blob }) => void;
  isSubmitting: boolean;
}

export default function ExplanationForm({ topics, onSubmit, isSubmitting }: ExplanationFormProps) {
  const [selectedType, setSelectedType] = useState<'text' | 'audio' | 'video'>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const { toast } = useToast();

  const form = useForm<ExplanationData>({
    resolver: zodResolver(explanationSchema),
    defaultValues: {
      topicId: "",
      type: 'text',
      content: "",
      feedbackMode: 'baby',
      isPublic: true,
    },
  });

  const startRecording = async () => {
    try {
      const constraints = selectedType === 'video' 
        ? { video: true, audio: true }
        : { audio: true };
        
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { 
          type: selectedType === 'video' ? 'video/webm' : 'audio/webm' 
        });
        setRecordedBlob(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Could not access microphone/camera",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleSubmit = (data: ExplanationData) => {
    if (selectedType !== 'text' && !recordedBlob) {
      toast({
        title: "Recording required",
        description: "Please record your explanation first",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit({ ...data, type: selectedType, recordedBlob: recordedBlob || undefined });
  };

  const feedbackModes = [
    {
      value: 'baby',
      icon: Baby,
      title: 'Baby Mode',
      description: 'Simple, encouraging feedback',
      color: 'pink',
    },
    {
      value: 'troll',
      icon: Skull,
      title: 'Troll Mode',
      description: 'Challenging, provocative',
      color: 'gray',
    },
    {
      value: 'socratic',
      icon: Lightbulb,
      title: 'Socratic',
      description: 'Question-based learning',
      color: 'yellow',
    },
    {
      value: 'teacher',
      icon: GraduationCap,
      title: 'Teacher',
      description: 'Professional, detailed',
      color: 'blue',
    },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Topic Selection */}
        <FormField
          control={form.control}
          name="topicId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Topic</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a topic to explain..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {topics?.map((topic: any) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.title} ({topic.subject}) - {topic.xpReward} XP
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Explanation Type */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Explanation Type
          </Label>
          <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text" className="flex items-center space-x-2">
                <FileText size={16} />
                <span>Text</span>
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center space-x-2">
                <Mic size={16} />
                <span>Audio</span>
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center space-x-2">
                <Video size={16} />
                <span>Video</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="mt-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Explanation</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={8}
                        placeholder="Start typing your explanation here... Remember, teaching is the best way to learn!"
                        className="min-h-[200px]"
                      />
                    </FormControl>
                    <p className="text-sm text-gray-500">Minimum 100 words for evaluation</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="audio" className="mt-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Mic className="mx-auto text-gray-400 mb-4" size={48} />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Record Audio Explanation</h4>
                <p className="text-gray-600 mb-4">Click to start recording your explanation</p>
                
                {!isRecording && !recordedBlob && (
                  <Button 
                    type="button"
                    onClick={startRecording} 
                    className="bg-brand-emerald hover:bg-emerald-600 text-white"
                  >
                    <Mic size={16} className="mr-2" />
                    Start Recording
                  </Button>
                )}

                {isRecording && (
                  <Button 
                    type="button"
                    onClick={stopRecording} 
                    variant="destructive"
                  >
                    <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
                    Stop Recording
                  </Button>
                )}

                {recordedBlob && (
                  <div className="mt-4">
                    <p className="text-green-600 font-medium mb-2">✓ Recording complete!</p>
                    <Button 
                      type="button"
                      onClick={() => setRecordedBlob(null)} 
                      variant="outline"
                      size="sm"
                    >
                      Record Again
                    </Button>
                  </div>
                )}

                <p className="text-sm text-gray-500 mt-4">Maximum 10 minutes</p>
              </div>
            </TabsContent>

            <TabsContent value="video" className="mt-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Video className="mx-auto text-gray-400 mb-4" size={48} />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Record Video Explanation</h4>
                <p className="text-gray-600 mb-4">Record yourself explaining the topic</p>
                
                {!isRecording && !recordedBlob && (
                  <Button 
                    type="button"
                    onClick={startRecording} 
                    className="bg-brand-blue hover:bg-blue-600 text-white"
                  >
                    <Video size={16} className="mr-2" />
                    Start Recording
                  </Button>
                )}

                {isRecording && (
                  <Button 
                    type="button"
                    onClick={stopRecording} 
                    variant="destructive"
                  >
                    <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
                    Stop Recording
                  </Button>
                )}

                {recordedBlob && (
                  <div className="mt-4">
                    <p className="text-green-600 font-medium mb-2">✓ Recording complete!</p>
                    <Button 
                      type="button"
                      onClick={() => setRecordedBlob(null)} 
                      variant="outline"
                      size="sm"
                    >
                      Record Again
                    </Button>
                  </div>
                )}

                <p className="text-sm text-gray-500 mt-4">Maximum 15 minutes</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* AI Feedback Mode */}
        <FormField
          control={form.control}
          name="feedbackMode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AI Feedback Mode</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-2 md:grid-cols-4 gap-3"
                >
                  {feedbackModes.map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <div key={mode.value}>
                        <RadioGroupItem 
                          value={mode.value} 
                          id={mode.value} 
                          className="sr-only" 
                        />
                        <Label
                          htmlFor={mode.value}
                          className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            field.value === mode.value 
                              ? `border-${mode.color}-300 bg-${mode.color}-50` 
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          <Icon size={24} className={`mb-2 ${
                            field.value === mode.value 
                              ? `text-${mode.color}-500` 
                              : 'text-gray-500'
                          }`} />
                          <span className="font-medium text-gray-700">{mode.title}</span>
                          <span className="text-xs text-gray-600 text-center">{mode.description}</span>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center text-sm text-gray-600">
            <AlertCircle size={16} className="mr-1" />
            Your explanation will be evaluated by AI and you'll receive instant feedback
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="gradient-blue-purple border-0 hover:opacity-90"
          >
            {isSubmitting ? "Submitting..." : "Submit for Evaluation"}
            <Send size={16} className="ml-2" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
