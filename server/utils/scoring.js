// Calculate fantasy points based on scoring type
const calculateFantasyPoints = (stats, scoringType = 'ppr') => {
    let points = 0;

    //Passing
    points += (stats.passingYards || 0) * 0.04
    points += (stats.passingTDs || 0) * 4
    points += (stats.interceptions || 0) * 2

    //Rushing
    points += (stats.rushingYards || 0) * 0.1
    points += (stats.rushingTDs || 0) * 6

    //Receiving
    points += (stats.receivingYards || 0) * 0.1
    points += (stats.receivingTDs || 0) * 6

    //Receptions
    if (scoringType === 'ppr') {
        points += (stats.receptions || 0) * 1
    } else if (scoringType === 'half-ppr') {
        points += (stats.receptions || 0) * 0.5
    }

    //Kicking
    points += (stats.fieldGoals || 0) * 3
    points += (stats.extraPoints || 0) * 1

    return Math.round(points * 100) / 100
}

//Calculate team score from roster
const calculateTeamScore = (roster, scoringType = 'ppr') =>
{
    let totalPoints = 0

    roster.forEach(({player, slot}) => {
        if (!player || slot === 'BN') return
        const points = calculateFantasyPoints(player.stats,scoringType)
        totalPoints += points
    })
    return Math.round(totalPoints * 100) / 100
}

module.exports = { calculateFantasyPoints, calculateTeamScore }