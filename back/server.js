
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

// Configure PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432
});

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'isettozeursecretkey';

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  });
};

// Check admin role middleware
const checkAdminRole = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Accès refusé. Droits d\'administrateur requis.' 
    });
  }
  next();
};

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  
  try {
    // Fixed admin credentials
    if (role === 'admin' && email === 'admin@iset.tn' && password === 'admin123') {
      const adminUser = {
        id: "admin-1",
        username: "admin",
        role: "admin",
        firstName: "Admin",
        lastName: "User",
        email: "admin@iset.tn",
        department: "Administration"
      };
      
      // Generate JWT token
      const token = jwt.sign(
        { id: adminUser.id, role: adminUser.role }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );
      
      return res.json({ 
        success: true, 
        user: { ...adminUser, token } 
      });
    }
    
    // For student role, check database
    if (role === 'student') {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND role = $2',
        [email, 'student']
      );
      
      const user = result.rows[0];
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Email ou rôle incorrect' 
        });
      }
      
      // Check password
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      
      if (!isPasswordCorrect) {
        return res.status(401).json({ 
          success: false, 
          message: 'Mot de passe incorrect' 
        });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, role: user.role }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );
      
      // Don't send password to client
      delete user.password;
      
      return res.json({ 
        success: true, 
        user: { ...user, token } 
      });
    }
    
    // If we reach here, login failed
    return res.status(401).json({ 
      success: false, 
      message: 'Échec de connexion. Vérifiez vos identifiants et le rôle sélectionné.' 
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur du serveur' 
    });
  }
});

// Create a new student (admin only)
app.post('/api/students', authenticateToken, checkAdminRole, async (req, res) => {
  const { username, password, firstName, lastName, email, studentId, department } = req.body;
  
  try {
    // Check if email already exists
    const emailCheck = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet email existe déjà' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new student
    const result = await pool.query(
      `INSERT INTO users (username, password, role, first_name, last_name, email, student_id, department, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) 
       RETURNING id, username, role, first_name, last_name, email, student_id, department, created_at`,
      [username, hashedPassword, 'student', firstName, lastName, email, studentId, department]
    );
    
    const newStudent = result.rows[0];
    
    res.status(201).json({ 
      success: true, 
      message: 'Étudiant ajouté avec succès', 
      student: newStudent 
    });
    
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur du serveur' 
    });
  }
});

// Get all students (admin only)
app.get('/api/students', authenticateToken, checkAdminRole, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, role, first_name, last_name, email, student_id, department, created_at FROM users WHERE role = $1 ORDER BY created_at DESC',
      ['student']
    );
    
    res.json({ 
      success: true, 
      students: result.rows 
    });
    
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur du serveur' 
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
