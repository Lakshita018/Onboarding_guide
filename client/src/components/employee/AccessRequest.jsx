import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Plus, Check } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

const APPLICATIONS = [
  { name: 'Slack', desc: 'Enterprise chat communication channels' },
  { name: 'Microsoft Teams', desc: 'Video conferences and business calls' },
  { name: 'GitHub Enterprise', desc: 'Developer source repositories' },
  { name: 'Jira Software', desc: 'Task coordination tracking system' },
  { name: 'IBM Cloud Portal', desc: 'Cloud virtualization console access' },
];

const AccessRequest = ({ requests = [], onRequest, onOpenNewRequest }) => {
  return (
    <div className="space-y-6">
      {/* Popular Application Cards */}
      <div>
        <h3 className="text-sm font-semibold text-[#161616] mb-3">Popular Software Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {APPLICATIONS.map((app) => {
            const hasRequested = requests.some((r) => r.application_name.toLowerCase() === app.name.toLowerCase());
            const reqObject = requests.find((r) => r.application_name.toLowerCase() === app.name.toLowerCase());

            return (
              <Card key={app.name} className="flex flex-col justify-between h-36">
                <div>
                  <h4 className="text-xs font-bold text-[#161616]">{app.name}</h4>
                  <p className="text-[10px] text-[#8D8D8D] mt-1.5 leading-normal">{app.desc}</p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[#F4F4F4]">
                  {hasRequested ? (
                    <>
                      <Badge variant={reqObject.status} />
                      <span className="text-[9px] text-[#8D8D8D]">
                        {new Date(reqObject.requested_at).toLocaleDateString()}
                      </span>
                    </>
                  ) : (
                    <button
                      onClick={() => onOpenNewRequest?.(app.name)}
                      className="text-[10px] text-[#0F62FE] hover:underline flex items-center gap-1 font-semibold focus:outline-none"
                    >
                      <Plus className="w-3 h-3" /> Request Access
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Access Requests History List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#161616]">Request History Log</h3>
          <Button icon={Plus} size="sm" onClick={() => onOpenNewRequest?.('')}>
            Custom Request
          </Button>
        </div>

        <Card noPadding>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <ShieldAlert className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#8D8D8D]" />
              <p className="text-xs text-[#8D8D8D]">No access requests registered.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F4F4F4]">
              {requests.map((req, i) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-4 flex items-center justify-between hover:bg-[#F4F4F4] transition-colors"
                >
                  <div>
                    <h4 className="text-xs font-bold text-[#161616]">{req.application_name}</h4>
                    <p className="text-[10px] text-[#8D8D8D] mt-1 line-clamp-1 max-w-md">{req.reason}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={req.status} />
                    <span className="text-[9px] text-[#8D8D8D]">
                      {new Date(req.requested_at).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AccessRequest;
