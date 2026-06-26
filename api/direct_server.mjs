import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { config } from "dotenv";
config({ path: "../.env" });

const app = express();
app.use(cors());
app.use(express.json());

// Configure Multer for File Uploads
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Serve Static Uploads
app.use("/uploads", express.static(uploadDir));

// Upload Endpoint
app.post("/api/upload", (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      console.error("Multer/Upload Error:", err);
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Multer error: ${err.message}` });
      }
      return res.status(500).json({ error: `Upload error: ${err.message}` });
    }

    if (!req.file) {
      console.error("Upload Error: No file in request");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("File uploaded successfully:", req.file.filename);
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

const JWT_SECRET = process.env.JWT_SECRET || "your-very-secret-key";
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "genealogy_connect",
};

const getDB = () => mysql.createConnection(dbConfig);

app.get("/", (req, res) => res.send("MySQL Direct API is running"));

// Register
app.post("/api/auth/register", async (req, res) => {
  const {
    fullName,
    email: emailInput,
    userid,
    password,
    mobile,
    userType,
    referralCodeInput,
    boutiqueName,
    city,
    area,
    boutiqueDescription,
    // Enhanced Fields
    alternateMobile,
    website,
    gstNumber,
    registrationNumber,
    yearEstablished,
    state,
    district,
    fullAddress,
    landmark,
    pincode,
    googleMapsLink,
    workingDays,
    openingTime,
    closingTime,
    weeklyHoliday,
    blouseStartingPrice,
    sareeFallPicoCharges,
    bridalPackageCost,
    designerDressCost,
    alterationCharges,
    homeVisitCharges,
    instagramUrl,
    facebookUrl,
    youtubeChannel,
    whatsappNumber,
    telegramLink,
    categories,
    services, // Arrays of IDs
  } = req.body;

  try {
    const db = await getDB();

    // Check if mobile or userid already exists
    const [existing] = await db.execute("SELECT id FROM users WHERE mobile = ? OR userid = ?", [
      mobile,
      userid || "",
    ]);
    if (existing.length > 0) {
      await db.end();
      return res.status(400).json({ error: "Mobile or User ID already registered" });
    }

    // Use provided email or generate one from mobile
    const email = emailInput || `${mobile.replace(/\D/g, "")}@boutify.app`;

    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    // Generate an 8-character referral code
    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const status = userType === "admin" ? "active" : "pending";

    let referredBy = null;
    if (userType === "customer" && referralCodeInput) {
      const [referrer] = await db.execute("SELECT id FROM users WHERE referral_code = ?", [
        referralCodeInput.toUpperCase(),
      ]);
      if (referrer.length > 0) {
        referredBy = referrer[0].id;
      } else {
        await db.end();
        return res.status(400).json({ error: "Invalid referral code" });
      }
    }

    // Start Transaction
    await db.beginTransaction();

    await db.execute(
      "INSERT INTO users (id, full_name, email, userid, password_hash, mobile, user_type, status, referral_code, referred_by, boutique_name, city, area, boutique_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        fullName,
        email,
        userid || null,
        passwordHash,
        mobile,
        userType,
        status,
        referralCode,
        referredBy,
        boutiqueName || null,
        city || null,
        area || null,
        boutiqueDescription || null,
      ],
    );

    if (userType === "boutique_owner") {
      // Insert Boutique Details
      await db.execute(
        `INSERT INTO boutique_details (
          boutique_id, alternate_mobile, website, gst_number, registration_number, year_established,
          state, district, full_address, landmark, pincode, google_maps_link,
          working_days, opening_time, closing_time, weekly_holiday,
          blouse_starting_price, saree_fall_pico_charges, bridal_package_cost, designer_dress_cost, alteration_charges, home_visit_charges,
          instagram_url, facebook_url, youtube_channel, whatsapp_number, telegram_link
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          alternateMobile || null,
          website || null,
          gstNumber || null,
          registrationNumber || null,
          yearEstablished || null,
          state || null,
          district || null,
          fullAddress || null,
          landmark || null,
          pincode || null,
          googleMapsLink || null,
          workingDays || null,
          openingTime || null,
          closingTime || null,
          weeklyHoliday || null,
          blouseStartingPrice || null,
          sareeFallPicoCharges || null,
          bridalPackageCost || null,
          designerDressCost || null,
          alterationCharges || null,
          homeVisitCharges || null,
          instagramUrl || null,
          facebookUrl || null,
          youtubeChannel || null,
          whatsappNumber || null,
          telegramLink || null,
        ],
      );

      // Categories
      if (categories && Array.isArray(categories)) {
        for (const catId of categories) {
          await db.execute(
            "INSERT INTO boutique_categories (boutique_id, category_id) VALUES (?, ?)",
            [id, catId],
          );
        }
      }

      // Services
      if (services && Array.isArray(services)) {
        for (const svcId of services) {
          await db.execute(
            "INSERT INTO boutique_offered_services (boutique_id, service_id) VALUES (?, ?)",
            [id, svcId],
          );
        }
      }
    }

    await db.commit();
    await db.end();
    res.json({ message: "Registered successfully", referralCode, id });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get Complete Boutique Details
app.get("/api/boutique/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDB();
    const [userRows] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
    if (userRows.length === 0) {
      await db.end();
      return res.status(404).json({ error: "User not found" });
    }

    const user = userRows[0];
    const [detailRows] = await db.execute("SELECT * FROM boutique_details WHERE boutique_id = ?", [
      id,
    ]);
    const details = detailRows.length > 0 ? detailRows[0] : {};

    const [catRows] = await db.execute(
      "SELECT category_id FROM boutique_categories WHERE boutique_id = ?",
      [id],
    );
    const categories = catRows.map((r) => r.category_id);

    const [svcRows] = await db.execute(
      "SELECT service_id FROM boutique_offered_services WHERE boutique_id = ?",
      [id],
    );
    const services = svcRows.map((r) => r.service_id);

    await db.end();
    res.json({
      ...user,
      ...details,
      categories,
      services,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Boutique Details
app.put("/api/boutique/:id", async (req, res) => {
  const { id } = req.params;
  const body = req.body;

  // Helper to convert undefined or empty strings to null for MySQL
  const val = (v) => (v === undefined || v === "" ? null : v);

  try {
    const db = await getDB();
    await db.beginTransaction();

    // Update basic user info
    await db.execute(
      `UPDATE users SET full_name = ?, boutique_name = ?, city = ?, area = ?, boutique_description = ? WHERE id = ?`,
      [
        val(body.fullName),
        val(body.boutiqueName),
        val(body.city),
        val(body.area),
        val(body.boutiqueDescription),
        id,
      ],
    );

    if (body.password) {
      const hash = await bcrypt.hash(body.password, 10);
      await db.execute("UPDATE users SET password_hash = ? WHERE id = ?", [hash, id]);
    }

    // Update extended details (Upsert)
    await db.execute(
      `INSERT INTO boutique_details (
          boutique_id, alternate_mobile, website, gst_number, registration_number, year_established,
          state, district, full_address, landmark, pincode, google_maps_link,
          working_days, opening_time, closing_time, weekly_holiday,
          blouse_starting_price, saree_fall_pico_charges, bridal_package_cost, designer_dress_cost, alteration_charges, home_visit_charges,
          instagram_url, facebook_url, youtube_channel, whatsapp_number, telegram_link
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
          alternate_mobile = VALUES(alternate_mobile), website = VALUES(website), gst_number = VALUES(gst_number), 
          registration_number = VALUES(registration_number), year_established = VALUES(year_established), 
          state = VALUES(state), district = VALUES(district), full_address = VALUES(full_address), 
          landmark = VALUES(landmark), pincode = VALUES(pincode), google_maps_link = VALUES(google_maps_link), 
          working_days = VALUES(working_days), 
          opening_time = VALUES(opening_time), closing_time = VALUES(closing_time), weekly_holiday = VALUES(weekly_holiday), 
          blouse_starting_price = VALUES(blouse_starting_price), saree_fall_pico_charges = VALUES(saree_fall_pico_charges), 
          bridal_package_cost = VALUES(bridal_package_cost), designer_dress_cost = VALUES(designer_dress_cost), 
          alteration_charges = VALUES(alteration_charges), home_visit_charges = VALUES(home_visit_charges), 
          instagram_url = VALUES(instagram_url), facebook_url = VALUES(facebook_url), 
          youtube_channel = VALUES(youtube_channel), whatsapp_number = VALUES(whatsapp_number), telegram_link = VALUES(telegram_link)`,
      [
        id,
        val(body.alternateMobile),
        val(body.website),
        val(body.gstNumber),
        val(body.registrationNumber),
        val(body.yearEstablished),
        val(body.state),
        val(body.district),
        val(body.fullAddress),
        val(body.landmark),
        val(body.pincode),
        val(body.googleMapsLink),
        val(body.workingDays),
        val(body.openingTime),
        val(body.closingTime),
        val(body.weeklyHoliday),
        val(body.blouseStartingPrice),
        val(body.sareeFallPicoCharges),
        val(body.bridalPackageCost),
        val(body.designerDressCost),
        val(body.alterationCharges),
        val(body.homeVisitCharges),
        val(body.instagramUrl),
        val(body.facebookUrl),
        val(body.youtubeChannel),
        val(body.whatsappNumber),
        val(body.telegramLink),
      ],
    );

    // Categories
    await db.execute("DELETE FROM boutique_categories WHERE boutique_id = ?", [id]);
    if (body.categories && Array.isArray(body.categories)) {
      for (const catId of body.categories) {
        await db.execute(
          "INSERT INTO boutique_categories (boutique_id, category_id) VALUES (?, ?)",
          [id, catId],
        );
      }
    }

    // Services
    await db.execute("DELETE FROM boutique_offered_services WHERE boutique_id = ?", [id]);
    if (body.services && Array.isArray(body.services)) {
      for (const svcId of body.services) {
        await db.execute(
          "INSERT INTO boutique_offered_services (boutique_id, service_id) VALUES (?, ?)",
          [id, svcId],
        );
      }
    }

    await db.commit();
    await db.end();
    res.json({ message: "Boutique details updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Metadata
app.get("/api/metadata/categories", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.execute("SELECT * FROM categories ORDER BY name");
    await db.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/metadata/services", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.execute("SELECT * FROM services ORDER BY name");
    await db.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/metadata/cities", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.execute(
      'SELECT DISTINCT city FROM users WHERE user_type = "boutique_owner" AND status = "active" AND city IS NOT NULL AND city != "" ORDER BY city',
    );
    await db.end();
    res.json(rows.map((r) => r.city));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { mobile, password } = req.body;
  try {
    const db = await getDB();
    // Try login by mobile or userid
    let [rows] = await db.execute("SELECT * FROM users WHERE mobile = ? OR userid = ?", [
      mobile,
      mobile,
    ]);

    await db.end();
    if (rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "24h" });

    // Don't send password hash
    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Me
app.get("/api/auth/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = await getDB();
    const [rows] = await db.execute(
      "SELECT id, full_name, email, userid, mobile, user_type, status, referral_code, boutique_name, wallet_balance, city, area, boutique_description, created_at FROM users WHERE id = ?",
      [decoded.sub],
    );
    await db.end();
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.patch("/api/auth/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.sub;
    const body = req.body;
    const db = await getDB();

    // Check if userid or mobile is already taken by another user
    if (body.userid || body.mobile) {
      const checks = [];
      const params = [];
      if (body.userid) {
        checks.push("userid = ?");
        params.push(body.userid);
      }
      if (body.mobile) {
        checks.push("mobile = ?");
        params.push(body.mobile);
      }

      const [existing] = await db.execute(
        `SELECT id FROM users WHERE (${checks.join(" OR ")}) AND id != ?`,
        [...params, userId],
      );

      if (existing.length > 0) {
        await db.end();
        return res.status(400).json({ error: "User ID or Mobile number already in use" });
      }
    }

    const allowedFields = [
      "full_name",
      "boutique_name",
      "mobile",
      "city",
      "area",
      "boutique_description",
      "userid",
    ];
    const updates = Object.keys(body)
      .filter((key) => allowedFields.includes(key))
      .map((key) => `${key} = ?`)
      .join(", ");
    if (!updates) return res.status(400).json({ error: "No fields" });
    const values = Object.keys(body)
      .filter((key) => allowedFields.includes(key))
      .map((key) => body[key]);
    values.push(userId);
    await db.execute(`UPDATE users SET ${updates} WHERE id = ?`, values);
    await db.end();
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Customer Network (3 levels) ---
app.get("/api/network", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.sub;

    const db = await getDB();
    const [users] = await db.execute(
      'SELECT id, full_name, mobile, referred_by FROM users WHERE user_type = "customer"',
    );
    await db.end();

    const map = new Map();
    users.forEach((u) => {
      if (u.referred_by) {
        if (!map.has(u.referred_by)) map.set(u.referred_by, []);
        map.get(u.referred_by).push({
          id: u.id,
          name: u.full_name,
          mobile: u.mobile,
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
app.post("/api/admin/credit", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const adminId = decoded.sub;

    const db = await getDB();

    // Verify admin
    console.log("Verifying admin for ID:", adminId);
    const [admins] = await db.execute("SELECT user_type FROM users WHERE id = ?", [adminId]);
    console.log("Admin query result:", admins);
    if (!admins.length || admins[0].user_type !== "admin") {
      const foundType = admins.length ? admins[0].user_type : "NOT_FOUND";
      console.log(`Admin check failed. Returning 403. Found type: ${foundType}`);
      return res
        .status(403)
        .json({ error: `Forbidden: User ${adminId} is not an admin (Type: ${foundType})` });
    }

    const { customerId, amount, boutiqueOwnerId } = req.body;
    const creditAmount = parseFloat(amount);

    if (isNaN(creditAmount) || creditAmount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // 1. Accumulate contribution in Boutique Owner's wallet if provided
    if (boutiqueOwnerId) {
      await db.execute(
        "UPDATE users SET wallet_balance = COALESCE(wallet_balance, 0) + ? WHERE id = ?",
        [creditAmount, boutiqueOwnerId],
      );
      await db.execute(
        "INSERT INTO transactions (user_id, amount, transaction_type, description) VALUES (?, ?, ?, ?)",
        [
          boutiqueOwnerId,
          creditAmount,
          "credit",
          `Boutique Owner contribution to customer ${customerId}'s network`,
        ],
      );
    }

    // Find ancestors and their types
    let currentId = customerId;
    let customerParents = [];
    let firstAdminId = null;

    for (let i = 0; i < 10; i++) {
      const [rows] = await db.execute(
        "SELECT u.referred_by, p.user_type FROM users u LEFT JOIN users p ON u.referred_by = p.id WHERE u.id = ?",
        [currentId],
      );

      if (rows.length && rows[0].referred_by) {
        const parentId = rows[0].referred_by;
        const parentType = rows[0].user_type;

        if (parentType === "customer") {
          customerParents.push(parentId);
          if (customerParents.length === 3) break;
        } else if (parentType === "admin") {
          if (!firstAdminId) firstAdminId = parentId;
          break;
        }
        currentId = parentId;
      } else {
        break;
      }
    }

    let distributions = [];
    if (customerParents.length > 0) {
      if (customerParents.length === 3) {
        distributions.push({
          id: customerParents[0],
          amount: parseFloat((creditAmount * 0.6).toFixed(2)),
          level: 1,
        });
        distributions.push({
          id: customerParents[1],
          amount: parseFloat((creditAmount * 0.2).toFixed(2)),
          level: 2,
        });
        distributions.push({
          id: customerParents[2],
          amount: parseFloat((creditAmount * 0.2).toFixed(2)),
          level: 3,
        });
      } else if (customerParents.length === 2) {
        distributions.push({
          id: customerParents[0],
          amount: parseFloat((creditAmount * 0.8).toFixed(2)),
          level: 1,
        });
        distributions.push({
          id: customerParents[1],
          amount: parseFloat((creditAmount * 0.2).toFixed(2)),
          level: 2,
        });
      } else if (customerParents.length === 1) {
        distributions.push({
          id: customerParents[0],
          amount: parseFloat(creditAmount.toFixed(2)),
          level: 1,
        });
      }
    } else if (firstAdminId) {
      distributions.push({
        id: firstAdminId,
        amount: parseFloat(creditAmount.toFixed(2)),
        level: 1,
      });
    }

    for (const dist of distributions) {
      if (dist.amount > 0) {
        await db.execute(
          "UPDATE users SET wallet_balance = COALESCE(wallet_balance, 0) + ? WHERE id = ?",
          [dist.amount, dist.id],
        );
        await db.execute(
          "INSERT INTO transactions (user_id, amount, transaction_type, description) VALUES (?, ?, ?, ?)",
          [dist.id, dist.amount, "credit", `Network credit from Level ${dist.level} descendant`],
        );
      }
    }

    // Track admin credit action
    await db.execute(
      "INSERT INTO transactions (user_id, amount, transaction_type, description) VALUES (?, ?, ?, ?)",
      [
        customerId,
        creditAmount,
        "credit",
        `Admin initiated automatic network distribution of ₹${creditAmount}`,
      ],
    );

    await db.end();
    res.json({ message: "Credit distributed successfully", distributions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/transactions", async (req, res) => {
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
app.get("/api/boutique/:id/images", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.execute(
      "SELECT * FROM boutique_images WHERE boutique_id = ? ORDER BY created_at DESC",
      [req.params.id],
    );
    await db.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/boutique/:id/images", async (req, res) => {
  const { imageType, imageUrl } = req.body;
  try {
    const db = await getDB();
    await db.execute(
      "INSERT INTO boutique_images (boutique_id, image_type, image_url) VALUES (?, ?, ?)",
      [req.params.id, imageType || null, imageUrl || null],
    );
    await db.end();
    res.json({ message: "Image added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/boutique/images/:imageId", async (req, res) => {
  try {
    const db = await getDB();
    await db.execute("DELETE FROM boutique_images WHERE id = ?", [req.params.imageId]);
    await db.end();
    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/boutique/:id/products", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.execute(
      "SELECT * FROM boutique_products WHERE boutique_id = ? ORDER BY created_at DESC",
      [req.params.id],
    );
    await db.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/boutique/:id/products", async (req, res) => {
  const { productName, category, priceRange, description, material, availableSizes, images } =
    req.body;
  try {
    const db = await getDB();
    await db.execute(
      "INSERT INTO boutique_products (boutique_id, product_name, category, price_range, description, material, available_sizes, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        req.params.id,
        productName || null,
        category || null,
        priceRange || null,
        description || null,
        material || null,
        availableSizes || null,
        images ? JSON.stringify(images) : null,
      ],
    );
    await db.end();
    res.json({ message: "Product added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/boutique/products/:productId", async (req, res) => {
  try {
    const db = await getDB();
    await db.execute("DELETE FROM boutique_products WHERE id = ?", [req.params.productId]);
    await db.end();
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/boutiques", async (req, res) => {
  try {
    const db = await getDB();
    const [boutiques] = await db.execute(`
      SELECT id, full_name, mobile, boutique_name, city, area, boutique_description, created_at 
      FROM users WHERE user_type = "boutique_owner" AND status = "active"
      ORDER BY created_at DESC
    `);

    // Fetch categories for these boutiques
    const [catRows] = await db.execute(`
      SELECT bc.boutique_id, c.name as category_name
      FROM boutique_categories bc
      JOIN categories c ON bc.category_id = c.id
    `);

    // Fetch services for these boutiques
    const [svcRows] = await db.execute(`
      SELECT bos.boutique_id, s.name as service_name
      FROM boutique_offered_services bos
      JOIN services s ON bos.service_id = s.id
    `);

    await db.end();

    const catMap = {};
    catRows.forEach((r) => {
      if (!catMap[r.boutique_id]) catMap[r.boutique_id] = [];
      catMap[r.boutique_id].push(r.category_name);
    });

    const svcMap = {};
    svcRows.forEach((r) => {
      if (!svcMap[r.boutique_id]) svcMap[r.boutique_id] = [];
      svcMap[r.boutique_id].push(r.service_name);
    });

    const enriched = boutiques.map((b) => ({
      ...b,
      categories: catMap[b.id] || [],
      services: svcMap[b.id] || [],
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/leaderboard", async (req, res) => {
  try {
    const db = await getDB();
    const [boutiques] = await db.execute(`
      SELECT u.id, u.full_name, u.boutique_name, u.city, u.wallet_balance,
             (SELECT image_url FROM boutique_images WHERE boutique_id = u.id LIMIT 1) as image_url
      FROM users u
      WHERE u.user_type = 'boutique_owner' AND u.status = 'active'
      ORDER BY u.wallet_balance DESC
      LIMIT 10
    `);
    await db.end();

    const stockImages = [
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80",
      "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&q=80",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80",
    ];

    const formatted = boutiques.map((b, index) => {
      let tier = "Bronze";
      if (index === 0 || index === 1) tier = "Gold";
      else if (index === 2 || index === 3) tier = "Silver";

      return {
        rank: index + 1,
        id: b.id,
        name: b.boutique_name || b.full_name || "Boutique Partner",
        city: b.city || "India",
        amount: parseFloat(b.wallet_balance || 0),
        tier: tier,
        img: b.image_url || stockImages[index % stockImages.length],
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/boutique/services", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const boutiqueId = decoded.sub;

    const { serviceName, charge } = req.body;
    const db = await getDB();

    await db.execute(
      "INSERT INTO boutique_services (boutique_id, service_name, charge) VALUES (?, ?, ?)",
      [boutiqueId, serviceName, charge],
    );
    await db.end();

    res.json({ message: "Service added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/boutique/services/:boutiqueId", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.execute("SELECT * FROM boutique_services WHERE boutique_id = ?", [
      req.params.boutiqueId,
    ]);
    await db.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin
app.get("/api/users", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.execute(
      "SELECT id, full_name, email, userid, mobile, user_type, status, referral_code, referred_by, wallet_balance, created_at FROM users ORDER BY created_at DESC",
    );
    await db.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/users/:id/status", async (req, res) => {
  const { status } = req.body;
  try {
    const db = await getDB();
    await db.execute("UPDATE users SET status = ? WHERE id = ?", [status, req.params.id]);
    await db.end();
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const db = await getDB();
    await db.execute("DELETE FROM users WHERE id = ?", [req.params.id]);
    await db.end();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stats (Simple version for direct API)
app.get("/api/dashboard/stats", async (req, res) => {
  const { userId, role } = req.query;
  try {
    const db = await getDB();
    const [allUsers] = await db.execute("SELECT * FROM users");

    let directCount = 0;
    let networkCount = 0;
    let sponsorName = null;

    if (userId) {
      // Count direct referrals
      const [directs] = await db.execute("SELECT id FROM users WHERE referred_by = ?", [userId]);
      directCount = directs.length;

      // Recursive network count
      const getDownlineCount = async (ids) => {
        if (ids.length === 0) return 0;
        const [downline] = await db.execute(
          `SELECT id FROM users WHERE referred_by IN (${ids.map(() => "?").join(",")})`,
          ids,
        );
        if (downline.length === 0) return 0;
        const childIds = downline.map((d) => d.id);
        return downline.length + (await getDownlineCount(childIds));
      };

      if (directCount > 0) {
        const directIds = directs.map((d) => d.id);
        networkCount = directCount + (await getDownlineCount(directIds));
      }

      // Get sponsor name and boutique name
      const [userRows] = await db.execute("SELECT referred_by FROM users WHERE id = ?", [userId]);
      if (userRows.length > 0 && userRows[0].referred_by) {
        const [sponsorRows] = await db.execute(
          "SELECT full_name, boutique_name FROM users WHERE id = ?",
          [userRows[0].referred_by],
        );
        if (sponsorRows.length > 0) {
          sponsorName = sponsorRows[0].boutique_name
            ? `${sponsorRows[0].full_name} (${sponsorRows[0].boutique_name})`
            : sponsorRows[0].full_name;
        }
      }
    }

    await db.end();
    res.json({
      usersCount: allUsers.length,
      customersCount: allUsers.filter((u) => u.user_type === "customer").length,
      ownersCount: allUsers.filter((u) => u.user_type === "boutique_owner").length,
      referralsCount: allUsers.filter((u) => u.referred_by).length,
      pendingCount: allUsers.filter((u) => u.status === "pending").length,
      activeCount: allUsers.filter((u) => u.status === "active").length,
      directCount,
      networkCount,
      sponsorName,
      allUsers: allUsers.map((u) => {
        const { password_hash, ...safe } = u;
        return safe;
      }),
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, "0.0.0.0", () =>
  console.log("MySQL Direct API listening on port 3000 (accessible on local network)"),
);
