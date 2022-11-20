//------------login required------------
/*const authRequired = authRequiredPaths => {
    return (req, res, next) => {
      if(authRequiredPaths.includes(req.path)) {
        if(req.session && req.session.user) {
          next();
        } else {
          res.redirect('/login');
        }
      }
      else {
        next();
      }
    };
};

export {
    authRequired
};
*/

const requireLogin = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  }
  else {
    res.redirect('/login');
  }
};

const logRequest = (req, res, next) => {
  console.log(req.method, req.path, req.body);
  next();
};

export {
  requireLogin,
  logRequest
};