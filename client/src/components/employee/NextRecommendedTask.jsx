import React, { useState } from 'react';
import { Cpu, RefreshCw } from 'lucide-react';
import Card from '../common/Card';
import LoadingSkeleton from '../common/LoadingSkeleton';

const NextRecommendedTask = ({ recommendation, onRefresh, loading }) => {
  return (
    <Card 
      title="Next Recommended Task" 
      subtitle="AI-driven suggestions powered by IBM watsonx."
      headerActions={
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1 rounded-sm text-[#525252] hover:bg-[#F4F4F4] transition-colors focus:outline-none disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      }
    >
      {loading ? (
        <LoadingSkeleton variant="text" lines={2} />
      ) : recommendation ? (
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#EDF4FF] rounded-sm text-[#0F62FE] flex-shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#161616]">{recommendation.title}</h4>
            <p className="text-[10px] text-[#8D8D8D] mt-1 leading-normal">{recommendation.description}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#EDF4FF] rounded-sm text-[#0F62FE] flex-shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#161616]">Review Checklist</h4>
            <p className="text-[10px] text-[#8D8D8D] mt-1 leading-normal">
              Review your onboarding checklist to find items that require action.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default NextRecommendedTask;
