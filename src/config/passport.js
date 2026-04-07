import dotenv from 'dotenv';
dotenv.config();

export default (passport) => {
  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user.id || user.email);
  });

  // Deserialize user
  passport.deserializeUser((id, done) => {
    // Get user from database by id
    done(null, { email: id });
  });
};