const Draft = require('../models/Draft');
const League = require('../models/League');
const Team = require('../models/Team');
const Player = require('../models/Player');

// POST /api/draft/:leagueId/start
const startDraft = async (req, res) => {
  try {
    const league = await League.findById(req.params.leagueId).populate('teams');

    if (!league) return res.status(404).json({ message: 'League not found' });

    if (league.commissioner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the commissioner can start the draft' });
    }

    if (league.status === 'drafting') {
      return res.status(400).json({ message: 'Draft already started' });
    }

    // Get team IDs and shuffle for snake draft order
    const draftOrder = league.teams.map(t => t._id).sort(() => Math.random() - 0.5)

    const draft = await Draft.create({
      league: league._id,
      draftOrder,
      totalRounds: 15,
      status: 'active'
    })

    league.status = 'drafting'
    await league.save()

    res.status(201).json(draft)
  } catch (err) {
    console.error('❌ Start draft error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// GET /api/draft/:leagueId
const getDraft = async (req, res) => {
  try {
    const draft = await Draft.findOne({ league: req.params.leagueId })
      .populate('draftOrder')
      .populate('picks.team')
      .populate('picks.player')

    if (!draft) return res.status(404).json({ message: 'Draft not found' })

    res.json(draft)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { startDraft, getDraft }
