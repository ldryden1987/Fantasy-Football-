const mongoose = require('mongoose');
const fetch = require('node-fetch');
const Player = require('./models/Player');
require('dotenv').config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    console.log('📡 Fetching players from Sleeper API...');
    const response = await fetch('https://api.sleeper.app/v1/players/nfl');
    const data = await response.json();

    console.log(`📦 Total players received: ${Object.keys(data).length}`);

    // Filter to only active skill position players
    const filtered = Object.values(data).filter((p) =>
      p.active &&
      p.full_name &&
      p.team &&
      ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].includes(p.position)
    );

    console.log(`✅ Filtered to ${filtered.length} active players`);

    // Map Sleeper data to our Player schema
    const players = filtered.map((p) => ({
      name: p.full_name,
      position: p.position,
      nflTeam: p.team,
      status: p.injury_status ? 'injured' : 'active',
      stats: {
        passingYards: 0,
        passingTDs: 0,
        interceptions: 0,
        rushingYards: 0,
        rushingTDs: 0,
        receivingYards: 0,
        receivingTDs: 0,
        receptions: 0,
        fieldGoals: 0,
        extraPoints: 0,
      },
      fantasyPoints: 0,
      owned: false,
      ownedBy: null,
      sleeperId: p.player_id,
    }));

    // Clear old players and insert new ones
    await Player.deleteMany({});
    console.log('🗑️  Cleared existing players');

    await Player.insertMany(players);
    console.log(`🏈 Successfully seeded ${players.length} NFL players!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();
