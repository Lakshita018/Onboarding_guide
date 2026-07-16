import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Apple, Terminal, CheckCircle2 } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const OS_OPTIONS = [
  { id: 'windows', label: 'Windows', icon: Monitor, desc: 'ThinkPad standard business workspace' },
  { id: 'mac', label: 'macOS', icon: Apple, desc: 'MacBook Pro developer cockpit' },
  { id: 'linux', label: 'Linux', icon: Terminal, desc: 'Ubuntu workstation for engineering' },
];

const SetupGuide = ({ currentOs, onSave, loading }) => {
  const [selectedOs, setSelectedOs] = useState(currentOs || '');

  return (
    <div className="space-y-6">
      <Card title="OS Setup Preference" subtitle="Choose your primary laptop operating system to view custom guides.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {OS_OPTIONS.map((os) => {
            const Icon = os.icon;
            const isSelected = selectedOs === os.id;
            return (
              <div
                key={os.id}
                onClick={() => setSelectedOs(os.id)}
                className={`p-4 border rounded-sm cursor-pointer transition-all select-none ${
                  isSelected 
                    ? 'border-[#0F62FE] bg-[#EDF4FF]' 
                    : 'border-[#E0E0E0] bg-white hover:border-[#8D8D8D]'
                }`}
              >
                <Icon className={`w-8 h-8 mb-3 ${isSelected ? 'text-[#0F62FE]' : 'text-[#525252]'}`} />
                <h3 className={`text-sm font-semibold ${isSelected ? 'text-[#0F62FE]' : 'text-[#161616]'}`}>
                  {os.label}
                </h3>
                <p className="text-xs text-[#8D8D8D] mt-1">{os.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={() => onSave?.(selectedOs)} 
            loading={loading} 
            disabled={!selectedOs || selectedOs === currentOs}
          >
            {currentOs ? 'Update Choice' : 'Confirm Hardware Choice'}
          </Button>
        </div>
      </Card>

      <AnimatePresence mode="wait">
        {selectedOs && (
          <motion.div
            key={selectedOs}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card title={`${selectedOs.toUpperCase()} Enterprise Installation Guide`}>
              <div className="space-y-5 text-xs text-[#525252] leading-relaxed">
                {selectedOs === 'windows' && (
                  <>
                    <p className="font-semibold text-sm text-[#161616]">Follow these configurations for your ThinkPad machine:</p>
                    <ul className="space-y-3">
                      <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-[#0F62FE] flex-shrink-0 mt-0.5" /> <strong>W3ID setup</strong>: Log in to the corporate directory, select passkey validation options, and synchronize active directories.</li>
                      <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-[#0F62FE] flex-shrink-0 mt-0.5" /> <strong>Outlook configuration</strong>: Verify corporate mail connectivity by authenticating via your IBM single-sign-on (SSO).</li>
                      <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-[#0F62FE] flex-shrink-0 mt-0.5" /> <strong>Slack & Teams installation</strong>: Download enterprise messengers and join your team channels.</li>
                    </ul>
                  </>
                )}

                {selectedOs === 'mac' && (
                  <>
                    <p className="font-semibold text-sm text-[#161616]">Follow these configurations for your MacBook machine:</p>
                    <ul className="space-y-3">
                      <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-[#0F62FE] flex-shrink-0 mt-0.5" /> <strong>Mac security settings</strong>: Verify file vault encryption, configure firmware passwords, and authorize remote corporate keychains.</li>
                      <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-[#0F62FE] flex-shrink-0 mt-0.5" /> <strong>W3ID & Passkey synchronization</strong>: Authorize Apple secure keys for frictionless identity matching.</li>
                      <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-[#0F62FE] flex-shrink-0 mt-0.5" /> <strong>Development workspace</strong>: Setup Xcode command line utilities and import your secure IBM authentication tokens.</li>
                    </ul>
                  </>
                )}

                {selectedOs === 'linux' && (
                  <>
                    <p className="font-semibold text-sm text-[#161616]">Follow these configurations for your Ubuntu machine:</p>
                    <ul className="space-y-3">
                      <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-[#0F62FE] flex-shrink-0 mt-0.5" /> <strong>Browser setup</strong>: Install verified enterprise browser certifications and configure secure proxies.</li>
                      <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-[#0F62FE] flex-shrink-0 mt-0.5" /> <strong>W3ID verification tools</strong>: Configure open-source authentication hooks and secure shell credentials.</li>
                      <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-[#0F62FE] flex-shrink-0 mt-0.5" /> <strong>Collaboration wrappers</strong>: Setup corporate client alternatives for internal messaging channels.</li>
                    </ul>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SetupGuide;
