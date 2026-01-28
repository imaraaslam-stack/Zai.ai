import { motion } from "framer-motion";
import { BookOpen, Sparkles, BrainCircuit, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transform -rotate-6 shadow-[0_4px_0_0_rgba(0,0,0,0.1)]">
            <span className="text-white font-display font-bold text-2xl">S</span>
          </div>
          <span className="font-display font-bold text-2xl text-primary tracking-tight">StudyBuddy</span>
        </div>
        <a 
          href="/api/login"
          className="px-6 py-2.5 rounded-xl font-bold border-2 border-primary text-primary hover:bg-primary/5 transition-colors"
        >
          Login
        </a>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center max-w-4xl mx-auto py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent-foreground font-bold text-sm mb-8 border border-accent/20">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Learning</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-black text-foreground mb-6 leading-tight">
            Turn your notes into <span className="text-primary relative inline-block">
              Quizzes
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Paste your study material, and we'll instantly generate interactive quizzes to help you learn faster. It's like magic, but for your grades.
          </p>

          <a 
            href="/api/login"
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white text-xl font-bold rounded-2xl shadow-[0_6px_0_0_var(--primary-dark)] hover:shadow-[0_4px_0_0_var(--primary-dark)] hover:translate-y-[2px] active:translate-y-[6px] active:shadow-none transition-all w-full sm:w-auto"
          >
            Get Started for Free
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 w-full text-left">
          {[
            {
              icon: BookOpen,
              title: "Paste Content",
              desc: "Copy text from anywhere - textbooks, notes, or articles.",
              color: "bg-blue-500"
            },
            {
              icon: BrainCircuit,
              title: "AI Generation",
              desc: "Our AI breaks it down into bite-sized topics and questions.",
              color: "bg-purple-500"
            },
            {
              icon: Sparkles,
              title: "Master It",
              desc: "Take interactive quizzes and track your streak daily.",
              color: "bg-yellow-500"
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              className="p-8 rounded-3xl border-2 border-border bg-card hover:border-primary/20 hover:shadow-lg transition-all"
            >
              <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-muted-foreground">
        <p>© 2024 StudyBuddy. Make learning fun.</p>
      </footer>
    </div>
  );
}
