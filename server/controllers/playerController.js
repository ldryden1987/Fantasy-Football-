const Player = require('../models/Player');

//Get /api/players
const getPlayers = async (req, res) => {
  try {
    const { position, available, sortBy } = req.query;
    let filter = {};
    if (position) filter.position = position;
    if (available === 'true') filter.owned = false;

    let sort = { fantasyPoints: -1 };
    if (sortBy === 'adp') {
      sort = { adp: 1 };
    }

    const players = await Player.find(filter).sort(sort);
    res.json(players);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// GET /api/players/:id
const getPlayer = async (req, res) => {
    try {
        const player = await Player.findById(req.params.id);
        if (!player) return res.status(404).json({ message: 'Player not found'});
        res.json(player);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message});
    }
};

module.exports = { getPlayers, getPlayer };