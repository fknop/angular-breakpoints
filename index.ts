import { Injectable, NgZone, InjectionToken, Provider } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/distinctUntilChanged';


export interface WindowSize {
    width: number;
    height: number;
}

export interface Breakpoint {
    min?: number;
    max?: number;
}

export interface BreakpointEvent {
    name: string;
    breakpoint: Breakpoint;
    size: WindowSize;
}

export interface BreakpointConfig {
    [name: string]: Breakpoint;
}

export const defaultBreakpoints: BreakpointConfig = {
    xs: { max: 768 },
    sm: { min: 768, max: 992 },
    md: { min: 992, max: 1200 },
    lg: { min: 1200 }
};

const FALLBACK_BREAKPOINT = {
    min: 0, max: Number.MAX_SAFE_INTEGER
}

export const BREAKPOINTS_CONFIG = new InjectionToken<BreakpointConfig>('breakpoints.config');

export function breakpointsFactory (ngZone: NgZone, breakpoints: BreakpointConfig) {
    return new BreakpointsService(ngZone, breakpoints)
}


export function breakpointsProvider (breakpoints: BreakpointConfig = defaultBreakpoints): Provider[] {
    return [
        {
            provide: BREAKPOINTS_CONFIG,
            useValue: breakpoints
        },
        {
            provide: BreakpointsService,
            useFactory: breakpointsFactory,
            deps: [NgZone, BREAKPOINTS_CONFIG]
        }
    ];
}


@Injectable()
export class BreakpointsService  {
    
    private lastBreakpoint: string = null;
    private breakpoints: BreakpointConfig = defaultBreakpoints;
    private changesSubject: BehaviorSubject<BreakpointEvent>;
    private subscription: Subscription;
    
    changes: Observable<BreakpointEvent>;
    resize: Observable<WindowSize>;
    
    constructor (private ngZone, breakpoints?: BreakpointConfig) {
        
        this.setBreakpoints(breakpoints);
        
        this.resize = Observable.fromEvent(window, 'resize').map(this.getWindowSize).distinctUntilChanged();
        
        const initialBreakpoint = this.getBreakpoint(window.innerWidth);
        this.changesSubject = new BehaviorSubject<BreakpointEvent>(this.getBreakpointEvent(initialBreakpoint));
        this.changes = this.changesSubject.distinctUntilChanged((x, y) => x.name === y.name);
        this.subscribe();
    }

    // Unsubscribe to the resize event
    public unsubscribe () {
        
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }    
    
    // Subscribe to the resize event
    public subscribe () {
        
        if (this.subscription) {
            return;
        }
        
        // Make sure resize event doesn't trigger change detection by running outside of angular zone
        this.ngZone.runOutsideAngular(() => {
            
            this.subscription = this.resize.subscribe((size: WindowSize) => {
                
                const breakpoint: string = this.getBreakpoint(size.width);
                
                if (breakpoint === this.lastBreakpoint) {
                    return;
                }
                
                this.lastBreakpoint = breakpoint;
                
                // Emitting back in angular zone
                this.ngZone.run(() => {
                    this.changesSubject.next(this.getBreakpointEvent(breakpoint));
                });
            });
        });
        
    }
    
    // Sets the customized breakpoints
    private setBreakpoints (breakpoints?: BreakpointConfig) {
        
        if (breakpoints) {
            this.breakpoints = breakpoints;
        }
    }
    
    
    // Returns a breakpoint event, with the fallback breakpoint if none were found
    private getBreakpointEvent (name: string): BreakpointEvent {
        
        if (!name) {
            return { name: 'default', breakpoint: FALLBACK_BREAKPOINT, size: this.getWindowSize() };
        }
        else {
            return { name: name, breakpoint: this.breakpoints[name], size: this.getWindowSize() };
        }
    }
    
    // Returns the current window size
    private getWindowSize (): WindowSize {
        
        return { width: window.innerWidth, height: window.innerHeight };
    }
    
    
    // Returns the first breakpoint that match the current size
    private getBreakpoint (currentSize: number): string {
        
        const keys = Object.keys(this.breakpoints);
        for (const key of keys) {
            const value = this.breakpoints[key];
            const min = value.min || 0;
            const max = value.max || Number.MAX_SAFE_INTEGER;
            
            if (currentSize >= min && currentSize < max) {
                return key;
            }
        }
        
        return null;
    }
}

