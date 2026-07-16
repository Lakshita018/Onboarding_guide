import React from 'react';
import LearningResources from '../../components/employee/LearningResources';

const LearningPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#161616]">Learning & Training</h1>
        <p className="text-sm text-[#525252] mt-1">
          Mandatory compliance training and recommended courses.
        </p>
      </div>

      <LearningResources />
    </div>
  );
};

export default LearningPage;
