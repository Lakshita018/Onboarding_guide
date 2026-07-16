import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Video, ExternalLink } from 'lucide-react';
import Card from '../../common/Card';
import Badge from '../../common/Badge';

const COURSES = [
  { id: 1, title: 'IBM watsonx AI Foundations', duration: '2 hours', type: 'Course', required: true },
  { id: 2, title: 'Security & Privacy Awareness', duration: '45 mins', type: 'Module', required: true },
  { id: 3, title: 'Enterprise Design Thinking', duration: '3 hours', type: 'Course', required: false },
  { id: 4, title: 'Agile at IBM', duration: '1.5 hours', type: 'Course', required: false },
];

const LearningPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#161616]">Learning & Training</h1>
        <p className="text-sm text-[#525252] mt-1">
          Mandatory compliance training and recommended courses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {COURSES.map((course, i) => (
          <motion.div key={course.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card hoverable className="h-full flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-[#EDF4FF] rounded-sm">
                  {course.type === 'Course' ? (
                    <BookOpen className="w-5 h-5 text-[#0F62FE]" />
                  ) : (
                    <Video className="w-5 h-5 text-[#0F62FE]" />
                  )}
                </div>
                {course.required && <Badge variant="high" label="Mandatory" />}
              </div>
              <h3 className="text-sm font-bold text-[#161616] mb-1">{course.title}</h3>
              <p className="text-xs text-[#8D8D8D] mb-4">Duration: {course.duration}</p>
              
              <div className="mt-auto pt-4 border-t border-[#E0E0E0]">
                <button className="text-xs font-semibold text-[#0F62FE] hover:underline flex items-center gap-1">
                  Go to Course <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LearningPage;
