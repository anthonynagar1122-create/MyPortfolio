"use client";

import { motion } from "framer-motion";
import { principles } from "@/config/principles";
import { staggerContainerVariants, staggerItemVariants } from "@/lib/animations";

export function PrinciplesSection() {
  const colorMap = {
    blue: "from-blue-500/10 to-blue-500/5 border-blue-200",
    green: "from-emerald-500/10 to-emerald-500/5 border-emerald-200",
    purple: "from-purple-500/10 to-purple-500/5 border-purple-200",
  };

  const textColorMap = {
    blue: "text-blue-700",
    green: "text-emerald-700",
    purple: "text-purple-700",
  };

  return (
    <section id="principles" className="py-24 md:py-32 lg:py-48 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary-500 mb-4">
            <motion.div
              className="w-2 h-2 bg-primary-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            How We Build
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-700 text-neutral-900 mb-6">
            Three Principles Guide Every Decision
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Security, society, and experience. These aren't just ideals—they're built into how we design, develop, and deploy.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {principles.map((principle, idx) => (
            <motion.div key={principle.id} variants={staggerItemVariants}>
              <div
                className={`bg-gradient-to-br ${colorMap[principle.accentColor]} border rounded-2xl p-8 h-full flex flex-col hover:shadow-lg transition-shadow`}
              >
                <div className="text-5xl mb-6">{principle.icon}</div>

                <h3 className={`text-2xl font-bold ${textColorMap[principle.accentColor]} mb-2`}>
                  {principle.name}
                </h3>

                <p className="text-sm font-medium text-neutral-600 mb-6">
                  {principle.tagline}
                </p>

                <p className="text-neutral-700 mb-8 leading-relaxed flex-grow">
                  {principle.description}
                </p>

                <div className="space-y-3 pt-6 border-t border-neutral-200">
                  {principle.commitments.slice(0, 3).map((commitment, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <span className={`text-${principle.accentColor === 'blue' ? 'blue' : principle.accentColor === 'green' ? 'emerald' : 'purple'}-600 font-bold flex-shrink-0`}>
                        ✓
                      </span>
                      <span className="text-neutral-700">{commitment}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
