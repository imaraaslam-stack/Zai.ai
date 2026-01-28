import { motion } from "framer-motion";
import { type QuestionItem } from "@shared/schema";
import { Check, X } from "lucide-react";
import { clsx } from "clsx";

interface QuizCardProps {
  question: QuestionItem;
  onAnswer: (option: string) => void;
  selectedAnswer: string | null;
  showResult: boolean;
}

export function QuizCard({ question, onAnswer, selectedAnswer, showResult }: QuizCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Question Bubble */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-card border-2 border-border p-6 rounded-2xl shadow-[0_4px_0_0_rgba(0,0,0,0.05)] relative">
          <h3 className="text-xl md:text-2xl font-bold text-foreground leading-relaxed">
            {question.question}
          </h3>
          {/* Decorative tail for speech bubble look */}
          <div className="absolute -bottom-3 left-8 w-6 h-6 bg-card border-b-2 border-r-2 border-border transform rotate-45" />
        </div>
      </motion.div>

      {/* Options Grid */}
      <div className="grid gap-4">
        {question.options.map((option, idx) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === question.correctAnswer;
          
          let variantClass = "border-border bg-card hover:bg-muted/50 hover:border-primary/50";
          
          if (showResult) {
            if (isCorrect) {
              variantClass = "border-success bg-success/10 text-success-foreground";
            } else if (isSelected && !isCorrect) {
              variantClass = "border-destructive bg-destructive/10 text-destructive";
            } else {
              variantClass = "opacity-50 border-border";
            }
          } else if (isSelected) {
            variantClass = "border-primary bg-primary/10 ring-2 ring-primary/20";
          }

          return (
            <motion.button
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => !showResult && onAnswer(option)}
              disabled={showResult}
              className={clsx(
                "group relative w-full p-4 md:p-5 text-left rounded-xl border-2 font-semibold text-lg transition-all duration-200",
                "btn-3d shadow-[0_2px_0_0_rgba(0,0,0,0.05)] active:shadow-none active:translate-y-[2px]",
                variantClass
              )}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {showResult && isCorrect && <Check className="w-6 h-6 text-success" />}
                {showResult && isSelected && !isCorrect && <X className="w-6 h-6 text-destructive" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Explanation Reveal */}
      {showResult && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className={clsx(
            "mt-6 p-6 rounded-2xl border-2",
            selectedAnswer === question.correctAnswer 
              ? "bg-success/10 border-success/20" 
              : "bg-destructive/10 border-destructive/20"
          )}
        >
          <div className="font-bold mb-2 flex items-center gap-2">
            {selectedAnswer === question.correctAnswer ? (
              <span className="text-success flex items-center gap-2"><Check className="w-5 h-5"/> Correct!</span>
            ) : (
              <span className="text-destructive flex items-center gap-2"><X className="w-5 h-5"/> Incorrect</span>
            )}
          </div>
          <p className="text-foreground/80 leading-relaxed">
            {question.explanation}
          </p>
        </motion.div>
      )}
    </div>
  );
}
