import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import url from 'url';

class Database {
  constructor() {
    this.connect();
  }

  connect() {
    // DO NOT CHANGE THE FOLLOWING
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    let dbconf;

    if (process.env.NODE_ENV === 'PRODUCTION') {
      // if we're in PRODUCTION mode, then read the configration from a file
      // use blocking file io to do this...
      const fn = path.join(__dirname, 'config.json');
      const data = fs.readFileSync(fn);
    
      // our configuration file will be in json, so parse it and set the
      // conenction string appropriately!
      const conf = JSON.parse(data);
      dbconf = conf.dbconf;
    }
    else {
      // if we're not in PRODUCTION mode, then use
      dbconf = 'mongodb://localhost/finalProject';
    }

    mongoose.connect(dbconf).then(() => {
      console.log('database connection successful');
    }).catch((err) => {
      console.log('database connection error ' + err);
    });
  }
}

const database = new Database();

export {
  database
};