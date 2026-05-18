const Draft = require('../models/Draft');
const Player = require('../models/Player');
const Team = require('../models/Team');

const activeTimers = {};

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join draft room
    socket.on('join_draft', async ({ leagueId, teamId }) => {
      socket.join(leagueId);
      console.log(`Team ${teamId} joined draft room ${leagueId}`);

      const draft = await Draft.findOne({ league: leagueId })
        .populate('draftOrder')
        .populate('picks.player')
        .populate('picks.team');

      socket.emit('draft_state', draft);
    });

    // Make a pick
    socket.on('make_pick', async ({ leagueId, teamId, playerId }) => {
      try {
        const draft = await Draft.findOne({ league: leagueId });
        if (!draft || draft.status !== 'active') return;

        // Verify it's this team's turn
        const totalTeams = draft.draftOrder.length;
        const pickIndex = draft.currentPick % totalTeams;
        const isEvenRound = draft.currentRound % 2 === 0;
        const currentTeamIndex = isEvenRound ? totalTeams - 1 - pickIndex : pickIndex;
        const currentTeamId = draft.draftOrder[currentTeamIndex].toString();

        if (currentTeamId !== teamId) {
          socket.emit('pick_error', { message: "It's not your turn!" });
          return;
        }

        // Check player is available
        const player = await Player.findById(playerId);
        if (!player || player.owned) {
          socket.emit('pick_error', { message: 'Player is not available' });
          return;
        }

        // Clear pick timer
        if (activeTimers[leagueId]) {
          clearTimeout(activeTimers[leagueId]);
          delete activeTimers[leagueId];
        }

        // Add pick to draft
        draft.picks.push({
          round: draft.currentRound,
          pick: draft.currentPick + 1,
          team: teamId,
          player: playerId
        });

        // Mark player as owned
        player.owned = true;
        player.ownedBy = teamId;
        await player.save();

        // Add player to team roster
        await Team.findByIdAndUpdate(teamId, {
          $push: { roster: { player: playerId, slot: 'BN' } }
        });

        // Advance pick
        draft.currentPick += 1;
        const totalPicks = totalTeams * draft.totalRounds;

        if (draft.currentPick % totalTeams === 0) {
          draft.currentRound += 1;
        }

        if (draft.currentPick >= totalPicks) {
          draft.status = 'completed';
        }

        await draft.save();

        const updatedDraft = await Draft.findOne({ league: leagueId })
          .populate('draftOrder')
          .populate({ path: 'picks.player' })
          .populate({ path: 'picks.team' });

        // Broadcast updated draft to all in room
        io.to(leagueId).emit('pick_made', {
          draft: updatedDraft,
          lastPick: { player, teamId }
        });

        // Start next pick timer if draft still active
        if (draft.status === 'active') {
          startPickTimer(io, leagueId, draft);
        } else {
          io.to(leagueId).emit('draft_completed');
        }

      } catch (err) {
        console.error('Pick error:', err);
        socket.emit('pick_error', { message: 'Server error making pick' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

// Pick timer — auto pick if time runs out
const startPickTimer = (io, leagueId, draft) => {
  if (activeTimers[leagueId]) clearTimeout(activeTimers[leagueId]);

  io.to(leagueId).emit('pick_timer_start', { seconds: draft.pickTimeLimit });

  activeTimers[leagueId] = setTimeout(async () => {
    try {
      const currentDraft = await Draft.findOne({ league: leagueId });
      if (!currentDraft || currentDraft.status !== 'active') return;

      // Auto pick best available player by position
      const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
      let autoPick = null;

      for (const pos of positions) {
        autoPick = await Player.findOne({ owned: false, position: pos });
        if (autoPick) break;
      }

      if (!autoPick) return;

      const totalTeams = currentDraft.draftOrder.length;
      const pickIndex = currentDraft.currentPick % totalTeams;
      const isEvenRound = currentDraft.currentRound % 2 === 0;
      const currentTeamIndex = isEvenRound ? totalTeams - 1 - pickIndex : pickIndex;
      const currentTeamId = currentDraft.draftOrder[currentTeamIndex];

      io.to(leagueId).emit('make_pick', {
        leagueId,
        teamId: currentTeamId.toString(),
        playerId: autoPick._id.toString()
      });
    } catch (err) {
      console.error('Auto pick error:', err);
    }
  }, draft.pickTimeLimit * 1000);
};
