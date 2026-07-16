import React from 'react';
import { Users, User, Heart } from 'lucide-react';
import Card from '../common/Card';

const TeamInfo = ({ profile }) => {
  return (
    <Card title="Team Structure" subtitle="Your assigned contacts during onboarding.">
      <div className="space-y-4">
        {/* Manager info row */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#EDF4FF] flex items-center justify-center text-[#0F62FE] flex-shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] text-[#8D8D8D] uppercase font-bold tracking-wider">Manager</p>
            <p className="text-xs font-semibold text-[#161616]">{profile?.manager || 'Assigning soon...'}</p>
          </div>
        </div>

        {/* Onboarding buddy info row */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#DEFBE6] flex items-center justify-center text-[#198038] flex-shrink-0">
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] text-[#8D8D8D] uppercase font-bold tracking-wider">Onboarding Buddy</p>
            <p className="text-xs font-semibold text-[#161616]">{profile?.buddy || 'Assigning soon...'}</p>
          </div>
        </div>

        {/* General team disclaimer */}
        <div className="bg-[#F4F4F4] rounded-sm p-3 border border-[#E0E0E0] mt-1.5 flex gap-2">
          <Users className="w-3.5 h-3.5 text-[#525252] flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-[#525252] leading-relaxed">
            Feel free to connect with your manager and buddy directly on Slack to introduce yourself!
          </p>
        </div>
      </div>
    </Card>
  );
};

export default TeamInfo;
