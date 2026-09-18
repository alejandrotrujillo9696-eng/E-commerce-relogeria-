export const deleteUserPasswordResetTokens = async (executor, userId) => {
  await executor.execute(
    'DELETE FROM password_reset_tokens WHERE user_id = ?',
    [userId]
  );
};

export const createPasswordResetToken = async (
  executor,
  { userId, tokenHash, expiresAt }
) => {
  await executor.execute(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES (?, ?, ?)`,
    [userId, tokenHash, expiresAt]
  );
};

export const findValidPasswordResetToken = async (executor, tokenHash) => {
  const [rows] = await executor.execute(
    `SELECT id, user_id, expires_at
     FROM password_reset_tokens
     WHERE token_hash = ? AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP
     LIMIT 1`,
    [tokenHash]
  );

  return rows[0] || null;
};

export const consumePasswordResetToken = async (executor, tokenId) => {
  const [result] = await executor.execute(
    `UPDATE password_reset_tokens
     SET used_at = CURRENT_TIMESTAMP
     WHERE id = ? AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP`,
    [tokenId]
  );

  return result.affectedRows > 0;
};