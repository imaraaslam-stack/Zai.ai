import { useState } from "react";
import { useCreateTopic, useGenerateQuiz } from "@/hooks/use-study";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Loader2, BookOpen } from "lucide-react";
import { useLocation } from "wouter";

export default function CreateTopic() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const createTopic = useCreateTopic();
  const generateQuiz = useGenerateQuiz();
  const [, setLocation] = useLocation();

  const isPending = createTopic.isPending || generateQuiz.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      // 1. Create Topic
      const topic = await createTopic.mutateAsync({ 
        title, 
        originalContent: content 
      });
      
      // 2. Generate Quiz immediately
      await generateQuiz.mutateAsync(topic.id);
      
      // Navigation handled by mutation callbacks
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border-2 border-border rounded-3xl p-8 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Create New Study Set</h1>
            <p className="text-muted-foreground">Paste your notes and we'll generate a quiz.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Topic Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Biology"
              disabled={isPending}
              className="w-full px-5 py-4 rounded-xl bg-muted/30 border-2 border-border text-lg font-semibold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Study Content
            </label>
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your text here..."
                disabled={isPending}
                rows={10}
                className="w-full px-5 py-4 rounded-xl bg-muted/30 border-2 border-border font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none placeholder:text-muted-foreground/50"
              />
              <BookOpen className="absolute right-4 top-4 text-muted-foreground/20 w-6 h-6" />
            </div>
            <p className="text-xs text-muted-foreground text-right px-1">
              {content.length} characters
            </p>
          </div>

          <div className="pt-4 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => setLocation("/")}
              disabled={isPending}
              className="px-6 py-3 font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !title || !content}
              className="group relative flex items-center gap-2 px-8 py-3 bg-primary text-white text-lg font-bold rounded-xl shadow-[0_4px_0_0_var(--primary-dark)] hover:shadow-[0_2px_0_0_var(--primary-dark)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Create Quiz
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
