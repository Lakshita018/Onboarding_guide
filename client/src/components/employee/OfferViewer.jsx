import React, { useState } from 'react';
import { FileText, CheckCircle, AlertCircle, Calendar, Briefcase, Landmark } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';

const OfferViewer = ({ profile, onAccept, loading }) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  return (
    <Card 
      title="Official Employment Offer" 
      subtitle="Please review the terms and conditions of your employment contract with IBM."
      accent={!profile?.offer_accepted}
    >
      <div className="space-y-6">
        {/* Offer Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#F4F4F4] p-4 rounded-sm border border-[#E0E0E0]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-sm text-[#0F62FE]">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-[#8D8D8D] uppercase font-bold tracking-wider">Position</p>
              <p className="text-xs font-semibold text-[#161616]">{profile?.designation || 'Specialist'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-sm text-[#0F62FE]">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-[#8D8D8D] uppercase font-bold tracking-wider">Department</p>
              <p className="text-xs font-semibold text-[#161616]">{profile?.department || 'Software Group'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-sm text-[#0F62FE]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-[#8D8D8D] uppercase font-bold tracking-wider">Joining Date</p>
              <p className="text-xs font-semibold text-[#161616]">
                {profile?.joining_date ? new Date(profile.joining_date).toLocaleDateString() : 'Immediate'}
              </p>
            </div>
          </div>
        </div>

        {/* Contract Text */}
        <div className="border border-[#E0E0E0] rounded-sm p-5 h-64 overflow-y-auto bg-white text-xs text-[#525252] leading-relaxed space-y-4">
          <h4 className="font-bold text-[#161616] text-sm">Employment Agreement & Terms</h4>
          <p>
            This agreement is made between International Business Machines Corporation (IBM) and the candidate.
            Upon acceptance, you agree to comply with all IBM standards, guidelines, intellectual property rules,
            and confidentiality obligations as outlined in the IBM Business Conduct Guidelines.
          </p>
          <h5 className="font-bold text-[#161616]">1. Code of Conduct</h5>
          <p>
            You agree to maintain the highest standards of professional ethics, respect intellectual property,
            and keep all confidential information secure. Unauthorized disclosure of trade secrets or client information is strictly prohibited.
          </p>
          <h5 className="font-bold text-[#161616]">2. Asset & Resource Usage</h5>
          <p>
            IBM will configure a secure developer workspace and provision hardware resources based on your role requirement.
            All systems must be used in accordance with security guidelines.
          </p>
          <h5 className="font-bold text-[#161616]">3. Compliance & Training</h5>
          <p>
            Before your designated joining date, you must upload all required identity credentials and verify
            educational certificates through the IBM Onboarding Platform.
          </p>
        </div>

        {/* Acceptance Controls */}
        <div className="border-t border-[#E0E0E0] pt-5">
          {profile?.offer_accepted ? (
            <div className="flex items-center gap-3 text-[#198038] bg-[#DEFBE6] p-4 rounded-sm border border-[#24A148]/30">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold">Offer Accepted & Signed</p>
                <p className="text-[10px] opacity-80">You accepted this offer on the onboarding portal.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#0F62FE] border-[#E0E0E0] focus:ring-[#0F62FE]"
                />
                <span className="text-xs text-[#525252] leading-tight">
                  I accept and agree to all employment terms, rules of conduct, and compliance schedules listed in this offer letter.
                </span>
              </label>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={onAccept}
                  disabled={!acceptedTerms || loading}
                  loading={loading}
                  className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider bg-[#0F62FE] hover:bg-[#0353E9] text-white rounded-sm"
                >
                  Accept & Sign Offer
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default OfferViewer;
