import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Video, ExternalLink } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

const COURSES = [
  { id: 1, title: 'IBM onboarding guide', duration: '1 hour', type: 'Guide', required: true },
  { id: 2, title: 'Cloud fundamentals', duration: '2 hours', type: 'Course', required: true },
  { id: 3, title: 'AI fundamentals (watsonx)', duration: '1.5 hours', type: 'Course', required: true },
  { id: 4, title: 'Security & Privacy Awareness', duration: '45 mins', type: 'Module', required: true },
  { id: 5, title: 'Enterprise Design Thinking', duration: '3 hours', type: 'Course', required: false },
  { id: 6, title: 'Agile at IBM Workspace', duration: '1.5 hours', type: 'Course', required: false },
];

const LearningResources = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {COURSES.map((course, i) => (
        <motion.div 
          key={course.id} 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: i * 0.05 }}
        >
          <Card hoverable className="h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-[#EDF4FF] rounded-sm text-[#0F62FE]">
                  {course.type === 'Video' ? <Video className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                </div>
                {course.required ? (
                  <Badge variant="high" label="Required" />
                ) : (
                  <Badge variant="low" label="Recommended" />
                )}
              </div>
              <h4 className="text-xs font-bold text-[#161616] mb-1">{course.title}</h4>
              <p className="text-[10px] text-[#8D8D8D]">Duration: {course.duration}</p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-[#F4F4F4] flex justify-end">
              <button className="text-[10px] font-semibold text-[#0F62FE] hover:underline flex items-center gap-1 focus:outline-none">
                Start Learning <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default LearningResources;
