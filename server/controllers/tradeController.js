const Trade = require('../models/Trade');
const Team = require('../models/Team');
const Player = require('../models/Player');

// POST /api/trades/:leagueId/send
const sendTrade = async (req, res) => {
  const { receiverTeamId, senderPlayers, receiverPlayers, message } = req.body;
  try {
    // Get sender's team
    const senderTeam = await Team.findOne({
      league: req.params.leagueId,
      owner: req.user._id
    });

    if (!senderTeam) {
      return res.status(404).json({ message: 'Your team not found' });
    }

    if (senderTeam._id.toString() === receiverTeamId) {
      return res.status(400).json({ message: 'Cannot trade with yourself' });
    }

    const trade = await Trade.create({
      league: req.params.leagueId,
      senderTeam: senderTeam._id,
      receiverTeam: receiverTeamId,
      senderPlayers,
      receiverPlayers,
      message: message || ''
    });

    const populated = await Trade.findById(trade._id)
      .populate('senderTeam', 'name')
      .populate('receiverTeam', 'name')
      .populate('senderPlayers', 'name position nflTeam')
      .populate('receiverPlayers', 'name position nflTeam')

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/trades/:tradeId/accept
const acceptTrade = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.tradeId)
      .populate('senderPlayers')
      .populate('receiverPlayers')

    if (!trade) return res.status(404).json({ message: 'Trade not found' });
    if (trade.status !== 'pending') {
      return res.status(400).json({ message: 'Trade is no longer pending' });
    }

    const receiverTeam = await Team.findOne({
      _id: trade.receiverTeam,
      owner: req.user._id
    });

    if (!receiverTeam) {
      return res.status(403).json({ message: 'Not authorized to accept this trade' });
    }

    // Swap players between teams
    const senderTeam = await Team.findById(trade.senderTeam);

    // Remove sender's players from sender, add to receiver
    for (const player of trade.senderPlayers) {
      senderTeam.roster = senderTeam.roster.filter(
        r => r.player.toString() !== player._id.toString()
      );
      receiverTeam.roster.push({ player: player._id, slot: 'BN' });
      await Player.findByIdAndUpdate(player._id, { ownedBy: receiverTeam._id });
    }

    // Remove receiver's players from receiver, add to sender
    for (const player of trade.receiverPlayers) {
      receiverTeam.roster = receiverTeam.roster.filter(
        r => r.player.toString() !== player._id.toString()
      );
      senderTeam.roster.push({ player: player._id, slot: 'BN' });
      await Player.findByIdAndUpdate(player._id, { ownedBy: senderTeam._id });
    }

    await senderTeam.save();
    await receiverTeam.save();

    trade.status = 'accepted';
    await trade.save();

    res.json({ message: 'Trade accepted!', trade });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/trades/:tradeId/reject
const rejectTrade = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.tradeId);
    if (!trade) return res.status(404).json({ message: 'Trade not found' });

    const receiverTeam = await Team.findOne({
      _id: trade.receiverTeam,
      owner: req.user._id
    });

    if (!receiverTeam) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    trade.status = 'rejected';
    await trade.save();

    res.json({ message: 'Trade rejected', trade });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/trades/:tradeId/cancel
const cancelTrade = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.tradeId);
    if (!trade) return res.status(404).json({ message: 'Trade not found' });

    const senderTeam = await Team.findOne({
      _id: trade.senderTeam,
      owner: req.user._id
    });

    if (!senderTeam) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    trade.status = 'cancelled';
    await trade.save();

    res.json({ message: 'Trade cancelled', trade });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/trades/:leagueId
const getTrades = async (req, res) => {
  try {
    const myTeam = await Team.findOne({
      league: req.params.leagueId,
      owner: req.user._id
    });

    if (!myTeam) return res.status(404).json({ message: 'Team not found' });

    const trades = await Trade.find({
      league: req.params.leagueId,
      $or: [{ senderTeam: myTeam._id }, { receiverTeam: myTeam._id }]
    })
      .populate('senderTeam', 'name')
      .populate('receiverTeam', 'name')
      .populate('senderPlayers', 'name position nflTeam')
      .populate('receiverPlayers', 'name position nflTeam')
      .sort({ createdAt: -1 })

    res.json({ trades, myTeamId: myTeam._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { sendTrade, acceptTrade, rejectTrade, cancelTrade, getTrades };
