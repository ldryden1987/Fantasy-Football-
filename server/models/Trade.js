const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema({
    league: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'League',
        required: true
    },
    senderTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    receiverTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    senderPlayers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    }],
    receiverPayers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    }],
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'cancelled'],
        default: 'pending'
    },
    message: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Trade', TradeSchema);