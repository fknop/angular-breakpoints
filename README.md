# angular-breakpoints

`angular-breakpoints` is a little angular service to listen programmatically to breakpoints.

It works with ´RxJS`.

## Install

### npm

```
npm install angular-breakpoints --save
```

### jspm

```
jspm install angular-breakpoints=npm:angular-breakpoints 
```

## How to use

First you need to import the `breakpointsProvider` function and expose it in the providers array (or in bootstrap).

```
import { breakpointsProvider, BreakpointsService, BreakpointEvent } from 'angular-breakpoints';

@Component({
    // ...
    providers: [breakpointsProvider()]  
    // ...
})
export class YourComponent {

    constructor (private breakpointsService: BreakpointsService) {
        
        this.breakpointsService.changes.subscribe((event: BreakpointEvent) => {
            
            console.log(event);
        });   
    }
}

```

The `changes` property is an instance of `RxJS Observable`. It will gives you the initial value when you subscribe to it.

### BreakpointEvent interface

* name: name of the breakpoint
* breakpoint: value of the breakpoint (min and max)
* currentSize: the current size of the window (width and height)


### Customize breakpoints

The defaults breakpoints are the `Twitter Bootstrap` breakpoints. 

```

const defaultBreakpoints: BreakpointConfig = {
    'xs': { max: 768 },
    'sm': { min: 768, max: 992 },
    'md': { min: 992, max: 1200 },
    'lg': { min: 1200 }
};

```

You can customize the breakpoints by passing a `BreakpointConfig` interface in the `breakpointsProvider`.
To match a breakpoint, the size must be greater or equal than the minimum and less than the maximum (not less or equal).


```
const breakpointConfig: BreakpointConfig = {
    xss: { max: 400 },
    xs: { min: 400, max: 768 },
    sm: { min: 768, max: 992 },
    md: { min: 992, max: 1200 },
    lgs: { min: 1200, max: 1500 },
    lg: { min: 1500 }
}

// ...

providers: [breakpointsProvider(breakpointConfig)]

// ...

```

### Unsubscribe to resize event

The service subscribes to the resize event when created.
If you want to temporarily unsubscribe to the resize event, just call the `unsubscribe` method.
If you want to resubscribe, call the `subscribe` method.