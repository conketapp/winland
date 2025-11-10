# Changelog

All notable changes to the CTV Portal project.

## [Latest] - 2025-11-10

### Added
- ✅ **Total Deals Feature** - Track user transactions
  - Added `totalDeals` field to User model
  - Dashboard displays real totalDeals from database
  - Scripts to manage user deals
  
- ✅ **Password Validation with Special Characters**
  - Updated validation to require special characters
  - Real-time visual feedback
  - Client and server-side validation
  
- ✅ **Form Validation**
  - Signup button disabled until all requirements met
  - Password match indicator
  - Real-time validation feedback
  
- ✅ **User Data Integration**
  - Dashboard fetches real data from PostgreSQL
  - API route `/api/user/me` for user data
  - Displays fullName and totalDeals from database
  
- ✅ **Scripts Optimization**
  - Organized scripts into folders (user/, test/, utils/)
  - Created CLI interface for easy access
  - Added npm script shortcuts
  - Comprehensive documentation

### Fixed
- ✅ **Login Flow** - Fixed sessionStorage issue
  - OTP page now keeps phone in storage
  - Dashboard can fetch user data correctly
  
- ✅ **500 Error** - Resolved API errors
  - Added better error logging
  - Created diagnostic tools
  - Documentation for troubleshooting

### Changed
- 📝 **Documentation** - Complete reorganization
  - Created organized folder structure
  - Added comprehensive guides
  - Troubleshooting documentation
  - Feature documentation

## [Previous] - 2025-11-09

### Added
- ✅ **Authentication System**
  - Login with phone and password
  - OTP verification flow
  - Session management
  
- ✅ **Database Integration**
  - PostgreSQL with Prisma
  - User model with authentication
  - Database migrations
  
- ✅ **Password Validation**
  - Minimum 8 characters
  - Uppercase and lowercase letters
  - Real-time validation feedback

### Initial Features
- ✅ Next.js 15 setup
- ✅ Tailwind CSS styling
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Dashboard layout
- ✅ Navigation components

## Upcoming Features

### Planned
- 🔄 **Real Transaction Tracking**
  - Transaction model
  - Auto-increment totalDeals
  - Transaction history
  
- 🔄 **Enhanced Security**
  - Bcrypt password hashing
  - JWT token authentication
  - Refresh token mechanism
  
- 🔄 **User Profile**
  - Edit profile
  - Avatar upload
  - Change password
  
- 🔄 **Statistics Dashboard**
  - Monthly deals
  - Revenue tracking
  - Performance charts

### Under Consideration
- 📋 Real OTP integration (SMS/Email)
- 📋 Role-based access control
- 📋 Admin panel
- 📋 Notification system
- 📋 Export reports

## Version History

### v0.1.0 - Initial Release
- Basic authentication
- Dashboard layout
- Database integration

### v0.2.0 - Current
- Enhanced password validation
- User data integration
- Total deals feature
- Scripts optimization
- Complete documentation

## Breaking Changes

### v0.2.0
- **Password Requirements** - Now requires special characters
  - Old passwords without special chars will fail validation
  - Users need to update passwords
  - Test user password changed to `Test@123`

### Migration Guide
If upgrading from v0.1.0:
1. Update test user password: `npm run script:user:create`
2. Clear browser cache
3. Restart dev server
4. Login with new password: `Test@123`

## Contributors

- Winland Team

## License

© 2025 Bất Động Sản Winland. All rights reserved.
