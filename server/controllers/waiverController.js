const Waiver = require('../models/Waiver');
const Team = require('../models/Team');
const Player = require('../models/Player');

// POST /api/waivers/:leagueId/claim
const claimPlayer = async (req, res) => {
  const { addPlayerId, dropPlayerId } = req.body;
  try {
    const team = await Team.findOne({
      league: req.params.leagueId,
      owner: req.user._id
    });

    if (!team) return res.status(404).json({ message: 'Team not found' });

    const addPlayer = await Player.findById(addPlayerId);
    if (!addPlayer) return res.status(404).json({ message: 'Player not found' });
    if (addPlayer.owned) return res.status(400).json({ message: 'Player is already owned' });

    const waiver = await Waiver.create({
      league: req.params.leagueId,
      team: team._id,
      addPlayer: addPlayerId,
      dropPlayer: dropPlayerId || null,
      priority: team.waiverPriority
    });

    res.status(201).json(waiver);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/waivers/:leagueId/process
const processWaivers = async (req, res) => {
  try {
    const waivers = await Waiver.find({
      league: req.params.leagueId,
      status: 'pending'
    })
      .populate('team')
      .populate('addPlayer')
      .populate('dropPlayer')
      .sort({ priority: 1 })

    const processed = [];
    const denied = [];
    const claimedPlayers = new Set();

    for (const waiver of waivers) {
      if (claimedPlayers.has(waiver.addPlayer._id.toString())) {
        waiver.status = 'denied';
        await waiver.save();
        denied.push(waiver);
        continue;
      }

      if (waiver.addPlayer.owned) {
        waiver.status = 'denied';
        await waiver.save();
        denied.push(waiver);
        continue;
      }

      // Process the claim
      const team = await Team.findById(waiver.team._id);

      // Drop player if specified
      if (waiver.dropPlayer) {
        team.roster = team.roster.filter(
          r => r.player.toString() !== waiver.dropPlayer._id.toString()
        );
        await Player.findByIdAndUpdate(waiver.dropPlayer._id, {
          owned: false,
          ownedBy: null
        });
      }

      // Add new player
      team.roster.push({ player: waiver.addPlayer._id, slot: 'BN' });
      await Player.findByIdAndUpdate(waiver.addPlayer._id, {
        owned: true,
        ownedBy: team._id
      });

      // Move team to end of waiver priority
      await Team.findByIdAndUpdate(team._id, {
        waiverPriority: waivers.length + 1
      });

      await team.save();

      waiver.status = 'processed';
      await waiver.save();

      claimedPlayers.add(waiver.addPlayer._id.toString());
      processed.push(waiver);
    }

    res.json({
      message: `Processed ${processed.length} claims, denied ${denied.length}`,
      processed,
      denied
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/waivers/:leagueId
const getWaivers = async (req, res) => {
  try {
    const team = await Team.findOne({
      league: req.params.leagueId,
      owner: req.user._id
    });

    const waivers = await Waiver.find({
      league: req.params.leagueId,
      team: team?._id
    })
      .populate('addPlayer', 'name position nflTeam')
      .populate('dropPlayer', 'name position nflTeam')
      .sort({ createdAt: -1 })

    res.json(waivers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { claimPlayer, processWaivers, getWaivers };
