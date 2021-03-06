/****************************************************
   * MEMORY USER STORE MODEL
   * This shows a few basic patterns for working with a custom "user store"
   * Note this is a POC, it's not secure and not ready for production
   * (passwords should be encrypted, users shouldn't be stored in memory, etc)
****************************************************/
const { UserSession } = require("@esri/arcgis-rest-auth");

// An in-memory user store, please don't follow this approach in production
let userStore = [{
  // username: "mpayson@esri.com",
  // password: "notsecure",
  username: "mpayson@esri.com"
}];

// Validates a username and password from the user store
// For demo, it doesn't actually do this, instead it accepts
// any user name and stores if needed
async function validateCredentials(username, password){
  const user = userStore.find(user => 
    user.username === username
  );
  if(!user){
    userStore.push({username: username})
  }
  return true;
}

// Gets the user associated with an ArcGIS username and portal URL (should be unique)
// Could alternatively do this off of email as another unique identifier
async function getUserForAGSUser(arcgisUsername, arcgisPortalURL){
  const user = userStore.find(user => 
    user.arcgis
    && user.arcgis.username === arcgisUsername
    && user.arcgis.portal === arcgisPortalURL
  );
  if(user) {
    // deep copy and cautiously don't send password around
    const resultUser = {
      ...user,
      arcgis: {...user.arcgis}
    };
    delete resultUser.password;
    return resultUser;
  }
  return undefined;
}

// Get valid session information from user
// expects username returns arcgis-rest-js user session
async function getAGSSessionForUser(username){
  const user = userStore.find(user => 
    user.username === username
  );
  if(user && user.arcgis){
    let session = new UserSession(user.arcgis);

    // For demo, just say the user is logged out
    // In production, use the refresh token to get a new access token:
    //    session = await session.refreshSession();
    //    joinAGSSession(username, session);
    // The refresh token can also refresh itself, and this can be monitored in the background
    if(session.tokenExpires < new Date()){
      return undefined;
    }

    return session;

  }
  return undefined;
}

// Joins an arcgis session to the user store
// Expects a username and arcgis-rest-js user session
function joinAGSSession(username, arcgisSession){
  const userIndex = userStore.findIndex(user => 
    user.username === username
  );
  if(userIndex < 0) throw new Error("User not found when joining ArcGIS session");
  const user = userStore[userIndex];
  if(arcgisSession) user.arcgis = arcgisSession.toJSON();
  else delete user.arcgis;
}

module.exports = {
  validateCredentials,
  getUserForAGSUser,
  getAGSSessionForUser,
  joinAGSSession
}

