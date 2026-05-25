import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { config } from 'dotenv';
config({ path: '../.env' });

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "your-very-secret-key";
const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "genealogy_connect"
};

const getDB = () => mysql.createConnection(dbConfig);

app.get('/', (req, res) => res.send('MySQL Direct API is running'));

// Register
app.post('/api/auth/register', async (req, res) => {
  const { fullName, email: emailInput, password, mobile, userType, referralCodeInput, boutiqueName, city, area, boutiqueDescription } = req.body;
  try {
    const db = await getDB();
    
    // Check if mobile already exists
    const [existingMobile] = await db.execute('SELECT id FROM users WHERE mobile = ?', [mobile]);
    if (existingMobile.length > 0) return res.status(400).json({ error: 'Mobile number already registered' });

    // Use provided email or generate one from mobile
    const email = emailInput || `${mobile.replace(/\D/g, '')}@boutify.app`;
    
    const [existingEmail] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingEmail.length > 0 && emailInput) return res.status(400).json({ error: 'Email already exists' });

    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    // Generate an 8-character referral code
    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const status = userType === 'admin' ? 'active' : 'pending';

    let referredBy = null;
    if (referralCodeInput) {
      const [referrer] = await db.execute('SELECT id FROM users WHERE referral_code = ?', [referralCodeInput.toUpperCase()]);
      if (referrer.length > 0) {
        referredBy = referrer[0].id;
      } else {
        return res.status(400).json({ error: 'Invalid referral code' });
      }
    }

    await db.execute(
      'INSERT INTO users (id, full_name, email, password_hash, mobile, user_type, status, referral_code, referred_by, boutique_name, city, area, boutique_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, fullName, email, passwordHash, mobile, userType, status, referralCode, referredBy, boutiqueName || null, city || null, area || null, boutiqueDescription || null]
    );
    await db.end();
    res.json({ message: 'Registered successfully', referralCode });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { mobile, password } = req.body;
  try {
    const db = await getDB();
    // Try login by mobile first, then by email if mobile is not found
    let [rows] = await db.execute('SELECT * FROM users WHERE mobile = ?', [mobile]);
    
    if (rows.length === 0) {
      // Fallback to email just in case
      [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [mobile]);
    }
    
    await db.end();
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '24h' });
    
    // Don't send password hash
    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Me
app.get('/api/auth/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = await getDB();
    const [rows] = await db.execute('SELECT id, full_name, email, mobile, user_type, status, referral_code, boutique_name, wallet_balance, city, area, boutique_description, created_at FROM users WHERE id = ?', [decoded.sub]);
    await db.end();
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.patch('/api/auth/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.sub;
    const body = req.body;
    const db = await getDB();
    const allowedFields = ['full_name', 'boutique_name', 'mobile', 'city', 'area', 'boutique_description'];
    const updates = Object.keys(body).filter(key => allowedFields.includes(key)).map(key => `${key} = ?`).join(', ');
    if (!updates) return res.status(400).json({ error: 'No fields' });
    const values = Object.keys(body).filter(key => allowedFields.includes(key)).map(key => body[key]);
    values.push(userId);
    await db.execute(`UPDATE users SET ${updates} WHERE id = ?`, values);
    await db.end();
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Customer Network (3 levels) ---
app.get('/api/network', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.sub;

    const db = await getDB();
    const [users] = await db.execute('SELECT id, full_name, mobile, referred_by FROM users WHERE user_type = "customer"');
    await db.end();

    const map = new Map();
    users.forEach((u) => {
      if (u.referred_by) {
        if (!map.has(u.referred_by)) map.set(u.referred_by, []);
        map.get(u.referred_by).push({
          id: u.id,
          name: u.full_name,
          mobile: u.mobile
        });
      }
    });

    const network = [];
    const queue = [{ id: userId, level: 1 }];
    const visited = new Set();

    while (queue.length > 0) {
      const curr = queue.shift();
      if (curr.level > 3) continue;

      const children = map.get(curr.id) || [];
      for (const child of children) {
        if (!visited.has(child.id)) {
          visited.add(child.id);
          network.push({ ...child, level: curr.level });
          if (curr.level < 3) {
            queue.push({ id: child.id, level: curr.level + 1 });
          }
        }
      }
    }

    res.json({ network });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Admin Credit Distribution ---
app.post('/api/admin/credit', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const adminId = decoded.sub;

    const db = await getDB();
    
    // Verify admin
    console.log("Verifying admin for ID:", adminId);
    const [admins] = await db.execute('SELECT user_type FROM users WHERE id = ?', [adminId]);
    console.log("Admin query result:", admins);
    if (!admins.length || admins[0].user_type !== 'admin') {
      const foundType = admins.length ? admins[0].user_type : 'NOT_FOUND';
      console.log(`Admin check failed. Returning 403. Found type: ${foundType}`);
      return res.status(403).json({ error: `Forbidden: User ${adminId} is not an admin (Type: ${foundType})` });
    }

    const { customerId, amount } = req.body;
    const creditAmount = parseFloat(amount);
    
    if (isNaN(creditAmount) || creditAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Find up to 3 ancestors
    let currentId = customerId;
    let parents = [];
    for (let i = 0; i < 3; i++) {
      const [rows] = await db.execute('SELECT referred_by FROM users WHERE id = ?', [currentId]);
      if (rows.length && rows[0].referred_by) {
        parents.push(rows[0].referred_by);
        currentId = rows[0].referred_by;
      } else {
        break;
      }
    }

    let distributions = [];
    if (parents.length === 3) {
       distributions.push({ id: parents[0], amount: parseFloat((creditAmount * 0.6).toFixed(2)), level: 1 });
       distributions.push({ id: parents[1], amount: parseFloat((creditAmount * 0.2).toFixed(2)), level: 2 });
       distributions.push({ id: parents[2], amount: parseFloat((creditAmount * 0.2).toFixed(2)), level: 3 });
    } else if (parents.length === 2) {
       distributions.push({ id: parents[0], amount: parseFloat((creditAmount * 0.8).toFixed(2)), level: 1 });
       distributions.push({ id: parents[1], amount: parseFloat((creditAmount * 0.2).toFixed(2)), level: 2 });
    } else if (parents.length === 1) {
       distributions.push({ id: parents[0], amount: parseFloat(creditAmount.toFixed(2)), level: 1 });
    }

    for (const dist of distributions) {
      if (dist.amount > 0) {
        await db.execute('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?', [dist.amount, dist.id]);
        await db.execute('INSERT INTO transactions (user_id, amount, transaction_type, description) VALUES (?, ?, ?, ?)', [dist.id, dist.amount, 'credit', `Network credit from Level ${dist.level} descendant`]);
      }
    }

    // Track admin credit action
    await db.execute('INSERT INTO transactions (user_id, amount, transaction_type, description) VALUES (?, ?, ?, ?)', [customerId, creditAmount, 'credit', `Admin initiated automatic network distribution of ₹${creditAmount}`]);

    await db.end();
    res.json({ message: 'Credit distributed successfully', distributions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/transactions', async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.execute(`
      SELECT t.*, u.full_name, u.mobile 
      FROM transactions t 
      JOIN users u ON t.user_id = u.id 
      ORDER BY t.created_at DESC
    `);
    await db.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Boutiques ---
app.get('/api/boutiques', async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.execute(`
      SELECT id, full_name, mobile, boutique_name, city, area, boutique_description 
      FROM users WHERE user_type = "boutique_owner" AND status = "active"
    `);
    await db.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/boutique/services', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const boutiqueId = decoded.sub;

    const { serviceName, charge } = req.body;
    const db = await getDB();

    await db.execute(
      'INSERT INTO boutique_services (boutique_id, service_name, charge) VALUES (?, ?, ?)',
      [boutiqueId, serviceName, charge]
    );
    await db.end();

    res.json({ message: 'Service added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/boutique/services/:boutiqueId', async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.execute('SELECT * FROM boutique_services WHERE boutique_id = ?', [req.params.boutiqueId]);
    await db.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin
app.get('/api/users', async (req, res) => {
    try {
        const db = await getDB();
        const [rows] = await db.execute('SELECT id, full_name, email, mobile, user_type, status, referral_code, referred_by, wallet_balance, created_at FROM users ORDER BY created_at DESC');
        await db.end();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/users/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        const db = await getDB();
        await db.execute('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id]);
        await db.end();
        res.json({ message: 'Updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const db = await getDB();
        await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        await db.end();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Stats (Simple version for direct API)
app.get('/api/dashboard/stats', async (req, res) => {
    const { userId, role } = req.query;
    try {
        const db = await getDB();
        const [allUsers] = await db.execute('SELECT * FROM users');
        
        let directCount = 0;
        let networkCount = 0;
        let sponsorName = null;

        if (userId) {
            // Count direct referrals
            const [directs] = await db.execute('SELECT id FROM users WHERE referred_by = ?', [userId]);
            directCount = directs.length;

            // Recursive network count
            const getDownlineCount = async (ids) => {
                if (ids.length === 0) return 0;
                const [downline] = await db.execute(`SELECT id FROM users WHERE referred_by IN (${ids.map(() => '?').join(',')})`, ids);
                if (downline.length === 0) return 0;
                const childIds = downline.map(d => d.id);
                return downline.length + await getDownlineCount(childIds);
            };

            if (directCount > 0) {
                const directIds = directs.map(d => d.id);
                networkCount = directCount + await getDownlineCount(directIds);
            }

            // Get sponsor name and boutique name
            const [userRows] = await db.execute('SELECT referred_by FROM users WHERE id = ?', [userId]);
            if (userRows.length > 0 && userRows[0].referred_by) {
                const [sponsorRows] = await db.execute('SELECT full_name, boutique_name FROM users WHERE id = ?', [userRows[0].referred_by]);
                if (sponsorRows.length > 0) {
                    sponsorName = sponsorRows[0].boutique_name ? `${sponsorRows[0].full_name} (${sponsorRows[0].boutique_name})` : sponsorRows[0].full_name;
                }
            }
        }

        await db.end();
        res.json({
            usersCount: allUsers.length,
            customersCount: allUsers.filter(u => u.user_type === 'customer').length,
            ownersCount: allUsers.filter(u => u.user_type === 'boutique_owner').length,
            referralsCount: allUsers.filter(u => u.referred_by).length,
            pendingCount: allUsers.filter(u => u.status === 'pending').length,
            activeCount: allUsers.filter(u => u.status === 'active').length,
            directCount,
            networkCount,
            sponsorName,
            allUsers: allUsers.map(u => {
                const { password_hash, ...safe } = u;
                return safe;
            })
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log('MySQL Direct API listening on port 3000'));