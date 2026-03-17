try {
  console.log('Loading auth...');
  require('./routes/auth');
  console.log('Loading student...');
  require('./routes/student');
  console.log('Loading admin...');
  require('./routes/admin');
  console.log('Loading quiz...');
  require('./routes/quiz');
  console.log('Loading export...');
  require('./routes/export');
  console.log('All routes loaded successfully');
} catch (err) {
  console.error('CRASH DURING REQUIRE:');
  console.error(err);
  process.exit(1);
}
