// this is image_share.js
Images = new Mongo.Collection("images");

// set up security on Images collection
Images.allow({
  insert:function(userId, doc){ // doc is data
    if (Meteor.user()){ // they are logged in
      if (userId != doc.createdBy){ // the user is messing about
        return false; // don't allow insert
      }
      else{ // the user is logged in, image has correct user id
        return true; // allow insert
      }
    }
    else{
      return false; // user not logged in
    }
  },
  remove:function(userId, doc){
    if (Meteor.user()){ // they are logged in
      if (userId != doc.createdBy){ // user didn't insert the image
        return false; // don't allow remove
      }
      else{ // the user is logged in, image has correct user id
        return true; // allow remove
      }
    }
    else{
      return false; // user not logged in
    }
  }
});
