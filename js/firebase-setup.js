// Initialize Firebase
var config = {
    apiKey: "AIzaSyAh0el2YksK8nNlXV90VgxkxiZYfDshijg",
    authDomain: "xused-3852c.firebaseapp.com",
    databaseURL: "https://xused-3852c.firebaseio.com",
    storageBucket: "gs://xused-3852c.appspot.com/",
};

////IMPORTANT!!!////
// Production:
// var itemDB = "/items/"
// Development:
// var itemDB = "/testitems/"
// ENSURE YOU CHANGE TO PRODUCTION BEFORE DEPLOYING
// TODO:20 Make deploy script / build script that automatically changes this
//var itemDB = "/testitems/"
var itemDB = "/items/"


firebase.initializeApp(config);

//TODO:50 move to own file. Lazy because don't want to include in all html versions
prices = {
  "Used Cooking Oil": 1,
  "Cans":0.7,
  "Plastics":0.5,
  "Paper":0.35
}

//FIXME: don't use globals; will implement proper modules later
var addressPicker;
var geoloation;

//TODO: Move to own file. putting this here to save Amrul work when translating
//FIXME: use proper module include system to ensure that symbols are available when needed
if(typeof($) == 'function'){
  console.log('jquery included')
  $('#notification-form').on('submit',function(e,r){
    e.preventDefault();
    interests = $(e.target).find('input:checked')
    .valueOf().toArray().map(function(i){return i.value})

    if(window.location.href.indexOf('/my/')>0){
      bootbox.alert("Anda telah selesai mendaftar. Anda akan mendapat emel apabila bahan buangan baru dimasukkan ke dalam XUsed")
    }else{
      bootbox.alert("You've successfully registered. You will soon be receiving emails when new items are posted in XUsed")
    }
    addBuyerNotification(e.target.email.value, interests);
    $('#buyerNotificationModal').modal('toggle');
  });

  if($('#address').length){
    addressPicker = new AddressPicker({
      //autocompleteService:{
      //  types: ['(geocode)'],
      //}
    });

    console.log('making typeahead')
    $('#address').typeahead(null, {
      displayKey: 'description',

      source: addressPicker.ttAdapter()
    });

    addressPicker.bindDefaultTypeaheadEvent($('#address'))

    $(addressPicker).on('addresspicker:selected', function (event, result) {
      console.log('address picked')
      //TODO: Wire up storing the correct location in the database using this method
      $('#state').val(result.nameForType('administrative_area_level_1')
    );
      $('#city').val(result.nameForType('locality')  ||
        result.nameForType('administrative_area_level_2') ||
          result.nameForType('administrative_area_level_3'));
      $('#country').val(result.nameForType('country'));
      geolocation = {lat:result.lat(), lng: result.lng()}
    });
  }
};

// Get a reference to the database service
var database = firebase.database();
var imageStorage
if(firebase.storage){
 imageStorage = firebase.storage();
}

function addBuyerNotification(email, interests){
    database.ref('buyers/'+btoa(email)).set({
      email:email,
      interests: interests
    })
}

function addWaitingList(email){
    database.ref('waitinglist/').push({'email':email});
}

function addListItem(item){
    console.log(item)
    var parsed = {
        type: item.type.value,
        quantity: item.quantity.value,
        email: item.email.value,
        address: item.address.value,
        city: item.city.value,
        state: item.state.value,
        country: item.country.value,
        geolocation: geolocation,
        phonenumber: item.phonenumber.value,
        extra: item.extra.value,
        name: item.name.value,
        status: "unverified",
        date: new Date().toISOString(),
        deletecode: btoa(item.email.value + Date.now())
    }

    //TODO:40 Validation: client & server
    var rootRef = imageStorage.ref();
    var targetRef = rootRef.child('images/'+parsed.email+new Date().toJSON());
    var progmodal = bootbox.dialog({
        message:"Uploading",
        title:"Uploading",
        buttons:{}
    })
    var file = item.filebutton.files[0];
    targetRef.put(file).then(function(snapshot){
        console.log(snapshot);
        targetRef.getDownloadURL().then(function(url){
            parsed.image = url;
            database.ref(itemDB).push(parsed).then(function(){
              // Could do this with relative links and skip the js routing
              // but this could be more flexible if we want to run other lang
              // dependent scripts afterwards
              if(window.location.href.indexOf('/my/')>0){
                var progmodal = bootbox.dialog({
                    message:"Pihak kami sedang menilai semula bahan buangan anda, dan ia akan mengambil sedikit masa. Pihak kami akan menghantar emel kepada anda sebaik sahaja kami mengesahkan maklumat anda",
                    title:"Bahan buangan anda telah dimuatnaik!",
                    buttons:{
                      success: {
                        label: "Ok!",
                        className: "btn-success",
                        callback: function(accept){window.location.href = '/my/list_seller.html?'+parsed.type}
                      }
                    }
                });


              }else{
                var progmodal = bootbox.dialog({
                    message:"We are currently reviewing your item, it may take a while for us to confirm. We will send you an email as soon as we have confirmed your details",
                    title:"Your Item Has Been Uploaded!",
                    buttons:{
                      success: {
                        label: "Ok!",
                        className: "btn-success",
                        callback: function(accept){window.location.href = '/en/list_seller.html?'+parsed.type}
                      }
                    }
                });
              }
            });
        });
    });
}

function deleteItem(id,code){
    var itemRef = database.ref(itemDB+id)
    .set({deletecode:code,status:'deleted'});
    // TODO:0 Proper internationalizations
    //check if Malay
    if(window.location.href.indexOf('/my/')>0){
      window.location.href = '/my/list.html'
    }else{
      window.location.href = '/en/list.html'
    }
}

function updateItemQuantity(id,code,quantity,beforeRedirect){
    var itemRef = database.ref(itemDB+id)
    .update({deletecode:code,quantity:quantity}).then(
      function(){
        beforeRedirect(function(){
          // #TODO:10 Proper internationalizations
          //check if Malay
          if(window.location.href.indexOf('/my/')>0){
            window.location.href = '/my/item_detail.html?'+id
          }else{
            window.location.href = '/en/item_detail.html?'+id
          }
        })
      }
    );

}

function getListItems(renderAction, type){
    var itemsRef = database.ref(itemDB).orderByChild('type').equalTo(type)
    .once('value').then(function(snapshot){
        var item = snapshot.val();
        renderAction(item);
    });
}

function getSingleItem(renderAction, id){
    var itemsRef = database.ref(itemDB+id)
    .once('value')
    .then(function(snapshot){renderAction(snapshot.val())});
}

function verifyItem(item){
  var itemRef = database.ref(itemDB+item.id+'/status').set('available');
  // TODO:30 Proper internationalizations
  //check if Malay
  if(window.location.href.indexOf('/my/')>0){
    var subject = "Bahan buangan anda di XUsed telah disahkan!"
    var emailBody = "Anda boleh melihat item anda melalui url ini: "+ window.location.href
    + "\n Untuk menghapuskan item anda, sila klik url ini: "+ window.location.href + "%26delete%26"+item.deletecode
  }else{
    var subject = "Your XUsed Recycling has been verified!"
    var emailBody = "You can view the item at this link: " + window.location.href
    + "\n To edit your item, go to this link: " + window.location.href+"%26edit%26"+item.deletecode
    + "\n To delete your item, go to this link: " + window.location.href+"%26delete%26"+item.deletecode
  }

  window.open("mailto:"+item.email+"?subject="+subject+"&body="+emailBody, '_blank')
}

function denyItem(item){
  deleteItem(item.id, item.deletecode);
  var subject = "Your XUsed Recycling has not been listed"
  var emailBody = "[[GIVE EXPLANATION HERE]]"
  window.open("mailto:"+item.email+"?subject="+subject+"&body="+emailBody, '_blank')
}
