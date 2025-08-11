# 🗄️ Database Setup Guide for RecruitFlow Workspace

## Quick Setup Instructions

### 1. **Open Supabase Dashboard**
   - Go to your Supabase project: https://supabase.com/dashboard
   - Navigate to **SQL Editor**

### 2. **Run Database Schema**
   - Copy the contents of `database-firm-workspace-schema.sql`
   - Paste into Supabase SQL Editor
   - Click **Run** to create all tables and data

### 3. **Verify Tables Created**
   Check that these tables were created in your **Table Editor**:
   - ✅ `firms` - Company accounts
   - ✅ `firm_users` - Employee sub-accounts  
   - ✅ `workspace_channels` - Chat channels
   - ✅ `workspace_messages` - Chat messages
   - ✅ `workspace_tasks` - Task management
   - ✅ `firm_invitations` - User invitations

### 4. **Test Sample Data**
   The script creates sample firms:
   - **Acme Recruitment** (admin@acmerecruitment.com)
   - **TalentFirst Agency** (admin@talentfirst.com)
   - **Elite Staffing Solutions** (admin@elitestaffing.com)

## 🚀 Backend Connection

### Environment Variables
Make sure your `.env` file has:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret-key
FRONTEND_URL=http://localhost:5173
```

### Test Backend Connection
```bash
curl http://localhost:3001/api/health
```

## 🔐 Demo Accounts

After running the schema, you can test with:

### Sample Firm Login
- **Email**: `admin@acmerecruitment.com`
- **Password**: `admin123` (you'll need to update this)

### Create New Firm
Use the registration form in the app to create your own firm workspace.

## 📊 Features Available

### ✅ **Completed Features:**
- Firm registration and login system
- Discord-like workspace interface  
- Real-time chat with Socket.io
- User presence and status
- Channel-based organization
- Role-based permissions (Admin, Manager, Recruiter)
- Task assignment system
- Activity feed

### 🔜 **Next Steps:**
- Set up the database tables
- Test firm registration
- Test workspace collaboration
- Invite team members

## 🛠️ Troubleshooting

### Backend Won't Start
1. Check if port 3001 is available
2. Verify all environment variables are set
3. Ensure Supabase credentials are correct

### Database Connection Issues  
1. Verify Supabase URL and keys
2. Check Row Level Security (RLS) policies
3. Ensure tables exist in Supabase dashboard

### Frontend Connection Issues
1. Ensure backend is running on port 3001
2. Check browser console for errors
3. Verify API endpoints are accessible

---

**Ready to launch your recruitment team workspace! 🚀**