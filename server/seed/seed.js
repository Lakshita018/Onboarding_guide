const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const User = require('../models/User');
const Employee = require('../models/Employee');
const ChecklistItem = require('../models/ChecklistItem');
const Document = require('../models/Document');
const Task = require('../models/Task');
const AccessRequest = require('../models/AccessRequest');
const ChatLog = require('../models/ChatLog');
const { ROLES, ONBOARDING_STAGES, OS_TYPES, CHECKLIST_PRIORITIES, DOCUMENT_TYPES, DOCUMENT_STATUS, TASK_STATUS, ACCESS_REQUEST_STATUS, CHAT_SENDER } = require('../utils/constants');

async function seed() {
  try {
    console.log('Clearing database tables...');
    // Drop and recreate tables to ensure clean slate
    await sequelize.sync({ force: true });
    console.log('Database synced cleanly.');

    // 1. Create ADMIN USER
    const adminPasswordHash = await bcrypt.hash('Admin123', 10);
    const adminUser = await User.create({
      name: 'IBM Admin',
      email: 'admin@ibm.com',
      password_hash: adminPasswordHash,
      role: ROLES.ADMIN,
    });
    console.log('Admin user seeded: admin@ibm.com');

    // 2. Create EMPLOYEE 1 (Aarav Sharma - not_started)
    const aaravPasswordHash = await bcrypt.hash('Employee123', 10);
    const aaravUser = await User.create({
      name: 'Aarav Sharma',
      email: 'aarav@ibm.com',
      password_hash: aaravPasswordHash,
      role: ROLES.EMPLOYEE,
    });

    const aaravProfile = await Employee.create({
      user_id: aaravUser.id,
      department: 'Engineering',
      designation: 'Software Engineer',
      manager: 'IBM Admin',
      buddy: 'Siddharth Sen',
      onboarding_stage: ONBOARDING_STAGES.NOT_STARTED,
      offer_accepted: false,
      os_type: null,
    });

    // Checklist for Aarav (all incomplete)
    await ChecklistItem.bulkCreate([
      {
        employee_id: aaravProfile.id,
        title: 'Sign offer letter and terms',
        description: 'Read the terms of engagement and sign.',
        priority: CHECKLIST_PRIORITIES.HIGH,
        completed: false,
      },
      {
        employee_id: aaravProfile.id,
        title: 'Upload photo ID proof',
        description: 'Upload driver license or passport.',
        priority: CHECKLIST_PRIORITIES.HIGH,
        completed: false,
      }
    ]);
    console.log('Employee 1 seeded: aarav@ibm.com');

    // 3. Create EMPLOYEE 2 (Priya Patel - in_progress)
    const priyaPasswordHash = await bcrypt.hash('Employee123', 10);
    const priyaUser = await User.create({
      name: 'Priya Patel',
      email: 'priya@ibm.com',
      password_hash: priyaPasswordHash,
      role: ROLES.EMPLOYEE,
    });

    const priyaProfile = await Employee.create({
      user_id: priyaUser.id,
      department: 'Cloud',
      designation: 'Cloud Developer',
      manager: 'IBM Admin',
      buddy: 'Elena Gilbert',
      onboarding_stage: ONBOARDING_STAGES.IN_PROGRESS,
      offer_accepted: true,
      os_type: OS_TYPES.WINDOWS,
    });

    // Sample documents for Priya
    await Document.create({
      employee_id: priyaProfile.id,
      document_name: 'priya_offer_letter.pdf',
      document_type: DOCUMENT_TYPES.OFFER_LETTER,
      file_path: 'uploads/priya_offer_letter.pdf',
      verification_status: DOCUMENT_STATUS.VERIFIED
    });

    // Checklist for Priya
    await ChecklistItem.bulkCreate([
      {
        employee_id: priyaProfile.id,
        title: 'Complete W3ID setup',
        description: 'Create your IBM intranet identification ID.',
        priority: CHECKLIST_PRIORITIES.HIGH,
        completed: false,
      },
      {
        employee_id: priyaProfile.id,
        title: 'Configure Outlook',
        description: 'Set up your IBM email account inbox.',
        priority: CHECKLIST_PRIORITIES.MEDIUM,
        completed: false,
      },
      {
        employee_id: priyaProfile.id,
        title: 'Install Teams',
        description: 'Install Microsoft Teams collaboration client.',
        priority: CHECKLIST_PRIORITIES.MEDIUM,
        completed: false,
      }
    ]);
    console.log('Employee 2 seeded: priya@ibm.com');

    // 4. Create EMPLOYEE 3 (Rahul Verma - completed)
    const rahulPasswordHash = await bcrypt.hash('Employee123', 10);
    const rahulUser = await User.create({
      name: 'Rahul Verma',
      email: 'rahul@ibm.com',
      password_hash: rahulPasswordHash,
      role: ROLES.EMPLOYEE,
    });

    const rahulProfile = await Employee.create({
      user_id: rahulUser.id,
      department: 'AI Research',
      designation: 'AI Engineer',
      manager: 'IBM Admin',
      buddy: 'Samanth Roy',
      onboarding_stage: ONBOARDING_STAGES.COMPLETED,
      offer_accepted: true,
      os_type: OS_TYPES.MAC,
    });

    // Sample documents for Rahul
    await Document.create({
      employee_id: rahulProfile.id,
      document_name: 'rahul_identity_proof.pdf',
      document_type: DOCUMENT_TYPES.ID_PROOF,
      file_path: 'uploads/rahul_identity_proof.pdf',
      verification_status: DOCUMENT_STATUS.VERIFIED
    });

    // Checklist for Rahul (all completed)
    await ChecklistItem.bulkCreate([
      {
        employee_id: rahulProfile.id,
        title: 'Accept offer letter terms',
        description: 'Submit accepted signoff terms.',
        priority: CHECKLIST_PRIORITIES.HIGH,
        completed: true,
        completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        employee_id: rahulProfile.id,
        title: 'Complete security awareness course',
        description: 'Complete IBM mandatory integrity modules.',
        priority: CHECKLIST_PRIORITIES.HIGH,
        completed: true,
        completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ]);
    console.log('Employee 3 seeded: rahul@ibm.com');

    // 5. Create Sample Tasks
    await Task.bulkCreate([
      {
        employee_id: aaravProfile.id,
        title: 'Attend Pre-Joining Sync Meeting',
        description: 'Brief check-in call with HR coordinates.',
        assigned_by: adminUser.id,
        status: TASK_STATUS.PENDING,
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      },
      {
        employee_id: priyaProfile.id,
        title: 'Complete IBM Watsonx orientation session',
        description: 'Watch the introductory training webinar.',
        assigned_by: adminUser.id,
        status: TASK_STATUS.IN_PROGRESS,
        deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
      }
    ]);
    console.log('Sample tasks seeded.');

    // 6. Create Access Request
    await AccessRequest.create({
      employee_id: priyaProfile.id,
      application_name: 'GitHub Enterprise',
      reason: 'Need workspace access to cloud development repositories.',
      status: ACCESS_REQUEST_STATUS.PENDING
    });
    console.log('Sample access request seeded.');

    // 7. Create Chat Log
    await ChatLog.create({
      employee_id: priyaProfile.id,
      sender: CHAT_SENDER.EMPLOYEE,
      message: 'Where can I find details about my health insurance?'
    });
    await ChatLog.create({
      employee_id: priyaProfile.id,
      sender: CHAT_SENDER.ASSISTANT,
      message: 'IBM offers comprehensive health insurance. You can review details in the benefits handbook.'
    });
    console.log('Sample chat logs seeded.');

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Seeding database failed:', error);
  } finally {
    process.exit(0);
  }
}

seed();
