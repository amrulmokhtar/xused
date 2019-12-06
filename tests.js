const Browser = require('zombie');

Browser.localhost('app.xused.com',5000);

describe('User visits list page', ()=>{
  const browser = new Browser();
  const doneWrap = (done)=>{console.log('donewrap'); return done}
  before((done)=>{
    browser.visit('en/list.html',doneWrap(done))
  });

  describe('has jquery', ()=>{
    it('should have jquery available', function(){
      browser.assert.evaluate('$()');
    });
  });
});
