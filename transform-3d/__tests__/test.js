const {chromium} = require('playwright');
const wrapup = require('wrapup')();

// just in case as sometimes the first run takes some time
jest.setTimeout(10000);

test('check rotation + scale changes element size', done => {
(async () =>{
try{
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto("about:blank");
    wrapup.require(__dirname + '/../index.js').up(async (err, code) => {
        await page.setContent(`<html><script type="text/javascript">${code}</script><body>
        <transform-3d id="scaled" scale="1.5" >
		<div id="original" style="height:100px;width:100px;">lol</div>
		</transform-3d>
        </body></html>`);
        const result = await page.evaluate(() => {
            const original = JSON.stringify(document.getElementById('original').offsetHeight)
            const scaled = `${document.getElementById('original').getBoundingClientRect().height}`;
            return Promise.resolve([original,scaled]);
        });
        expect(result[0]).toBe("100");
        expect(result[1]).toBe("150");
        await browser.close();
        done();
    });

} catch(e) {
    done(e)
}
})();   
    

});