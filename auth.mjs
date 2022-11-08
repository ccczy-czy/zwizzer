const authRequired = authRequiredPaths => {
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