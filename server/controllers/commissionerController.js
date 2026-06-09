const League = require('../models/League');
const Team = require('../models/Team');
const Trade = require('../models/Trade');
const Player = require('../models/Player');

// GET /api/commissioner/:leagueId/dashboard
const getDashboard = async (req, res) => {
  try {
    const league = await League.findById(req.params.leagueId)
      .populate('commissioner', 'username')
      .populate({
        path: 'teams',
        populate: { path: 'owner', select: 'username email' }
      })

    if (!league) return res.status(404).json({ message: 'League not found' })

    if (league.commissioner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Commissioner access only' })
    }

    const pendingTrades = await Trade.find({
      league: req.params.leagueId,
      status: 'pending'
    })
      .populate('senderTeam', 'name')
      .populate('receiverTeam', 'name')
      .populate('senderPlayers', 'name position')
      .populate('receiverPlayers', 'name position')

    res.json({ league, pendingTrades })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// PUT /api/commissioner/:leagueId/settings
const updateSettings = async (req, res) => {
  const { name, scoringType, maxTeams, playoffWeekStart, playoffTeams } = req.body
  try {
    const league = await League.findById(req.params.leagueId)
    if (!league) return res.status(404).json({ message: 'League not found' })

    if (league.commissioner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Commissioner access only' })
    }

    if (name) league.name = name
    if (scoringType) league.settings.scoringType = scoringType
    if (maxTeams) league.settings.maxTeams = maxTeams
    if (playoffWeekStart) league.settings.playoffWeekStart = playoffWeekStart
    if (playoffTeams) league.settings.playoffTeams = playoffTeams

    await league.save()
    res.json(league)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// POST /api/commissioner/:tradeId/veto
const vetoTrade = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.tradeId)
    if (!trade) return res.status(404).json({ message: 'Trade not found' })

    const league = await League.findById(trade.league)
    if (league.commissioner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Commissioner access only' })
    }

    trade.status = 'rejected'
    await trade.save()

    res.json({ message: 'Trade vetoed', trade })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// POST /api/commissioner/:leagueId/reset-waivers
const resetWaiverOrder = async (req, res) => {
  try {
    const league = await League.findById(req.params.leagueId).populate('teams')
    if (!league) return res.status(404).json({ message: 'League not found' })

    if (league.commissioner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Commissioner access only' })
    }

    const shuffled = [...league.teams].sort(() => Math.random() - 0.5)
    for (let i = 0; i < shuffled.length; i++) {
      await Team.findByIdAndUpdate(shuffled[i]._id, { waiverPriority: i + 1 })
    }

    res.json({ message: 'Waiver order reset successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// DELETE /api/commissioner/:leagueId/remove-team/:teamId
const removeTeam = async (req, res) => {
  try {
    const league = await League.findById(req.params.leagueId)
    if (!league) return res.status(404).json({ message: 'League not found' })

    if (league.commissioner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Commissioner access only' })
    }

    const team = await Team.findById(req.params.teamId)
    if (!team) return res.status(404).json({ message: 'Team not found' })

    // Release all players
    for (const { player } of team.roster) {
      if (player) {
        await Player.findByIdAndUpdate(player, { owned: false, ownedBy: null })
      }
    }

    // Remove team from league
    league.teams = league.teams.filter(t => t.toString() !== req.params.teamId)
    league.members = league.members.filter(m => m.toString() !== team.owner.toString())
    await league.save()

    await Team.findByIdAndDelete(req.params.teamId)

    res.json({ message: 'Team removed from league' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = {
  getDashboard,
  updateSettings,
  vetoTrade,
  resetWaiverOrder,
  removeTeam
}
