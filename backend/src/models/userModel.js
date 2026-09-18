export const findUserByEmail = async (executor, email) => {
  const [rows] = await executor.execute(
    `SELECT id, first_name, last_name, email, password_hash, role
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email]
  );

  return rows[0] || null;
};

export const findUserBySocialIdentity = async (executor, provider, providerId) => {
  const [rows] = await executor.execute(
    `SELECT id, first_name, last_name, email, role
     FROM users
     WHERE social_provider = ? AND social_provider_id = ?
     LIMIT 1`,
    [provider, providerId]
  );

  return rows[0] || null;
};

export const findUserById = async (executor, userId) => {
  const [rows] = await executor.execute(
    `SELECT id, first_name, last_name, email, role, created_at, updated_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
};

export const createUser = async (executor, user) => {
  const [result] = await executor.execute(
    `INSERT INTO users (first_name, last_name, email, password_hash)
     VALUES (?, ?, ?, ?)`,
    [user.firstName, user.lastName, user.email, user.passwordHash]
  );

  return findUserById(executor, result.insertId);
};

export const createSocialUser = async (executor, user) => {
  const [result] = await executor.execute(
    `INSERT INTO users
      (first_name, last_name, email, password_hash, social_provider, social_provider_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      user.firstName,
      user.lastName,
      user.email,
      user.passwordHash,
      user.provider,
      user.providerId,
    ]
  );

  return findUserById(executor, result.insertId);
};

export const listUsers = async (executor, search = '') => {
  const trimmed = String(search || '').trim();
  let query = `SELECT id, first_name, last_name, email, role, created_at FROM users`;
  const params = [];

  if (trimmed) {
    query += ` WHERE first_name LIKE ? OR last_name LIKE ?`;
    const like = `%${trimmed}%`;
    params.push(like, like);
  }

  query += ` ORDER BY created_at DESC`;

  const [rows] = await executor.execute(query, params);

  return rows;
};

export const updateUserRole = async (executor, userId, role) => {
  const [result] = await executor.execute(
    `UPDATE users SET role = ? WHERE id = ?`,
    [role, userId]
  );

  return result.affectedRows > 0;
};

export const deleteUser = async (executor, userId) => {
  const [result] = await executor.execute(
    `DELETE FROM users WHERE id = ?`,
    [userId]
  );

  return result.affectedRows > 0;
};
