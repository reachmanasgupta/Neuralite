const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Request ke header se token fetch karna
    const authHeader = req.header('Authorization');

    // Agar token nahi bheja gaya
    if (!authHeader) {
        return res.status(401).json({ message: 'Access Denied! No token provided.' });
    }

    try {
        // 2. Token usually "Bearer abcdef..." format me aata hai, toh hum sirf actual token nikalenge
        const token = authHeader.split(" ")[1];

        // 3. Token ko secret key se verify karna
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Verified user details (id, role) ko request me daal dena taaki aage use ho sake
        req.user = verified;
        
        // 5. Sab sahi hai toh API ko aage badhne do
        next(); 
    } catch (error) {
        res.status(401).json({ message: 'Invalid Token!' });
    }
};