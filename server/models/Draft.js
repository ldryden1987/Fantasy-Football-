const mongoose = require('mongoose');

const DraftSchema = new mongoose.Schema({
    league: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'League',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'completed'],
        default: 'pending'
    },
    draftOrder: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team"
    }],
    currentPick: {
        type: Number, 
        default: 0
    },
    currentRound: {
        type: Number,
        default: 1
    },
    totalRounds: {
        type: Number,
        default: 15
    },
    picks: [{
        round: Number,
        pick: Number,
        team: { type:mongoose.Schema.Types.ObjectId, ref: 'Team'},
        player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player'},
        timestamp: { type: Date, default: Date.now}
    }],
    pickTimeLimit: {
        type: Number,
        default: 60
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Draft', DraftSchema);