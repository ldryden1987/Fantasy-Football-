const Matchup = require('../models/Matchup');
const League = require('../models/League');
const Team = require('../models/Team');
const Player = require('../models/Player');
const { calculateFantasyPoints, calculateTeamScore } = require('../utils/scoring');

// POST /api/matchups/:leagueId/generate
const generateMatchups = async (req, res) => {
  const { week } = req.body;
  try {
    const league = await League.findById(req.params.leagueId).populate('teams');
    if (!league) return res.status(404).json({ message: 'League not found' });

    if (league.commissioner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only commissioner can generate matchups' });
    }

    const teams = league.teams
    if (teams.length < 2) {
      return res.status(400).json({ message: 'Need at least 2 teams' });
    }

    // Delete existing matchups for this week
    await Matchup.deleteMany({ league: league._id, week });

    // Generate matchups by pairing teams
    const matchups = []
    const shuffled = [...teams].sort(() => Math.random() - 0.5)

    for (let i = 0; i < shuffled.length - 1; i += 2) {
      matchups.push({
        league: league._id,
        week,
        homeTeam: shuffled[i]._id,
        awayTeam: shuffled[i + 1]._id,
        status: 'scheduled'
      })
    }

    const created = await Matchup.insertMany(matchups)
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// GET /api/matchups/:leagueId/week/:week
const getMatchups = async (req, res) => {
  try {
    const matchups = await Matchup.find({
      league: req.params.leagueId,
      week: req.params.week
    })
      .populate({
        path: 'homeTeam',
        populate: { path: 'roster.player', model: 'Player' }
      })
      .populate({
        path: 'awayTeam',
        populate: { path: 'roster.player', model: 'Player' }
      })
      .populate('winner', 'name')

    res.json(matchups)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// POST /api/matchups/:leagueId/score
const updateScores = async (req, res) => {
  const { week } = req.body;
  try {
    const league = await League.findById(req.params.leagueId);
    if (!league) return res.status(404).json({ message: 'League not found' });

    const matchups = await Matchup.find({
      league: req.params.leagueId,
      week
    })
      .populate({
        path: 'homeTeam',
        populate: { path: 'roster.player', model: 'Player' }
      })
      .populate({
        path: 'awayTeam',
        populate: { path: 'roster.player', model: 'Player' }
      })

    for (const matchup of matchups) {
      const homeScore = calculateTeamScore(
        matchup.homeTeam.roster,
        league.settings.scoringType
      )
      const awayScore = calculateTeamScore(
        matchup.awayTeam.roster,
        league.settings.scoringType
      )

      matchup.homeScore = homeScore
      matchup.awayScore = awayScore
      matchup.status = 'live'
      await matchup.save()
    }

    res.json({ message: `Updated scores for week ${week}`, matchups })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// POST /api/matchups/:leagueId/complete
const completeWeek = async (req, res) => {
  const { week } = req.body;
  try {
    const matchups = await Matchup.find({
      league: req.params.leagueId,
      week
    })

    for (const matchup of matchups) {
      matchup.status = 'completed'
      matchup.winner = matchup.homeScore >= matchup.awayScore
        ? matchup.homeTeam
        : matchup.awayTeam

      // Update team records
      await Team.findByIdAndUpdate(matchup.homeTeam, {
        $inc: {
          wins: matchup.homeScore >= matchup.awayScore ? 1 : 0,
          losses: matchup.homeScore < matchup.awayScore ? 1 : 0,
          points: matchup.homeScore
        }
      })

      await Team.findByIdAndUpdate(matchup.awayTeam, {
        $inc: {
          wins: matchup.awayScore > matchup.homeScore ? 1 : 0,
          losses: matchup.awayScore <= matchup.homeScore ? 1 : 0,
          points: matchup.awayScore
        }
      })

      await matchup.save()
    }

    res.json({ message: `Week ${week} completed` })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// GET /api/matchups/:leagueId/standings
const getStandings = async (req, res) => {
  try {
    const league = await League.findById(req.params.leagueId)
      .populate({
        path: 'teams',
        populate: { path: 'owner', select: 'username' }
      })

    if (!league) return res.status(404).json({ message: 'League not found' });

    const standings = league.teams
      .map(team => ({
        _id: team._id,
        name: team.name,
        owner: team.owner?.username,
        wins: team.wins,
        losses: team.losses,
        points: team.points,
        winPct: team.wins + team.losses > 0
          ? (team.wins / (team.wins + team.losses)).toFixed(3)
          : '.000'
      }))
      .sort((a, b) => b.wins - a.wins || b.points - a.points)

    res.json(standings)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = {
  generateMatchups,
  getMatchups,
  updateScores,
  completeWeek,
  getStandings
}
