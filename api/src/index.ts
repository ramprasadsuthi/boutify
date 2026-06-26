import { Hono } from "hono";
import { cors } from "hono/cors";
import { jwt } from "hono/jwt";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

type Bindings = {
  DB_HOST: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors());

// Database connection helper
const getDB = async (env: Bindings) => {
  return await mysql.createConnection({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  });
};

app.get("/", (c) => c.text("Genealogy API is running"));

// --- Authentication ---

// Register
app.post("/api/auth/register", async (c) => {
  const body = await c.req.json();
  const {
    fullName,
    email,
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
  } = body;

  const db = await getDB(c.env);

  try {
    const [existing]: any = await db.execute(
      "SELECT id FROM users WHERE mobile = ? OR email = ? OR userid = ?",
      [mobile, email || "", userid || ""],
    );
    if (existing.length > 0) {
      return c.json({ error: "Mobile, Email or User ID already registered" }, 400);
    }

    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const status = userType === "admin" ? "active" : "pending";

    let referredBy = null;
    if (userType === "customer" && referralCodeInput) {
      const [referrer]: any = await db.execute("SELECT id FROM users WHERE referral_code = ?", [
        referralCodeInput.toUpperCase(),
      ]);
      if (referrer.length > 0) {
        referredBy = referrer[0].id;
      }
    }

    // Start Transaction
    await db.beginTransaction();

    await db.execute(
      `INSERT INTO users (id, full_name, email, userid, password_hash, mobile, user_type, status, referral_code, referred_by, boutique_name, city, area, boutique_description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        fullName,
        email || null,
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

      // Insert Categories
      if (categories && Array.isArray(categories)) {
        for (const catId of categories) {
          await db.execute(
            "INSERT INTO boutique_categories (boutique_id, category_id) VALUES (?, ?)",
            [id, catId],
          );
        }
      }

      // Insert Offered Services
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
    return c.json({ message: "User registered successfully", id });
  } catch (err: any) {
    await db.rollback();
    return c.json({ error: err.message }, 500);
  } finally {
    await db.end();
  }
});

// Login
app.post("/api/auth/login", async (c) => {
  const { mobile, password } = await c.req.json();
  const db = await getDB(c.env);

  try {
    const [rows]: any = await db.execute("SELECT * FROM users WHERE mobile = ? OR userid = ?", [
      mobile,
      mobile,
    ]);
    if (rows.length === 0) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const payload = { sub: user.id, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 };

    // @ts-ignore
    const token = await jwt.sign(payload, c.env.JWT_SECRET);

    return c.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        userid: user.userid,
        mobile: user.mobile,
        user_type: user.user_type,
        status: user.status,
        referral_code: user.referral_code,
        boutique_name: user.boutique_name,
        wallet_balance: user.wallet_balance,
        city: user.city,
        area: user.area,
        boutique_description: user.boutique_description,
        created_at: user.created_at,
      },
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  } finally {
    await db.end();
  }
});

// Get Profile
app.get("/api/auth/me", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) return c.json({ error: "Unauthorized" }, 401);

  const token = authHeader.replace("Bearer ", "");
  try {
    const payload = await jwt.verify(token, c.env.JWT_SECRET);
    const userId = payload.sub;

    const db = await getDB(c.env);
    const [rows]: any = await db.execute("SELECT * FROM users WHERE id = ?", [userId]);
    await db.end();

    if (rows.length === 0) return c.json({ error: "User not found" }, 404);

    const user = rows[0];
    return c.json({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      userid: user.userid,
      mobile: user.mobile,
      user_type: user.user_type,
      status: user.status,
      referral_code: user.referral_code,
      boutique_name: user.boutique_name,
      wallet_balance: user.wallet_balance,
      city: user.city,
      area: user.area,
      boutique_description: user.boutique_description,
      created_at: user.created_at,
    });
  } catch (err) {
    return c.json({ error: "Invalid token" }, 401);
  }
});

// Get Complete Boutique Details
app.get("/api/boutique/:id", async (c) => {
  const id = c.req.param("id");
  const db = await getDB(c.env);
  try {
    const [userRows]: any = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
    if (userRows.length === 0) return c.json({ error: "User not found" }, 404);

    const user = userRows[0];
    const [detailRows]: any = await db.execute(
      "SELECT * FROM boutique_details WHERE boutique_id = ?",
      [id],
    );
    const details = detailRows.length > 0 ? detailRows[0] : {};

    const [catRows]: any = await db.execute(
      "SELECT category_id FROM boutique_categories WHERE boutique_id = ?",
      [id],
    );
    const categories = catRows.map((r: any) => r.category_id);

    const [svcRows]: any = await db.execute(
      "SELECT service_id FROM boutique_offered_services WHERE boutique_id = ?",
      [id],
    );
    const services = svcRows.map((r: any) => r.service_id);

    return c.json({
      ...user,
      ...details,
      categories,
      services,
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  } finally {
    await db.end();
  }
});

// Update Boutique Details
app.put("/api/boutique/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const db = await getDB(c.env);

  // Helper to convert undefined or empty strings to null for MySQL
  const val = (v: any) => (v === undefined || v === "" ? null : v);

  try {
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

    // Update Categories
    await db.execute("DELETE FROM boutique_categories WHERE boutique_id = ?", [id]);
    if (body.categories && Array.isArray(body.categories)) {
      for (const catId of body.categories) {
        await db.execute(
          "INSERT INTO boutique_categories (boutique_id, category_id) VALUES (?, ?)",
          [id, catId],
        );
      }
    }

    // Update Services
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
    return c.json({ message: "Boutique details updated successfully" });
  } catch (err: any) {
    await db.rollback();
    return c.json({ error: err.message }, 500);
  } finally {
    await db.end();
  }
});

// Update Profile
app.patch("/api/auth/profile", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) return c.json({ error: "Unauthorized" }, 401);
  const token = authHeader.replace("Bearer ", "");

  try {
    const payload = await jwt.verify(token, c.env.JWT_SECRET);
    const userId = payload.sub;
    const body = await c.req.json();

    const db = await getDB(c.env);

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

      const [existing]: any = await db.execute(
        `SELECT id FROM users WHERE (${checks.join(" OR ")}) AND id != ?`,
        [...params, userId],
      );

      if (existing.length > 0) {
        await db.end();
        return c.json({ error: "User ID or Mobile number already in use" }, 400);
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

    if (!updates) return c.json({ error: "No valid fields provided" }, 400);

    const values = Object.keys(body)
      .filter((key) => allowedFields.includes(key))
      .map((key) => body[key]);

    values.push(userId);

    await db.execute(`UPDATE users SET ${updates} WHERE id = ?`, values);
    await db.end();

    return c.json({ message: "Profile updated" });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Customer Network (3 levels) ---
app.get("/api/network", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) return c.json({ error: "Unauthorized" }, 401);
  const token = authHeader.replace("Bearer ", "");

  try {
    const payload = await jwt.verify(token, c.env.JWT_SECRET);
    const userId = payload.sub;

    const db = await getDB(c.env);
    const [users]: any = await db.execute(
      'SELECT id, full_name, mobile, referred_by FROM users WHERE user_type = "customer"',
    );
    await db.end();

    const map = new Map<string, any[]>();
    users.forEach((u: any) => {
      if (u.referred_by) {
        if (!map.has(u.referred_by)) map.set(u.referred_by, []);
        map.get(u.referred_by)!.push({
          id: u.id,
          name: u.full_name,
          mobile: u.mobile,
        });
      }
    });

    const network: any[] = [];
    const queue = [{ id: userId, level: 1 }];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr.level > 3) continue;

      const children = map.get(curr.id as string) || [];
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

    return c.json({ network });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- Admin Credit Distribution ---
app.post("/api/admin/credit", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) return c.json({ error: "Unauthorized" }, 401);
  const token = authHeader.replace("Bearer ", "");

  try {
    const payload = await jwt.verify(token, c.env.JWT_SECRET);
    const adminId = payload.sub;

    const db = await getDB(c.env);

    // Verify admin
    const [admins]: any = await db.execute("SELECT user_type FROM users WHERE id = ?", [adminId]);
    if (!admins.length || admins[0].user_type !== "admin") {
      const foundType = admins.length ? admins[0].user_type : "NOT_FOUND";
      return c.json(
        { error: `Forbidden: User ${adminId} is not an admin (Type: ${foundType})` },
        403,
      );
    }

    const { customerId, amount, boutiqueOwnerId } = await c.req.json();
    const creditAmount = parseFloat(amount);

    if (isNaN(creditAmount) || creditAmount <= 0) {
      return c.json({ error: "Invalid amount" }, 400);
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
    const customerParents = [];
    let firstAdminId = null;

    for (let i = 0; i < 10; i++) {
      const [rows]: any = await db.execute(
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

    const distributions = [];
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
    return c.json({ message: "Credit distributed successfully", distributions });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Admin Get Wallet History
app.get("/api/admin/transactions", async (c) => {
  const db = await getDB(c.env);
  try {
    const [rows]: any = await db.execute(`
      SELECT t.*, u.full_name, u.mobile 
      FROM transactions t 
      JOIN users u ON t.user_id = u.id 
      ORDER BY t.created_at DESC
    `);
    return c.json(rows);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  } finally {
    await db.end();
  }
});

// --- Boutiques ---
app.get("/api/boutiques", async (c) => {
  const db = await getDB(c.env);
  try {
    const [rows]: any = await db.execute(`
      SELECT id, full_name, mobile, boutique_name, city, area, boutique_description 
      FROM users WHERE user_type = "boutique_owner" AND status = "active"
    `);
    return c.json(rows);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  } finally {
    await db.end();
  }
});

app.post("/api/boutique/services", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) return c.json({ error: "Unauthorized" }, 401);
  const token = authHeader.replace("Bearer ", "");

  try {
    const payload = await jwt.verify(token, c.env.JWT_SECRET);
    const boutiqueId = payload.sub;

    const { serviceName, charge } = await c.req.json();
    const db = await getDB(c.env);

    await db.execute(
      "INSERT INTO boutique_services (boutique_id, service_name, charge) VALUES (?, ?, ?)",
      [boutiqueId, serviceName, charge],
    );
    await db.end();

    return c.json({ message: "Service added successfully" });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.get("/api/boutique/services/:boutiqueId", async (c) => {
  const boutiqueId = c.req.param("boutiqueId");
  const db = await getDB(c.env);
  try {
    const [rows]: any = await db.execute("SELECT * FROM boutique_services WHERE boutique_id = ?", [
      boutiqueId,
    ]);
    return c.json(rows);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  } finally {
    await db.end();
  }
});

// --- Admin List Users ---
app.get("/api/users", async (c) => {
  const db = await getDB(c.env);
  try {
    const [rows]: any = await db.execute(
      "SELECT id, full_name, email, userid, mobile, user_type, status, referral_code, referred_by, wallet_balance, created_at FROM users ORDER BY created_at DESC",
    );
    return c.json(rows);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  } finally {
    await db.end();
  }
});

app.patch("/api/users/:id/status", async (c) => {
  const id = c.req.param("id");
  const { status } = await c.req.json();
  const db = await getDB(c.env);
  try {
    await db.execute("UPDATE users SET status = ? WHERE id = ?", [status, id]);
    return c.json({ message: "Status updated" });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  } finally {
    await db.end();
  }
});

app.delete("/api/users/:id", async (c) => {
  const id = c.req.param("id");
  const db = await getDB(c.env);
  try {
    await db.execute("DELETE FROM users WHERE id = ?", [id]);
    return c.json({ message: "User deleted" });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  } finally {
    await db.end();
  }
});

app.get("/api/dashboard/stats", async (c) => {
  const userId = c.req.query("userId");
  const role = c.req.query("role");
  const db = await getDB(c.env);

  try {
    const [allUsers]: any = await db.execute("SELECT * FROM users");

    const customers = allUsers.filter((u: any) => u.user_type === "customer");
    const owners = allUsers.filter((u: any) => u.user_type === "boutique_owner");
    const pending = allUsers.filter((u: any) => u.status === "pending").length;
    const active = allUsers.filter((u: any) => u.status === "active").length;
    const referrals = customers.filter((u: any) => u.referred_by).length;

    let direct = 0,
      network = 0;
    if (role === "customer" && userId) {
      const map = new Map<string, string[]>();
      customers.forEach((c: any) => {
        if (c.referred_by) {
          if (!map.has(c.referred_by)) map.set(c.referred_by, []);
          map.get(c.referred_by)!.push(c.id);
        }
      });

      const queue = [{ id: userId, depth: 0 }];
      const visited = new Set<string>();
      while (queue.length) {
        const curr = queue.shift()!;
        for (const ch of map.get(curr.id) ?? []) {
          if (visited.has(ch)) continue;
          visited.add(ch);
          if (curr.depth + 1 < 3) {
            queue.push({ id: ch, depth: curr.depth + 1 });
          }
          if (curr.id === userId) direct++;
        }
      }
      network = visited.size;
    }

    return c.json({
      usersCount: allUsers.length,
      customersCount: customers.length,
      ownersCount: owners.length,
      referralsCount: referrals,
      pendingCount: pending,
      activeCount: active,
      directCount: direct,
      networkCount: network,
      allUsers, // For charts if needed
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  } finally {
    await db.end();
  }
});

// --- Metadata ---
app.get("/api/metadata/categories", async (c) => {
  const db = await getDB(c.env);
  try {
    const [rows]: any = await db.execute("SELECT * FROM categories ORDER BY name");
    return c.json(rows);
  } finally {
    await db.end();
  }
});

app.get("/api/metadata/services", async (c) => {
  const db = await getDB(c.env);
  try {
    const [rows]: any = await db.execute("SELECT * FROM services ORDER BY name");
    return c.json(rows);
  } finally {
    await db.end();
  }
});

app.get("/api/metadata/cities", async (c) => {
  const db = await getDB(c.env);
  try {
    const [rows]: any = await db.execute(
      'SELECT DISTINCT city FROM users WHERE user_type = "boutique_owner" AND status = "active" AND city IS NOT NULL AND city != "" ORDER BY city',
    );
    return c.json(rows.map((r: any) => r.city));
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  } finally {
    await db.end();
  }
});

export default app;
