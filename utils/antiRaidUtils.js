const db = require('../core/db');

async function saveUserRoles(member) {
  const roles = member.roles.cache.filter(r => r.id !== member.guild.id && r.id !== '1388991296710115439').map(r => r.id).join(',');
  await db.query(
    'REPLACE INTO backgroundchecks (user_id, saved_roles) VALUES (?, ?)',
    [member.id, roles]
  );
}

async function removeUserRoles(member) {
  const rolesToRemove = member.roles.cache.filter(r => r.id !== member.guild.id);
  for (const role of rolesToRemove.values()) {
    await member.roles.remove(role).catch(() => {});
  }
}

async function restoreUserRoles(member) {
  const [rows] = await db.query('SELECT saved_roles FROM backgroundchecks WHERE user_id = ?', [member.id]);
  if (!rows[0]) return;

  const roleIds = rows[0].saved_roles.split(',');
  for (const roleId of roleIds) {
    const role = member.guild.roles.cache.get(roleId);
    if (role) {
      await member.roles.add(role).catch(() => {});
    }
  }

  await db.query('UPDATE backgroundchecks SET saved_roles = NULL WHERE user_id = ?', [member.id]);
}

async function clearSavedRoles(memberId) {
  await db.query('DELETE FROM backgroundchecks WHERE user_id = ?', [memberId]);
}

module.exports = {
  saveUserRoles,
  removeUserRoles,
  restoreUserRoles,
  clearSavedRoles
};
