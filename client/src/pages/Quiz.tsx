import { useState, useEffect } from "react";
import { useQuiz, useSubmitQuiz } from "@/hooks/use-study";
import { useRoute, useLocation } from "wouter";
import { QuizCard } from "@/components/QuizCard";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, Trophy, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";
import { type QuestionItem } from "@shared/schema";

export default function Quiz() {
  const [, params] = useRoute("/quiz/:id");
  const [, setLocation] = useLocation();
  const quizId = Number(params?.id);
  
  const { data: quiz, isLoading } = useQuiz(quizId);
  const submitQuiz = useSubmitQuiz();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Cast questions from JSON
  const questions = (quiz?.questions as unknown as QuestionItem[]) || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setShowResult(true);
    if (answer === currentQuestion.correctAnswer) {
      setScore(s => s + 1);
      // Mini confetti for correct answer
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#22c55e', '#ffffff'] // green & white
      });
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setIsCompleted(true);
    // Big confetti for completion
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#22c55e', '#3b82f6', '#eab308']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#22c55e', '#3b82f6', '#eab308']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

    await submitQuiz.mutateAsync({ id: quizId, score });
  };

  if (isLoading || !quiz) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  // --- RESULT SCREEN ---
  if (isCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    const isPerfect = percentage === 100;

    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card border-2 border-border rounded-3xl p-12 shadow-sm"
        >
          <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg rotate-12">
            <Trophy className="w-12 h-12 text-accent-foreground" />
          </div>
          
          <h2 className="text-4xl font-black mb-4 text-foreground">
            {isPerfect ? "Perfect Score!" : "Quiz Complete!"}
          </h2>
          
          <div className="text-6xl font-black text-primary mb-2">
            {score}/{questions.length}
          </div>
          <p className="text-muted-foreground font-bold mb-8 uppercase tracking-wide">Correct Answers</p>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-muted text-muted-foreground font-bold rounded-xl hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Try Again
            </button>
            <button
              onClick={() => setLocation("/")}
              className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-[0_4px_0_0_var(--primary-dark)] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_var(--primary-dark)] active:translate-y-[4px] active:shadow-none transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- QUIZ SCREEN ---
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header / Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => setLocation("/")}
            className="text-muted-foreground hover:text-foreground font-bold"
          >
            <span className="text-lg">✕</span>
          </button>
          <div className="h-4 flex-1 mx-6 bg-muted rounded-full overflow-hidden relative">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
            {/* Glossy overlay */}
            <div className="absolute top-1 left-2 right-2 h-1 bg-white/20 rounded-full" />
          </div>
          <span className="font-bold text-muted-foreground">
            {currentQuestionIndex + 1}/{questions.length}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <QuizCard
            question={currentQuestion}
            onAnswer={handleAnswer}
            selectedAnswer={selectedAnswer}
            showResult={showResult}
          />
        </motion.div>
      </AnimatePresence>

      {/* Footer Actions */}
      <div className="mt-8 h-20 border-t-2 border-border/50 pt-6 flex justify-end">
        {showResult && (
          <button
            onClick={handleNext}
            className={`
              px-8 py-3 rounded-xl font-bold text-lg flex items-center gap-2 transition-all
              ${selectedAnswer === currentQuestion.correctAnswer 
                ? "bg-success text-success-foreground shadow-[0_4px_0_0_#15803d]" 
                : "bg-destructive text-white shadow-[0_4px_0_0_#b91c1c]"}
              hover:translate-y-[2px] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.2)] active:translate-y-[4px] active:shadow-none
            `}
          >
            {currentQuestionIndex === questions.length - 1 ? "Finish" : "Next"}
            <ArrowRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}
