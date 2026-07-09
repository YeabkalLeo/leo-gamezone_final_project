const roleCheck = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

const isAdmin = roleCheck('admin');
const isStaff = roleCheck('admin', 'staff');
const isManager = roleCheck('admin', 'manager');

module.exports = { roleCheck, isAdmin, isStaff, isManager };
