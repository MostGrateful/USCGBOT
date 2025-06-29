/**
 * Select random winners from a collection of users
 * @param {Collection<string, User>} users - Discord users who reacted
 * @param {number} count - Number of winners to select
 * @returns {User[]} - Array of randomly selected winners
 */
function selectWinners(users, count) {
  const shuffled = [...users.values()].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

module.exports = {
  selectWinners
};
