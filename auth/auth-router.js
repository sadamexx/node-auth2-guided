const router = require('express').Router();
const bcrypt = require('bcryptjs');

const Users = require('../users/users-model.js');

// for endpoints beginning with /api/auth
router.post('/register', (req, res) => {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 10); // 2 ^ n
  user.password = hash;

  Users.add(user)
    .then(saved => {
      req.session.loggedIn = true; //#7 this would keep them logged in once registered

      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

router.post('/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        req.session.loggedIn = true;// #4 we can save cookie info 
        req.session.username = user.username;//#4   

        res.status(200).json({
          message: `Welcome ${user.username}!`,
        });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});


//# 11 create a log out and destroy the session (cookie may still be alive, but we can destroy session and cookie wont work)

router.get('/logout', (req,res) => {
  if(req.session){
  req.session.destroy(error => {
    if(err){
      res.status(500).json({ message: "You are still logged in man, sowwy!"});
    } else { 
      res.status(200).json({message: "You successfully logged out!"});     
    }
  });
} else {
  res.status(200).json({message: "You successfully logged out!"});
}
});


module.exports = router;
