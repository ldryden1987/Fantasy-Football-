const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    league: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'League',
        default: null
    },
    type: {
        type: String,
        enum: [
            'trade_offer',
            'trade_accepted',
            'trade_rejected',
            'trade_vetoed',
            'waiver_processed',
            'waiver_denied',
            'draft_turn',
            'draft_completed',
            'league_joined',
            'general'
        ],
        required: true
    },
    title: {type: String, required: true },
    message: {type: String, required: true },
    read: { type: Boolean, default: false },
    link: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);