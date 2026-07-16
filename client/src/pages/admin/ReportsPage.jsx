import React from 'react';
import Card from '../../common/Card';

const AdminReportsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#161616]">Reports</h1>
        <p className="text-sm text-[#525252] mt-1">Generate and view onboarding compliance reports.</p>
      </div>

      <Card>
        <div className="text-center py-12">
          <p className="text-sm font-medium text-[#525252]">Reporting module is currently in development.</p>
          <p className="text-xs text-[#8D8D8D] mt-2">Check back later for exportable CSV and PDF reports.</p>
        </div>
      </Card>
    </div>
  );
};

export default AdminReportsPage;
