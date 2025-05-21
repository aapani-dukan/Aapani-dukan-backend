const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture } = ticket.getPayload();

    const jwtToken = jwt.sign({ email, name, picture }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({ token: jwtToken });
  } catch (error) {
    res.status(400).json({ message: 'Login failed', error });
  }
};

module.exports = { googleLogin };
