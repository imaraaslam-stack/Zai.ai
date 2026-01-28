import { useTopics, useStreak } from "@/hooks/use-study";
import { Link } from "wouter";
import { Plus, Flame, Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: topics, isLoading } = useTopics();
  const { data: streak } = useStreak();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Welcome & Stats Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-3 gap-6 mb-12"
      >
        <div className="md:col-span-2 space-y-2">
          <h1 className="text-4xl font-display font-black text-foreground">
            Ready to learn?
          </h1>
          <p className="text-xl text-muted-foreground">
            Continue where you left off or start something new.
          </p>
        </div>

        {/* Streak Card */}
        <div className="bg-accent/10 border-2 border-accent/20 rounded-3xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-accent-foreground font-bold text-lg mb-1">Current Streak</div>
            <div className="text-4xl font-black text-accent-foreground">{streak?.currentStreak || 0} days</div>
          </div>
          <Flame className={`w-16 h-16 ${streak?.currentStreak ? 'text-accent fill-accent animate-pulse' : 'text-muted-foreground/30'}`} />
        </div>
      </motion.div>

      {/* Topics List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Topics</h2>
          <Link href="/topic/new">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl shadow-[0_4px_0_0_var(--primary-dark)] hover:shadow-[0_2px_0_0_var(--primary-dark)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all">
              <Plus className="w-5 h-5" />
              New Topic
            </button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : topics && topics.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic, i) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/topic/${topic.id}`} className="block group">
                  <div className="h-full bg-card border-2 border-border rounded-3xl p-6 hover:border-primary/50 hover:shadow-lg transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Clock className="w-24 h-24 text-primary" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 line-clamp-1 pr-8">{topic.title}</h3>
                    <p className="text-muted-foreground text-sm mb-6 line-clamp-2">
                      {topic.summary || topic.originalContent.slice(0, 100)}...
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {topic.createdAt ? format(new Date(topic.createdAt), 'MMM d, yyyy') : 'Just now'}
                      </span>
                      <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-muted-foreground/20">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No topics yet</h3>
            <p className="text-muted-foreground mb-6">Create your first topic to start learning!</p>
            <Link href="/topic/new">
              <button className="text-primary font-bold hover:underline">
                Create Topic &rarr;
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
