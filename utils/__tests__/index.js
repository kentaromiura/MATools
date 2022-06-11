const Transition = require('@kentaromiura/transition');
const cubicBezier = require('..').cubicBezier;

test('should work', (done) => {
    const trans = new Transition(
        4000, 
        cubicBezier(
            [
                { x: 0, y: 0}, { x: 0, y: 1.3}, { x: 0.48, y: 1.36}, { x: 0.5, y: 0}, { x: 0.5, y: 1}, { x: 1, y: 1}, { x: 1, y: 0}
            ], 0.0001),
        (t) => {
            expect(t).toMatchSnapshot();
        }
    );
    
    trans.onComplete(() => {
        expect(true).toBe(true);
        done()
    });

    trans.step(0, true);
    trans.step(1000, true);
    trans.step(2000, true);
    trans.step(3000, true);
    trans.step(4000, true);
        
})
