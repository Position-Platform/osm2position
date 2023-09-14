const { pool } = require('./functions/db.js')
const { addDataInDb } = require('./functions/app.js')

function osm2position() {
    pool.connect((err, client, done) => {
        if (err) {
            console.log(err)
            return done(err)
        }
        addDataInDb(client, done);


    })
}

osm2position();



