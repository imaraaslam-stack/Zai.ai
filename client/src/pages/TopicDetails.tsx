import { useTopic, useGenerateQuiz } from "@/hooks/use-study";
import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, Play, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function TopicDetails() {
  const [, params] = useRoute("/topic/:id");
  const [, setLocation] = useLocation();
  const topicId = Number(params?.id);
  
  const { data: topic, isLoading } = useTopic(topicId);
  const generateQuiz = useGenerateQuiz();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!topic) return <div>Topic not found</div>;

  const handleStartQuiz = async () => {
    // Generate a fresh quiz for this topic
    await generateQuiz.mutateAsync(topic.id);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button 
        onClick={() => setLocation("/")}
        className="flex items-center gap-2 text-muted-foreground hover:text-primary font-bold mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border-2 border-border rounded-3xl overflow-hidden shadow-sm"
      >
        <div className="bg-primary/5 p-8 border-b-2 border-border">
          <h1 className="text-3xl font-display font-black mb-4">{topic.title}</h1>
          <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {topic.createdAt && format(new Date(topic.createdAt), 'MMMM d, yyyy')}
            </span>
            <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
            <span>{topic.originalContent.length} chars</span>
          </div>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start gap-8 mb-8">
            <div className="prose prose-stone max-w-none">
              <h3 className="font-bold text-xl mb-2">Original Content</h3>
              <div className="bg-muted/30 p-6 rounded-2xl border-2 border-border text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {topic.originalContent}
              </div>
            </div>
            
            <div className="shrink-0 sticky top-24">
              <button
                onClick={handleStartQuiz}
                disabled={generateQuiz.isPending}
                className="w-full md:w-auto px-8 py-4 bg-primary text-white text-lg font-bold rounded-2xl shadow-[0_6px_0_0_var(--primary-dark)] hover:shadow-[0_4px_0_0_var(--primary-dark)] hover:translate-y-[2px] active:translate-y-[6px] active:shadow-none transition-all flex flex-col items-center gap-2"
              >
                {generateQuiz.isPending ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <>
                    <Play className="w-8 h-8 fill-current" />
                    <span>Start Quiz</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
