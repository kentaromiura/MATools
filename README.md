MATools - My animation tools
===

MaTools is a 0 dependency modern rewrite of animation tools I used in the past, mostly all written by @kamicane:

Original are 
https://github.com/kamicane/maybe-later
https://github.com/kamicane/transition
https://github.com/kamicane/matrix3d
https://github.com/kamicane/transform3d

@kentaromiura / transform-3d

equation designer fork I made because light background.
https://gist.github.com/kentaromiura/b7509d6bec83783be37b
https://github.com/kamicane/equation-designer

Embrace, Extend, what else?
===

This monorepo uses rush, to build and compile I think 
```
npx rush install
npx rush build
```
should be enough, please let me know if it doesn't work.

for running the few tests:
```
npx jest
```

You can run the equation designer by double clicking on it.
The resulting function should work with the `cubicBezier` function
from @kamicane that I've added inside the utils folder (@kentaromiura/ma-utils).



