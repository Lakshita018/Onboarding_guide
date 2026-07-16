import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare } from 'lucide-react';
import Badge from '../common/Badge';

const Checklist = ({ tasks = [], onToggle }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-[#8D8D8D]">
        <CheckSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No checklist tasks assigned yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`flex items-start gap-3 p-3 rounded-sm border cursor-pointer select-none transition-colors ${
            item.completed ? 'bg-[#F4F4F4] border-[#E0E0E0]' : 'bg-white border-[#E0E0E0] hover:border-slate-300'
          }`}
          onClick={() => onToggle?.(item.id, item.completed)}
        >
          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 transition-colors ${
            item.completed ? 'bg-[#24A148] border-[#24A148]' : 'border-[#8D8D8D]'
          }`}>
            {item.completed && (
              <svg className="w-full h-full text-white p-0.5" fill="currentColor" viewBox="0 0 12 12">
                <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${item.completed ? 'text-[#8D8D8D] line-through' : 'text-[#161616]'}`}>
              {item.title}
            </p>
            {item.description && (
              <p className="text-xs text-[#8D8D8D] mt-0.5 leading-relaxed">{item.description}</p>
            )}
          </div>
          <Badge variant={item.priority} />
        </motion.div>
      ))}
    </div>
  );
};

export default Checklist;
