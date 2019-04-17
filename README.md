# My Clock

To use it : 

```
import { Clock } from './components/Clock/Clock';

customElements.define('vrx-clock', Clock);

function main() {
  const myClock = new Clock();
}
  
if ((document.readyState === 'interactive') || (document.readyState === 'complete')) {
  main();
} else {
  const domLoaded = function () {
    main();
    document.removeEventListener('DOMContentLoaded', domLoaded);
  };
  document.addEventListener('DOMContentLoaded', domLoaded);
}
```