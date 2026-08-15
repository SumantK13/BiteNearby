const pool = require('../config/db');

// Generic query helper
const query = (text, params) => pool.query(text, params);

// User queries
const userQueries = {
  create: (name, email, passwordHash, phone) =>
    query('INSERT INTO users (name, email, password_hash, phone) VALUES ($1, $2, $3, $4) RETURNING *', 
    [name, email, passwordHash, phone]),
  
  findByEmail: (email) =>
    query('SELECT * FROM users WHERE email = $1', [email]),
  
  findById: (id) =>
    query('SELECT * FROM users WHERE id = $1', [id])
};

// MessOwner queries
const messOwnerQueries = {
  create: (name, email, passwordHash, phone) =>
    query('INSERT INTO mess_owners (name, email, password_hash, phone) VALUES ($1, $2, $3, $4) RETURNING *', 
    [name, email, passwordHash, phone]),
  
  findByEmail: (email) =>
    query('SELECT * FROM mess_owners WHERE email = $1', [email]),
  
  findById: (id) =>
    query('SELECT * FROM mess_owners WHERE id = $1', [id])
};




// Mess queries
const messQueries = {
  create: (name, address, latitude, longitude, messOwnerId) =>
    query(
      `INSERT INTO messes (name, address, latitude, longitude, mess_owner_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, address, latitude, longitude, messOwnerId]
    ),

  findById: (id) =>
    query('SELECT * FROM messes WHERE id = $1', [id]),

  findAll: () =>
    query('SELECT * FROM messes'),

  // Find messes within a radius (in km) using Haversine formula
  findNearby: (latitude, longitude, radiusKm = 5) =>
    query(
      `SELECT * FROM (
        SELECT *, 
          ( 6371 * acos( cos( radians($1) ) * cos( radians( latitude ) ) 
          * cos( radians( longitude ) - radians($2) ) 
          + sin( radians($1) ) * sin( radians( latitude ) ) ) ) AS distance 
        FROM messes
      ) AS mess_with_distance
      WHERE distance < $3
      ORDER BY distance`,
      [latitude, longitude, radiusKm]
    ),

    findByOwnerId: (ownerId) =>
    query('SELECT * FROM messes WHERE mess_owner_id = $1', [ownerId]),

};




// Dish queries
const dishQueries = {
  create: (name, price, messId) =>
    query(
      'INSERT INTO dishes (name, price, mess_id) VALUES ($1, $2, $3) RETURNING *',
      [name, price, messId]
    ),

  findByMess: (messId) =>
    query('SELECT * FROM dishes WHERE mess_id = $1', [messId]),

  findById: (id) =>
    query('SELECT * FROM dishes WHERE id = $1', [id]),
  
  update: (id, name, price) =>
    query(
      'UPDATE dishes SET name = $1, price = $2 WHERE id = $3 RETURNING *',
      [name, price, id]
    ),

  deleteById: (id) =>
    query('DELETE FROM dishes WHERE id = $1 RETURNING *', [id]),

  findByIdWithMess: (id) =>
    query(
      `SELECT d.*, m.mess_owner_id 
       FROM dishes d 
       JOIN messes m ON m.id = d.mess_id 
       WHERE d.id = $1`,
      [id]
    ),
  deleteItemsByDishId: (dishId) =>
    query('DELETE FROM dish_items WHERE dish_id = $1', [dishId]),
};

// Dish items queries
const dishItemQueries = {
  addItem: (dishId, itemName) =>
    query(
      'INSERT INTO dish_items (dish_id, item_name) VALUES ($1, $2) RETURNING *',
      [dishId, itemName]
    ),

  findByDish: (dishId) =>
    query('SELECT * FROM dish_items WHERE dish_id = $1', [dishId])
};

// Menu queries
const menuQueries = {
  create: (messId, mealType, date) =>
    query(
      'INSERT INTO menus (mess_id, meal_type, date) VALUES ($1, $2, $3) RETURNING *',
      [messId, mealType, date]
    ),

  findByMessAndDate: (messId, date) =>
    query('SELECT * FROM menus WHERE mess_id = $1 AND date = $2', [messId, date]),

  linkDish: (menuId, dishId) =>
    query(
      'INSERT INTO menu_dishes (menu_id, dish_id) VALUES ($1, $2) RETURNING *',
      [menuId, dishId]
    ),

  // Get full menu with dishes and their items for a mess on a given date
  getFullMenu: (messId, date) =>
    query(
      `SELECT 
        m.id AS menu_id, m.meal_type, m.date,
        d.id AS dish_id, d.name AS dish_name, d.price,
        di.item_name
       FROM menus m
       JOIN menu_dishes md ON md.menu_id = m.id
       JOIN dishes d ON d.id = md.dish_id
       LEFT JOIN dish_items di ON di.dish_id = d.id
       WHERE m.mess_id = $1 AND m.date = $2
       ORDER BY m.meal_type, d.id`,
      [messId, date]
    )
};

// Enrollment queries
const enrollmentQueries = {
  create: (userId, messId) =>
    query(
      'INSERT INTO enrollments (user_id, mess_id) VALUES ($1, $2) RETURNING *',
      [userId, messId]
    ),

  findByUser: (userId) =>
    query(
      `SELECT e.*, m.name AS mess_name, m.address 
       FROM enrollments e 
       JOIN messes m ON m.id = e.mess_id 
       WHERE e.user_id = $1`,
      [userId]
    ),

  findByMess: (messId) =>
    query(
      `SELECT e.*, u.name AS user_name, u.email 
       FROM enrollments e 
       JOIN users u ON u.id = e.user_id 
       WHERE e.mess_id = $1`,
      [messId]
    ),

  updateAcceptance: (enrollmentId, isAccepted) =>
    query(
      'UPDATE enrollments SET is_accepted = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [isAccepted, enrollmentId]
    ),

  findOne: (userId, messId) =>
    query(
      'SELECT * FROM enrollments WHERE user_id = $1 AND mess_id = $2',
      [userId, messId]
    )
};

// Reservation queries
const reservationQueries = {
  create: (userId, messId, mealType, date) =>
    query(
      'INSERT INTO reservations (user_id, mess_id, meal_type, date) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, messId, mealType, date]
    ),

  findByUserAndDate: (userId, date) =>
    query(
      `SELECT r.*, m.name AS mess_name 
       FROM reservations r 
       JOIN messes m ON m.id = r.mess_id 
       WHERE r.user_id = $1 AND r.date = $2`,
      [userId, date]
    ),

  checkExisting: (userId, messId, mealType, date) =>
    query(
      'SELECT * FROM reservations WHERE user_id = $1 AND mess_id = $2 AND meal_type = $3 AND date = $4',
      [userId, messId, mealType, date]
    ),

  findByMessAndDate: (messId, date) =>
    query(
      `SELECT r.*, u.name AS user_name, u.email 
       FROM reservations r 
       JOIN users u ON u.id = r.user_id 
       WHERE r.mess_id = $1 AND r.date = $2
       ORDER BY r.meal_type, u.name`,
      [messId, date]
    ),

    findById: (id) =>
      query('SELECT * FROM reservations WHERE id = $1', [id]),

    deleteById: (id) =>
      query('DELETE FROM reservations WHERE id = $1 RETURNING *', [id]),
};

module.exports = { 
  userQueries, 
  messOwnerQueries, 
  messQueries, 
  dishQueries, 
  dishItemQueries, 
  menuQueries,
  enrollmentQueries,
  reservationQueries,
  query 
};