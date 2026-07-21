import React from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import Card from '../common/Card';

const AdminStats = ({ stats }) => {
  const cards = [
    {
      title: 'Total Employees',
      value: stats?.totalEmployees ?? 0,
      icon: Users,
      color: 'bg-[#EDF4FF] text-[#0F62FE]',
      desc: 'Registered profiles',
    },
    {
      title: 'Completed Onboarding',
      value: stats?.completed ?? 0,
      icon: CheckCircle,
      color: 'bg-[#DEFBE6] text-[#198038]',
      desc: 'All checklist items verified',
    },
    {
      title: 'In Progress',
      value: stats?.inProgress ?? 0,
      icon: TrendingUp,
      color: 'bg-[#EDF4FF] text-[#0043CE]',
      desc: 'Active onboarding checklists',
    },
    {
      title: 'Pending Action',
      value: stats?.pendingDocuments ?? 0,
      icon: AlertTriangle,
      color: 'bg-[#FFF8E1] text-[#8A6914]',
      desc: 'Docs/tasks awaiting review',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card hoverable className="p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-[#8D8D8D] uppercase tracking-wider">{card.title}</span>
                <span className={`p-1.5 rounded-sm ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#161616] tracking-tight">{card.value}</p>
                <p className="text-[10px] text-[#8D8D8D] mt-1">{card.desc}</p>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AdminStats;
