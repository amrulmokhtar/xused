getSingleItem(render, window.location.href.split('?')[1].split('&')[0]);
//function(res){console.log(res)});

const translations = {
  en: {
    Seller : 'Seller',
    Email: 'Email',
    Phone: 'Phone',
    Quantity: 'Quantity',
    Location: 'Location',
    ExtraInfo: 'Extra Info',
    DeleteConfirm: "Are you sure you want to delete your listing?",
    PromptQuantity: "Please enter the new quantity for your item",
    AfterQuantityUpdate: "Your item has been updated!",
    NotFound: "Sorry, this item is no longer available"
  },
  my: {
    Seller : 'Penjual',
    Email: 'Emel',
    Phone: 'Telefon',
    Quantity: 'Kuantiti',
    Location: 'Lokasi',
    ExtraInfo: 'Maklumat Tambahan',
    DeleteConfirm: "Anda pasti untuk hapus bahan buangan anda?",
    PromptQuantity: "Sila nyatakan jumlah kuantiti yang baru",
    AfterQuantityUpdate: "Item anda sudah dikemaskini!",
    NotFound: "Maaf, item ini sudah tiada"
  },

}

let lang = 'en';
let olang = 'my';
if(window.location.href.indexOf('/my/')>0){
  lang = 'my';
  olang = 'en';
}
let translation = translations[lang];

let edit = false;

const beforeRedirect = (callback)=>{
  bootbox.alert(translation.AfterQuantityUpdate, callback)
}

let query;
if(query = window.location.href.split('?')[1]){
    let args = query.split('&');
    if(args[1]=='delete'){
        bootbox.confirm(translation.DeleteConfirm,
        (accept)=>{if(accept){deleteItem(args[0],args[2])}});
    }else if(args[1]=='edit'){
      bootbox.prompt(translation.PromptQuantity,
      (newQuantity)=>{
        if(newQuantity){updateItemQuantity(args[0],args[2],newQuantity, beforeRedirect)}
      });

    }

    $('#translatelink').attr('href',`/${olang}/item_detail.html?${query}`);
}

function render(res){
    $('#itemId').html(window.location.href.split('?')[1]);
    //$('#backButton').href(window.location.href.split('?')[1]);
    let output = res ? <ItemDetail item={res} translation={translation}/> :
      <ItemNotFound translation={translation} />
    ReactDOM.render(
        output,
        document.getElementById("render_target")
    );
}
const Controls = (props)=>{
  console.log(props)
  if(props.item.status == 'available'){
    console.log('available')
    return <div></div>
  }else{
    console.log(props.item.status)
  }
  props.item.id = window.location.href.split('?')[1];
  let verify = ()=>verifyItem(props.item)
  let deny = ()=>denyItem(props.item)
  return <div>
      <button onClick={verify}>Verify</button>
      <button onClick={deny}>Deny</button>
    </div>
}



const ItemDetail = (props)=>{
    //props = props.item;
    return  <div id="itemDetail" className="thumbnail">
                    <img className="img-responsive" src={props.item.image} alt={props.type} />
                    <div className="caption-full">
                        <h3 className="center"><strong>RM {parseFloat(props.item.quantity * prices[props.item.type]).toFixed(2)}</strong></h3>
                        <h4>{props.translation.Seller} : {props.item.name}</h4>
                        <h4>{props.translation.Email} : {props.item.email} </h4>
                        <h4>{props.translation.Phone} : {props.item.phonenumber} </h4>
                        <h4>{props.translation.Quantity} : {props.item.quantity} KG</h4>
                        <h4>{props.translation.Location} : {props.item.address}</h4>
                        <h5>{props.translation.ExtraInfo} : {props.item.extra}</h5>
                    </div>
                    <Controls item={props.item}></Controls>
                </div>
        }

const ItemNotFound = (props)=>{
  return (<div>
    <h2>{props.translation.NotFound}</h2>
  </div>)
}
