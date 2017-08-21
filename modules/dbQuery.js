// dbQuery.js

// REQUIRED MODULES_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
const spicedPg = require( 'spiced-pg' );
const {
    dbUser,
    dbPass,
    dbName
} = require( '../config/secrets.json' );


// MODULES VARIABLES_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
const db = spicedPg( `postgres:${dbUser}:${dbPass}@localhost:5432/${dbName}` );


// save new signature to DB
const postSignature = ( user_id, signature ) => {
    const query = 'INSERT INTO signatures (user_id, signature) VALUES ($1, $2) RETURNING id';
    return db.query( query, [
        user_id,
        signature
    ] ).then( ( signatureId ) => {
        // returns the id of the signer
        return signatureId.rows[ 0 ].id;
    } ).catch( ( err ) => {
        console.error( err.stack );
    } );
};

// retrieve specified signature form DB
const getSignature = ( user_id ) => {
    return db.query( `SELECT signature FROM signatures WHERE id = $1`, [ user_id ] ).then( ( results ) => {
        return results.rows[ 0 ].signature;
    } ).catch( ( err ) => {
        console.error( err.stack );
    } );
};

// retrieve all the signers form DB
const getSigners = () => {
    return db.query(
        `SELECT users."firstName", users."lastName", user_profiles.age, user_profiles.city, user_profiles.url
        FROM users
        JOIN user_profiles
        ON users.id = user_profiles.user_id;`
    ).then( ( results ) => {
        console.log(results.rows);
        return results.rows;
    } ).catch( ( err ) => {
        console.error( err.stack );
    } );
};

// save new user to DB
const postUser = ( firstName, lastName, email, password ) => {
    const query = `INSERT INTO users ( "firstName", "lastName", email, password) VALUES ($1, $2, $3, $4) RETURNING id, "firstName", "lastName"`;
    return db.query( query, [
        firstName,
        lastName,
        email,
        password
    ] ).then( ( userSession ) => {
        return {
            user_id: userSession.rows[ 0 ].id,
            firstName: userSession.rows[ 0 ].firstName,
            lastName: userSession.rows[ 0 ].lastName
        };
    } ).catch( ( err ) => {
        console.error( err.stack );
    } );
};

// save new profile to DB

const postUserProfile = ( user_id, age, city, url ) => {
    const query = 'INSERT INTO user_profiles (user_id, age, city, url) VALUES ($1, $2, $3, $4)';
    return db.query( query, [
        user_id,
        age,
        city,
        url
    ] ).then( () => {
        return;
    } ).catch( ( err ) => {
        console.error( err.stack );
    } );
};

// authenticate user
const checkUser = ( email, password ) => {
    const query = `SELECT id, "firstName", "lastName", email, password FROM users WHERE email = $1`;
    return db.query( query, [ email ] ).then( ( dbUser ) => {
        // console.log( dbUser.rows[ 0 ] );
        return {
            id: dbUser.rows[ 0 ].id,
            firstName: dbUser.rows[ 0 ].firstName,
            lastName: dbUser.rows[ 0 ].lastName,
            email: dbUser.rows[ 0 ].email,
            password: dbUser.rows[ 0 ].password
        };
    } ).then( ( dbUser ) => {
        if ( dbUser.password === password ) {
            return {
                user_id: dbUser.id,
                firstName: dbUser.firstName,
                lastName: dbUser.lastName,
            };
        } else {
            throw 'password do not match';
        }
    } ).catch( ( err ) => {
        console.error( err.stack );
    } );
};


module.exports.postUser = postUser;
module.exports.postUserProfile = postUserProfile;
module.exports.postSignature = postSignature;
module.exports.getSignature = getSignature;
module.exports.getSigners = getSigners;
module.exports.checkUser = checkUser;
