const League = require('../models/League');
const Team = require('../models/Team');
const Matchup = require('../models/Matchup');

// POST /api/playoffs/:leagueId/generate
const generatePlayoffs = async (req, res) => {
  try {
    const league = await League.findById(req.params.leagueId)
      .populate({
        path: 'teams',
        populate: { path: 'owner', select: 'username' }
      })

    if (!league) return res.status(404).json({ message: 'League not found' })

    if (league.commissioner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Commissioner access only' })
    }

    // Sort teams by wins then points
    const sorted = [...league.teams].sort((a, b) =>
      b.wins - a.wins || b.points - a.points
    )

    const playoffTeams = sorted.slice(0, league.settings.playoffTeams || 4)
    const playoffWeek = league.settings.playoffWeekStart || 14

    // Generate semifinal matchups
    const semifinals = [
      {
        league: league._id,
        week: playoffWeek,
        homeTeam: playoffTeams[0]._id,
        awayTeam: playoffTeams[3]._id,
        status: 'scheduled',
        isPlayoff: true,
        playoffRound: 'semifinal'
      },
      {
        league: league._id,
        week: playoffWeek,
        homeTeam: playoffTeams[1]._id,
        awayTeam: playoffTeams[2]._id,
        status: 'scheduled',
        isPlayoff: true,
        playoffRound: 'semifinal'
      }
    ]

    await Matchup.deleteMany({
      league: league._id,
      week: { $gte: playoffWeek },
      isPlayoff: true
    })

    await Matchup.insertMany(semifinals)

    league.status = 'active'
    await league.save()

    res.json({
      message: 'Playoffs generated!',
      playoffTeams: playoffTeams.map((t, i) => ({
        seed: i + 1,
        name: t.name,
        owner: t.owner?.username,
        wins: t.wins,
        losses: t.losses,
        points: t.points
      }))
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// GET /api/playoffs/:leagueId/bracket
const getBracket = async (req, res) => {
  try {
    const league = await League.findById(req.params.leagueId)
      .populate({
        path: 'teams',
        populate: { path: 'owner', select: 'username' }
      })

    if (!league) return res.status(404).json({ message: 'League not found' })

    const playoffWeek = league.settings.playoffWeekStart || 14

    const playoffMatchups = await Matchup.find({
      league: req.params.leagueId,
      week: { $gte: playoffWeek },
      isPlayoff: true
    })
      .populate('homeTeam', 'name wins losses points')
      .populate('awayTeam', 'name wins losses points')
      .populate('winner', 'name')
      .sort({ week: 1 })

    // Sort teams for seeding
    const sorted = [...league.teams].sort((a, b) =>
      b.wins - a.wins || b.points - a.points
    )

    const seeds = sorted.slice(0, league.settings.playoffTeams || 4).map((t, i) => ({
      seed: i + 1,
      name: t.name,
      owner: t.owner?.username,
      wins: t.wins,
      losses: t.losses,
      points: t.points,
      _id: t._id
    }))

    res.json({ seeds, matchups: playoffMatchups })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { generatePlayoffs, getBracket }
