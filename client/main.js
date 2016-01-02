// routing
Router.configure({
  layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function () {
  this.render('welcome', {
    to: "main"
  }); // render template_name into {{> yield "field_name"}}
});

Router.route('/images', function () {
  this.render('navbar', {
    to: "navbar"
  });
  this.render('images', {
    to: "main"
  });
});

Router.route('/image/:_id', function () {
  this.render('navbar', {
    to: "navbar"
  });
  this.render('image', {
    to: "main",
    data: function(){
      return Images.findOne({_id:this.params._id});
    }
  });
});

// infinite scroll - limits the amount of image displayed at a given time
Session.set("imageLimit", 8);

lastScrollTop = 0;
$(window).scroll(function(event){

  if($(window).scrollTop() + $(window).height() > $(document).height() - 100){
    // ^ tests if we are near the bottom of the window.

    var scrollTop = $(this).scrollTop();
    // ^ where are we in the page?

    if( scrollTop > lastScrollTop ){
      // ^ test if we are going down
      Session.set("imageLimit", Session.get("imageLimit") + 4);
      // ^ loading 4 images at a time
    }
    lastScrollTop = scrollTop;
  }
});

// accounts config
Accounts.ui.config({
  passwordSignupFields: "USERNAME_AND_EMAIL"
});

Template.images.helpers({
  images: function(){
   // helper functions can map to some function
   // or even to some data (has limited use)
    if(Session.get("userFilter")){ // they set the filter
      return Images.find({createdBy: Session.get("userFilter")}, {sort:{createdOn: -1, rating: -1}});
    }
    else{
      return Images.find({}, {sort:{createdOn: -1, rating: -1}, limit:Session.get("imageLimit")});
    }
  },
  filtering_images: function(){
    if(Session.get("userFilter")){ // they set a filter!
      return true;
    }
    else{
      return false;
    }
  },
  getFilterUser: function(){
    if(Session.get("userFilter")){ // they set a filter!
      var user = Meteor.users.findOne({_id:Session.get("userFilter")});
      return user.username;
    }
    else{
      return false;
    }
  },
  getUser: function(user_id){
    var user = Meteor.users.findOne({_id:user_id});
    // users is a collection just like images.
    // However, since it's a Meteor managed collection,
    // we precede with "Meteor."
    if(user){
      return user.username;
    }
    else{
      return "anon";
    }
  }
});

Template.body.helpers({username:function(){
  // Meteor.users.findOne();
  if(Meteor.user()){  // since Meteor loads all templates
                      // at the beginning, it's good to
                      // test if specific code should run
                      // or not. Later, when true,
                      // code will run since Meteor is
                      // responsive.
    // console.log(Meteor.user()); // to view object's FIELDS!
    return Meteor.user().username;
    // return Meteor.user().emails[0].address;
  }
  else{
    return "anonymous internet user";
  }
}
});

 Template.images.events({
  'click .js-image':function(event){
      $(event.target).css("width", "50px");
  },
  'click .js-del-image':function(event){
     var image_id = this._id;
     console.log(image_id);
     // use jquery to hide the image component
     // then remove it at the end of the animation
     $("#"+image_id).hide('slow', function(){
      Images.remove({"_id":image_id});
     })
  },
  'click .js-rate-image':function(event){
    var rating = $(event.currentTarget).data("userrating");
    console.log(rating);
    var image_id = this.id;
    console.log(image_id);

    Images.update({_id:image_id},
                  {$set: {rating:rating}});
  },
  'click .js-show-image-form':function(event){
    $("#image_add_form").modal('show');
  },
  'click .js-set-image-filter':function(event){
    Session.set("userFilter", this.createdBy);
    // Session is a Reactive Data Source that stores
    // key-value pairs. Session records what the
    // user has been doing (in this session).
  },
  'click .js-unset-image-filter':function(event){
    Session.set("userFilter", undefined);
  }
 });

Template.image_add_form.events({
  'submit .js-add-image':function(event){
    var img_src, img_alt;
    img_src = event.target.img_src.value;
    img_alt = event.target.img_alt.value;
    console.log("src: "+img_src+" alt:"+img_alt);
    if(Meteor.user()){ // JavaScript can test object
      Images.insert({
        img_src:img_src,
        img_alt:img_alt,
        createdOn:new Date(),
        createdBy:Meteor.user()._id
      });
    }
     $("#image_add_form").modal('show');
    return false;
  }
});
