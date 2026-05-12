const League = require('../models/League');
const Team = require('../models/Team');
const User = require('../models/User');
const crypto = require('crypto');

// Generate unique invite code
const generateInviteCode = () =>
  crypto.randomBytes(4).toString('hex').toUpperCase();

// POST /api/leagues/create
const createLeague = async (req, res) => {
  const { name, scoringType, maxTeams } = req.body;
  try {
    const inviteCode = generateInviteCode();

    const league = await League.create({
      name,
      commissioner: req.user._id,
      members: [req.user._id],
      settings: {
        scoringType: scoringType || 'ppr',
        maxTeams: maxTeams || 10
      },
      inviteCode
    });

    // Create a team for the commissioner
    const team = await Team.create({
      name: req.user.teamName || `${req.user.username}'s Team`,
      owner: req.user._id,
      league: league._id
    });

    // Add team to league
    league.teams.push(team._id);
    await league.save();

    // Add league to user
    await User.findByIdAndUpdate(req.user._id, {
      $push: { leagues: league._id }
    });

    res.status(201).json({ league, team });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/leagues/join
const joinLeague = async (req, res) => {
  const { inviteCode } = req.body;
  try {
    const league = await League.findOne({ inviteCode });
    if (!league) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    if (league.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are already in this league' });
    }

    if (league.members.length >= league.settings.maxTeams) {
      return res.status(400).json({ message: 'League is full' });
    }

    // Create team for new member
    const team = await Team.create({
      name: req.user.teamName || `${req.user.username}'s Team`,
      owner: req.user._id,
      league: league._id
    });

    league.members.push(req.user._id);
    league.teams.push(team._id);
    await league.save();

    await User.findByIdAndUpdate(req.user._id, {
      $push: { leagues: league._id }
    });

    res.json({ league, team });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/leagues/my
const getMyLeagues = async (req, res) => {
  try {
    const leagues = await League.find({ members: req.user._id })
      .populate('commissioner', 'username')
      .populate('members', 'username teamName')
      .populate('teams')
    res.json(leagues);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/leagues/:id
const getLeague = async (req, res) => {
  try {
    const league = await League.findById(req.params.id)
      .populate('commissioner', 'username')
      .populate('members', 'username teamName')
      .populate({
        path: 'teams',
        populate: { path: 'owner', select: 'username teamName' }
      });

    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }

    res.json(league);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createLeague, joinLeague, getMyLeagues, getLeague };
