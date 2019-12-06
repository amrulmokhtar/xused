
//function(res){console.log(res)});

let query;
let selectedStatus = "available";

const translations = {
  en: {
    Seller : 'Seller',
    Email: 'Email',
    Phone: 'Phone',
    Quantity: 'Quantity',
    Location: 'Location',
    ExtraInfo: 'Extra Info',
    ViewMore: 'View More',
    'Used Cooking Oil': 'Used Cooking Oil',
    'Cans': 'Cans',
    'Plastics': 'Plastics',
    'Paper': 'Paper',
    'Glass': 'Glass',
    'Food Waste': 'Food Waste'
  },
  my: {
    Seller : 'Penjual',
    Email: 'Emel',
    Phone: 'Telefon',
    Quantity: 'Kuantiti',
    Location: 'Lokasi',
    ExtraInfo: 'Maklumat Tambahan',
    ViewMore: 'Lihat Seterusnya',
    'Used Cooking Oil': 'Minyak Masak Terpakai',
    'Cans': 'Tin Aluminium',
    'Plastics': 'Plastik',
    'Paper': 'Kertas',
    'Glass': 'Kaca',
    'Food Waste': 'Sisa Makanan'
  },

}

let lang = 'en';
let olang = 'my';
if(window.location.href.indexOf('/my/')>0){
  lang = 'my';
  olang = 'en';
}
let translation = translations[lang];

if(query = window.location.href.split('?')){
    let type = decodeURI(query[1])
    getListItems(render, type);
    if(query[2] == "unverified"){
      selectedStatus = "unverified"
    }
    $('#breadcrumb').html(translation[type]);
    $('#header').html(translation[type]);
    $('#translatelink').attr('href',`/${olang}/list_seller.html?${type}`);
}

function render(res){

    let resarray = [];
    for(let i in res){
        let item = res[i];
        item.id = i;
        if(item.status == selectedStatus){
          resarray.push(item);
        }
    }
    let list = resarray.map((res)=><Listing item ={res} translation={translation}/>)
    ReactDOM.render(
        <div>
        {list}
        </div>,
        document.getElementById("item_list")
    );
}

/*
const Listing = (props)=>{
    return <div className="col-sm-6 col-md-4">
                <div className="thumbnail">
                  <img src={props.item.image} alt="Item Image" />
                  <div className="caption" class="pull-right">
                    <h3>RM {props.item.quantity * prices[props.item.type]}</h3>
                    <p>{props.translation.Seller} : {props.item.name}</p>
                    <p>{props.translation.Quantity} : {props.item.quantity} KG</p>
                    <p>{props.translation.Location} : {props.item.address} </p>
                    <p><a href={"item_detail.html?"+props.item.id} className="btn btn-success" role="button">{props.translation.ViewMore}</a> </p>
                  </div>
                </div>
            </div>
        }
*/

/* New Thumbnail Design */

const Listing = (props)=>{
    return (<div className="item col-xs-6 col-md-4 col-lg-3">
        <div className="thumbnail">
            <img className="group list-group-image" src={props.item.image} alt="Item Image" />
            <div className="caption">
                <h4 className="group inner list-group-item-heading">
                   {props.item.quantity} KG
               </h4>
               <hr />
                <p className="group inner list-group-item-text">
                    <i className="fa fa-tag fa-2x" aria-hidden="true"></i>
                    RM {parseFloat(props.item.quantity * prices[props.item.type]).toFixed(2)}
                </p>
                <p className="group inner list-group-item-text">
                    <i className="fa fa-user fa-2x" aria-hidden="true"></i>
                    {props.item.name}
                </p>
                <p className="group inner list-group-item-text" >
                    <i className="fa fa-map-marker fa-2x" aria-hidden="true"></i>
                    {props.item.city}, {props.item.country}
                </p>
                <div className="row">
                    <div className="col-xs-12 col-md-12">
                        <a className="btn btn-block btn-success btn-list-seller" href={"item_detail.html?"+props.item.id}>{props.translation.ViewMore}</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
        )
        }
