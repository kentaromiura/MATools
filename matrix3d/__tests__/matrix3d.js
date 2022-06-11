const Matrix3d = require('../lib/Matrix3d');

test('Matrix 3d', () => {

    const identity = new Matrix3d();
    expect(identity.toString3d()).toBe('matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)');

    const newMatrix = identity.clone();
    newMatrix.transX = 2;
    expect(newMatrix.toString3d()).not.toBe(identity.toString3d());
    expect(newMatrix.toString3d()).toBe('matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 2, 0, 0, 1)');
})