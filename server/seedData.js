const { Movie } = require('./models/Movie');
const Counter = require('./models/Counter');

const sampleMovies = [
  {
    title: 'Inception',
    genre: 'Sci-Fi',
    releaseYear: 2010,
    runtime: 148,
    platform: 'Netflix',
    priority: 5,
    status: 'To Watch',
  },
  {
    title: 'The Dark Knight',
    genre: 'Action',
    releaseYear: 2008,
    runtime: 152,
    platform: 'Prime Video',
    priority: 5,
    status: 'Watching',
  },
  {
    title: 'Interstellar',
    genre: 'Sci-Fi',
    releaseYear: 2014,
    runtime: 169,
    platform: 'Netflix',
    priority: 4,
    status: 'Watched',
    rating: 9,
    watchedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Parasite',
    genre: 'Thriller',
    releaseYear: 2019,
    runtime: 132,
    platform: 'Hotstar',
    priority: 4,
    status: 'Watched',
    rating: 10,
    watchedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Knives Out',
    genre: 'Comedy',
    releaseYear: 2019,
    runtime: 130,
    platform: 'Prime Video',
    priority: 3,
    status: 'Watched',
    rating: 8,
    watchedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Dune: Part Two',
    genre: 'Sci-Fi',
    releaseYear: 2024,
    runtime: 166,
    platform: 'Theatre',
    priority: 5,
    status: 'To Watch',
  },
  {
    title: 'Whiplash',
    genre: 'Drama',
    releaseYear: 2014,
    runtime: 107,
    platform: 'Other',
    priority: 4,
    status: 'To Watch',
  },
  {
    title: 'The Grand Budapest Hotel',
    genre: 'Comedy',
    releaseYear: 2014,
    runtime: 99,
    platform: 'Hotstar',
    priority: 3,
    status: 'To Watch',
  },
];

const seedSampleMovies = async () => {
  try {
    const count = await Movie.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding curated initial movies to showcase dashboard metrics and pagination...');
      for (const item of sampleMovies) {
        const seq = await Counter.getNextSequence(item.releaseYear);
        const movieCode = `MV-${item.releaseYear}-${String(seq).padStart(3, '0')}`;
        await Movie.create({
          ...item,
          movieCode,
          titleLower: item.title.toLowerCase(),
        });
      }
      console.log('✅ Initial movies seeded successfully.');
    }
  } catch (err) {
    console.error('Error seeding initial movies:', err.message);
  }
};

module.exports = { seedSampleMovies };
