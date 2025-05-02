require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const Library = require('./src/models/Library'); // Adjust path if necessary

const sampleLibraries = [
  {
    name: 'React',
    description: 'A JavaScript library for building user interfaces',
    npmPackageName: 'react',
    githubRepoUrl: 'https://github.com/facebook/react',
    tags: ['ui', 'frontend', 'javascript', 'facebook'],
    npmDownloadsLastMonth: 20000000,
    githubStars: 200000,
    githubForks: 40000,
    githubOpenIssues: 1000,
    license: 'MIT',
    score: 95 // Example score
  },
  {
    name: 'Vue.js',
    description: 'The Progressive JavaScript Framework',
    npmPackageName: 'vue',
    githubRepoUrl: 'https://github.com/vuejs/vue',
    tags: ['ui', 'frontend', 'javascript', 'framework', 'progressive'],
    npmDownloadsLastMonth: 3000000,
    githubStars: 200000,
    githubForks: 33000,
    githubOpenIssues: 500,
    license: 'MIT',
    score: 92 // Example score
  },
  {
    name: 'Angular',
    description: 'One framework. Mobile & desktop.',
    npmPackageName: '@angular/core',
    githubRepoUrl: 'https://github.com/angular/angular',
    tags: ['ui', 'frontend', 'javascript', 'framework', 'google', 'typescript'],
    npmDownloadsLastMonth: 2500000,
    githubStars: 85000,
    githubForks: 23000,
    githubOpenIssues: 2000,
    license: 'MIT',
    score: 88 // Example score
  },
  {
    name: 'Lodash',
    description: 'A modern JavaScript utility library delivering modularity, performance, & extras.',
    npmPackageName: 'lodash',
    githubRepoUrl: 'https://github.com/lodash/lodash',
    tags: ['utility', 'javascript', 'functional'],
    npmDownloadsLastMonth: 50000000,
    githubStars: 55000,
    githubForks: 6800,
    githubOpenIssues: 50,
    license: 'MIT',
    score: 85 // Example score
  },
  {
    name: 'Express',
    description: 'Fast, unopinionated, minimalist web framework for Node.js',
    npmPackageName: 'express',
    githubRepoUrl: 'https://github.com/expressjs/express',
    tags: ['backend', 'framework', 'nodejs', 'web', 'api'],
    npmDownloadsLastMonth: 22000000,
    githubStars: 60000,
    githubForks: 10000,
    githubOpenIssues: 150,
    license: 'MIT',
    score: 90 // Example score
  },
    {
    name: 'Svelte',
    description: 'Cybernetically enhanced web apps',
    npmPackageName: 'svelte',
    githubRepoUrl: 'https://github.com/sveltejs/svelte',
    tags: ['ui', 'frontend', 'javascript', 'compiler'],
    npmDownloadsLastMonth: 800000,
    githubStars: 70000,
    githubForks: 3400,
    githubOpenIssues: 700,
    license: 'MIT',
    score: 91 // Example score
  },
];

const seedDB = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/library_finder';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing libraries
    console.log('Clearing existing library data...');
    await Library.deleteMany({});
    console.log('Existing data cleared.');

    // Insert sample libraries
    console.log('Inserting sample libraries...');
    await Library.insertMany(sampleLibraries);
    console.log('Sample data inserted successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

// Run the seeding function
seedDB(); 