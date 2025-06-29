const ms = require('ms');

/**
 * Checks if the account is older than 40 days.
 * @param {Date} createdAt - The Discord account creation date.
 * @returns {boolean}
 */
function isAccountOldEnough(createdAt) {
  const fortyDays = ms('40d');
  return Date.now() - createdAt.getTime() >= fortyDays;
}

/**
 * Save the roles a user had before being flagged (excluding managed/default roles).
 * @param {GuildMember} member
 * @param {import('mysql2/promise').Pool} db
 */
async function saveUserRoles(member, db) {
  const roles = member.roles.cache
    .filter(role => role.editable && !role.managed && role.id !== member.guild.id)
    .map(role => role.id);

  const serialized = JSON.stringify(roles);
  await db.query(
    `INSERT INTO backgroundchecks (user_id, guild_id, saved_roles)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE saved_roles = VALUES(saved_roles)`,
    [member.id, member.guild.id, serialized]
  );
}

/**
 * Restore saved roles to a user from the database.
 * @param {GuildMember} member
 * @param {import('mysql2/promise').Pool} db
 */
async function restoreUserRoles(member, db) {
  const [rows] = await db.query(
    `SELECT saved_roles FROM backgroundchecks WHERE user_id = ? AND guild_id = ?`,
    [member.id, member.guild.id]
  );

  if (!rows.length || !rows[0].saved_roles) return;

  const roleIds = JSON.parse(rows[0].saved_roles);
  for (const roleId of roleIds) {
    const role = member.guild.roles.cache.get(roleId);
    if (role) {
      try {
        await member.roles.add(role);
      } catch (err) {
        console.error(`Failed to restore role ${roleId} to ${member.user.tag}:`, err.message);
      }
    }
  }

  // Clear saved roles from DB after restoring
  await db.query(
    `UPDATE backgroundchecks SET saved_roles = NULL WHERE user_id = ? AND guild_id = ?`,
    [member.id, member.guild.id]
  );
}

/**
 * Clear saved roles from the database for a user.
 * @param {string} userId
 * @param {string} guildId
 * @param {import('mysql2/promise').Pool} db
 */
async function clearSavedRoles(userId, guildId, db) {
  await db.query(
    `UPDATE backgroundchecks SET saved_roles = NULL WHERE user_id = ? AND guild_id = ?`,
    [userId, guildId]
  );
}

module.exports = {
  isAccountOldEnough,
  saveUserRoles,
  restoreUserRoles,
  clearSavedRoles,
};
