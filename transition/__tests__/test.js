const Transition = require('..');
const {cubicInOut} = require('../equations');

test('it works', (done) => {
    const trans = new Transition(
        100, 
        cubicInOut, 
        () => {}
    );
    
    trans.onComplete(() => {
        expect(true).toBe(true);
        done()
    });

    trans.start();
});

test('it s called the number of expected time', (done) => {
    let called = 0;
    const trans = new Transition(
        100, 
        cubicInOut, 
        () => {
            called++;
        }
    );
    
    trans.onComplete(() => {
        expect(called).toBe(2);
        done()
    });
    //trans.start();
    trans.step(50, true);
    trans.step(150, true);
});

test('it is correct', (done) => {
    const trans = new Transition(
        100, 
        cubicInOut, 
        (step) => {
            expect(step).toMatchSnapshot();
        }
    );
    
    trans.onComplete(() => {
        done()
    });
    for (let i=1, max=101; i<=max; ++i)
        trans.step(i, true);
});
