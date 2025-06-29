// Select random winners from a list of user objects
function pickWinners(userArray, winnerCount) {
    const users = [...userArray]; // Clone array to avoid mutation
    const winners = [];

    while (winners.length < winnerCount && users.length > 0) {
        const index = Math.floor(Math.random() * users.length);
        const [winner] = users.splice(index, 1);
        winners.push(winner);
    }

    return winners;
}

// Format winners as mention strings or fallback message
function formatWinners(winners, prize) {
    if (!winners.length) {
        return `😔 No valid entries, no winners could be chosen for **${prize}**.`;
    }

    return `🎉 Congratulations ${winners.map(w => `<@${w.id}>`).join(', ')}! You won **${prize}**!`;
}

module.exports = {
    pickWinners,
    formatWinners,
};
